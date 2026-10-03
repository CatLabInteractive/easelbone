/**
 * Behavioral test for touch input on app/examples/scroll.html:
 *  - Views.Root enables single-touch on its stage (createjs.Touch), so a
 *    finger produces mousedown / pressmove / pressup like a mouse
 *  - a tap clicks the row under it
 *  - dragging the content of a Controls.ScrollArea scrolls it, by touch and
 *    by mouse, without clicking the row the drag ends on
 *  - a press that wobbles less than the drag threshold is still a tap
 *  - a drag past either end clamps
 *  - a plain click after a drag clicks again (the content is hit-testable
 *    again once the release was handled)
 * Usage: node tools/touch-scroll-test.js [port]
 *   PW_CHANNEL / PW_EXECUTABLE pick the browser, as for the other tools.
 */
var spawn = require('child_process').spawn;
var chromium = require('playwright').chromium;

var PORT = parseInt(process.argv[2], 10) || 8129;

async function main() {
    var server = spawn('node', ['node_modules/http-server/bin/http-server', '.', '-p', String(PORT), '-c-1'], { stdio: 'ignore' });
    await new Promise(function (r) { setTimeout(r, 1500); });
    var browser = await chromium.launch({
        channel: process.env.PW_CHANNEL || undefined,
        executablePath: process.env.PW_EXECUTABLE || undefined
    });
    var failures = [];
    function check(cond, msg) {
        if (cond) { console.log('ok   ' + msg); } else { console.log('FAIL ' + msg); failures.push(msg); }
    }

    try {
        // A touch-capable context, large enough for the 1024x768 example.
        var context = await browser.newContext({ hasTouch: true, viewport: { width: 1100, height: 820 } });
        var page = await context.newPage();
        var pageErrors = [];
        page.on('pageerror', function (e) { pageErrors.push(e.message); });
        await page.goto('http://localhost:' + PORT + '/app/examples/scroll.html');
        await page.waitForFunction('window.__scroll && window.__scroll.ready', null, { timeout: 20000 });

        // Canvas (stage) pixels -> client pixels.
        var canvasRect = await page.evaluate(function () {
            var c = document.getElementById('container').getElementsByTagName('canvas')[0];
            var r = c.getBoundingClientRect();
            return { left: r.left, top: r.top, sx: r.width / c.width, sy: r.height / c.height };
        });
        function toClient(x, y) {
            return { x: canvasRect.left + (x * canvasRect.sx), y: canvasRect.top + (y * canvasRect.sy) };
        }

        var cdp = await context.newCDPSession(page);
        // One finger along `points` (canvas pixels), then lifted.
        async function finger(points) {
            var first = toClient(points[0].x, points[0].y);
            await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: first.x, y: first.y, id: 1 }] });
            for (var i = 1; i < points.length; i++) {
                var p = toClient(points[i].x, points[i].y);
                await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: p.x, y: p.y, id: 1 }] });
                await page.waitForTimeout(16);
            }
            await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
            await page.waitForTimeout(100);
        }
        function state() {
            return page.evaluate(function () {
                return {
                    scroll: window.__scroll.scroll(),
                    max: window.__scroll.max(),
                    clicks: window.__scroll.clicks.slice(),
                    win: window.__scroll.windowRect()
                };
            });
        }
        function itemRect(i) { return page.evaluate(function (i) { return window.__scroll.itemRect(i); }, i); }

        check(await page.evaluate('window.__scroll.touchEnabled()'), 'Views.Root enabled touch on the stage (createjs.Touch)');

        var s = await state();
        var win = s.win;
        check(s.max > 0, 'the example list is taller than its window (max scroll ' + Math.round(s.max) + ')');
        var start = s.scroll;
        check(start > 0, 'the example focused item 10, so the list starts scrolled (' + Math.round(start) + ')');

        // Tap the first row that is fully inside the window.
        var tapped = -1;
        for (var i = 0; i < 10; i++) {
            var r = await itemRect(i);
            if (r.y >= win.y && r.y + r.h <= win.y + win.h) { tapped = i; break; }
        }
        check(tapped >= 0, 'a row is fully visible (row ' + (tapped + 1) + ')');
        var tr = await itemRect(tapped);
        var tapPoint = { x: tr.x + (tr.w / 2), y: tr.y + (tr.h / 2) };
        await finger([tapPoint]);
        s = await state();
        check(s.clicks.join(',') === String(tapped), 'a tap clicks the row under it (' + s.clicks.join(',') + ')');
        check(Math.abs(s.scroll - start) < 1, 'a tap does not scroll (' + Math.round(s.scroll) + ')');

        // Drag the finger DOWN over the content from the bottom third of
        // the window: the content follows it, so the list scrolls up (back
        // towards item 1), and nothing is clicked.
        var y0 = win.y + (win.h * 0.7);
        var distance = win.h * 0.4;
        var points = [];
        for (var d = 0; d <= distance; d += distance / 12) { points.push({ x: win.x + (win.w / 2), y: y0 + d }); }
        await finger(points);
        s = await state();
        // The content follows the finger: the scroll (content units) is the
        // finger's travel (canvas pixels) over the view's scale.
        var scale = await page.evaluate('window.__scroll.scale()');
        var expected = distance / scale;
        check(Math.abs((start - s.scroll) - expected) < 4, 'a touch drag scrolls the content with the finger (' + Math.round(start) + ' -> ' + Math.round(s.scroll) + ', expected a change of ' + Math.round(expected) + ')');
        check(s.clicks.length === 1, 'a drag does not click the row it ends on (' + s.clicks.join(',') + ')');
        var afterDrag = s.scroll;

        // A wobble under the threshold is still a tap.
        tr = await itemRect(tapped);
        tapPoint = { x: tr.x + (tr.w / 2), y: tr.y + (tr.h / 2) };
        await finger([tapPoint, { x: tapPoint.x + 1, y: tapPoint.y + 2 }, { x: tapPoint.x + 2, y: tapPoint.y + 3 }]);
        s = await state();
        check(s.clicks.length === 2 && s.clicks[1] === tapped, 'a small wobble still clicks (' + s.clicks.join(',') + ')');
        check(Math.abs(s.scroll - afterDrag) < 1, 'a wobble does not scroll (' + Math.round(s.scroll) + ')');

        // Dragging further than there is content clamps at the start...
        points = [];
        for (var d2 = 0; d2 <= win.h * 0.8; d2 += win.h * 0.08) { points.push({ x: win.x + (win.w / 2), y: win.y + (win.h * 0.1) + d2 }); }
        await finger(points); await finger(points); await finger(points);
        s = await state();
        check(s.scroll === 0, 'dragging past the start clamps at 0 (' + Math.round(s.scroll) + ')');
        // ... and at the end.
        points.reverse();
        await finger(points); await finger(points); await finger(points); await finger(points); await finger(points);
        s = await state();
        check(Math.abs(s.scroll - s.max) < 1, 'dragging past the end clamps at the maximum (' + Math.round(s.scroll) + ' of ' + Math.round(s.max) + ')');
        check(s.clicks.length === 2, 'the long drags clicked nothing (' + s.clicks.join(',') + ')');

        // A mouse drag scrolls too, and does not click.
        var from = toClient(win.x + (win.w / 2), win.y + (win.h * 0.3));
        await page.mouse.move(from.x, from.y);
        await page.mouse.down();
        for (var k = 1; k <= 10; k++) {
            var to = toClient(win.x + (win.w / 2), win.y + (win.h * 0.3) + (k * win.h * 0.04));
            await page.mouse.move(to.x, to.y);
        }
        await page.mouse.up();
        await page.waitForTimeout(100);
        s = await state();
        check(s.scroll < s.max - (win.h * 0.3), 'a mouse drag scrolls the content (' + Math.round(s.scroll) + ')');
        check(s.clicks.length === 2, 'the mouse drag clicked nothing (' + s.clicks.join(',') + ')');

        // And a plain mouse click afterwards still clicks.
        var clickRow = -1;
        s = await state();
        for (var j = 0; j < 10; j++) {
            var rr = await itemRect(j);
            if (rr.y >= s.win.y && rr.y + rr.h <= s.win.y + s.win.h) { clickRow = j; break; }
        }
        var cr = await itemRect(clickRow);
        var cp = toClient(cr.x + (cr.w / 2), cr.y + (cr.h / 2));
        await page.mouse.click(cp.x, cp.y);
        await page.waitForTimeout(100);
        s = await state();
        check(s.clicks.length === 3 && s.clicks[2] === clickRow, 'a mouse click after the drags clicks its row (' + s.clicks.join(',') + ')');

        check(pageErrors.length === 0, 'no page errors (' + pageErrors.join(' | ') + ')');
    } catch (e) {
        failures.push(String(e && e.message || e));
        console.log('FAIL ' + (e && e.message || e));
    }

    await browser.close();
    server.kill();
    if (failures.length) {
        console.log(failures.length + ' failure(s)');
        process.exit(1);
    }
    console.log('touch-scroll OK');
}

main();
