/**
 * Behavioral test for Controls.Dropdown on app/examples/controls.html.
 *  - opening paints the popover ABOVE the example view (pixel check on the
 *    popover background colour inside the panel area, and on the highlighted
 *    row), and closing removes it again
 *  - 'down' moves the highlight, 'a' commits and fires 'change'
 *  - 'back' cancels: value unchanged, no 'change' event
 *  - a symbol near the bottom of the view opens a list that is clamped inside
 *    the canvas (every visible row still painted)
 *  - the wheel, over the panel, scrolls the list (the control's own canvas
 *    listener, not the Mousewheel singleton)
 *  - an OPEN list captures the navigation axis: Navigatable.next/previous do
 *    not move the focus but forward the press under the view's own navigation
 *    name (this example view is vertical, so 'down'/'up' move the highlight),
 *    and 'left'/'right' themselves do nothing - like a native <select>
 *  - a CLOSED list opens on 'up'/'down' without stepping the value
 *  - a long list (40 options, 6 rows) scrolls with the keyboard, the wheel and
 *    the scrollbar, highlights the row under the cursor, and draws a thumb that
 *    is sized and positioned by the visible window
 *  - clicking a row commits it even when a (5 Hz) mouseover tick repaints the
 *    highlight between the mousedown and the mouseup, and clicking outside the
 *    panel cancels
 * Usage: node tools/dropdown-test.js [port]
 */
var spawn = require('child_process').spawn;
var chromium = require('playwright').chromium;
var PORT = parseInt(process.argv[2], 10) || 8127;

function pixel(page, x, y) {
    return page.evaluate(function (p) {
        var ctx = document.getElementById('container').getElementsByTagName('canvas')[0].getContext('2d');
        var d = ctx.getImageData(p.x, p.y, 1, 1).data;
        return [d[0], d[1], d[2], d[3]];
    }, { x: x, y: y });
}

// The example popover paints #1e1e1e (30,30,30) opaque, highlight #555555.
function isBackground(rgb) {
    return rgb[3] === 255 && rgb[0] < 60 && rgb[1] < 60 && rgb[2] < 60;
}

// The scrollbar thumb paints #aaaaaa (170,170,170) opaque.
function isScrollbar(rgb) {
    return rgb[3] === 255 && Math.abs(rgb[0] - 170) < 25 && Math.abs(rgb[1] - 170) < 25 && Math.abs(rgb[2] - 170) < 25;
}

// Canvas (stage) pixels -> client pixels, for page.mouse.
function toClient(rect, x, y) {
    return { x: rect.left + (x * rect.sx), y: rect.top + (y * rect.sy) };
}

function isHighlight(rgb) {
    return rgb[3] === 255 && rgb[0] > 60 && rgb[0] < 120 && rgb[1] > 60 && rgb[1] < 120 && rgb[2] > 60 && rgb[2] < 120;
}

async function main() {
    var server = spawn('node', ['node_modules/http-server/bin/http-server', '.', '-p', String(PORT), '-c-1'], { stdio: 'ignore' });
    await new Promise(function (r) { setTimeout(r, 1500); });
    var browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined });
    var failures = [];
    try {
        var page = await browser.newPage();
        var errors = [];
        page.on('pageerror', function (e) { errors.push(String(e)); });
        page.on('console', function (m) {
            // The browser's automatic favicon request is not the page's doing.
            if (m.type() === 'error' && String(m.location().url).indexOf('favicon.ico') === -1) {
                errors.push(m.text());
            }
        });
        await page.goto('http://localhost:' + PORT + '/app/examples/controls.html');
        await page.waitForFunction('window.__dropdown && window.__dropdown.ready', null, { timeout: 20000 });

        var before = await page.evaluate('window.__dropdown.value()');
        await page.evaluate('window.__dropdown.key("a")');            // open
        await page.waitForTimeout(300);
        var open = await page.evaluate('window.__dropdown.isOpen()');
        if (!open) { failures.push('dropdown did not open on "a"'); }
        var panel = await page.evaluate('window.__dropdown.panelRect()'); // {x,y,w,h} in canvas pixels

        // The example view is scaled (800x600 assets in a 1024x768 canvas), so
        // the popover must land under the symbol in STAGE pixels, not in the
        // symbol's own (unscaled) coordinates.
        var anchor = await page.evaluate('window.__dropdown.anchorRect()');
        if (!(anchor.scale > 1.1)) { failures.push('example view is not scaled, the placement check is worthless: ' + anchor.scale); }
        if (Math.abs(panel.x - anchor.x) > 1) { failures.push('popover x ' + panel.x + ', expected ' + anchor.x); }
        if (Math.abs(panel.y - anchor.y) > 1) { failures.push('popover y ' + panel.y + ', expected ' + anchor.y); }
        if (Math.abs(panel.w - anchor.w) > 1) { failures.push('popover width ' + panel.w + ', expected ' + anchor.w); }

        // The rows are drawn in the symbol's coordinates too, so the whole
        // panel is exactly as tall as (rows x rowHeight) scaled.
        var rowHeight = await page.evaluate('window.__dropdown.rowHeight()');
        var rows = await page.evaluate('window.__dropdown.visibleRows()');
        var rowPx = rowHeight * anchor.scale;
        var expectedHeight = rows * rowPx;
        if (Math.abs(panel.h - expectedHeight) > 2) { failures.push('popover height ' + panel.h + ', expected ' + expectedHeight); }

        var probeX = Math.round(panel.x + 6);
        var probeY = Math.round(panel.y + 6);
        var rgb = await pixel(page, probeX, probeY);
        if (!isBackground(rgb)) { failures.push('popover not painted on top: ' + rgb.join(',')); }

        // ... and it is really PAINTED that tall: opaque just inside the bottom
        // edge, nothing just below it.
        var midX = Math.round(panel.x + (panel.w / 2));
        var insideBottom = await pixel(page, midX, Math.round(panel.y + expectedHeight - 4));
        var belowBottom = await pixel(page, midX, Math.round(panel.y + expectedHeight + 4));
        if (!isBackground(insideBottom)) { failures.push('popover does not paint down to its scaled bottom edge: ' + insideBottom.join(',')); }
        if (belowBottom[3] !== 0) { failures.push('popover paints past its scaled bottom edge: ' + belowBottom.join(',')); }

        // The selected value ('nl', the second row) starts highlighted, so the
        // second row paints the highlight colour and the first one does not.
        var highlighted = await pixel(page, probeX, Math.round(panel.y + rowPx + 6));
        if (!isHighlight(highlighted)) { failures.push('selected row is not highlighted: ' + highlighted.join(',')); }

        await page.evaluate('window.__dropdown.key("down")');
        await page.waitForTimeout(200);
        var movedFrom = await pixel(page, probeX, Math.round(panel.y + rowPx + 6));
        var movedTo = await pixel(page, probeX, Math.round(panel.y + (2 * rowPx) + 6));
        if (!isBackground(movedFrom)) { failures.push('"down" left the old row highlighted: ' + movedFrom.join(',')); }
        if (!isHighlight(movedTo)) { failures.push('"down" did not highlight the next row: ' + movedTo.join(',')); }

        await page.evaluate('window.__dropdown.key("a")');            // commit
        await page.waitForTimeout(200);
        var after = await page.evaluate('window.__dropdown.value()');
        var changes = await page.evaluate('window.__dropdown.changes()');
        if (after === before) { failures.push('commit did not change the value'); }
        if (changes !== 1) { failures.push('expected exactly one change event, got ' + changes); }
        if (await page.evaluate('window.__dropdown.isOpen()')) { failures.push('still open after commit'); }
        var closedPixel = await pixel(page, probeX, probeY);
        if (isBackground(closedPixel)) { failures.push('popover still painted after commit: ' + closedPixel.join(',')); }

        await page.evaluate('window.__dropdown.key("a")');            // open again
        await page.evaluate('window.__dropdown.key("down")');
        var swallowed = await page.evaluate('window.__dropdown.back()'); // onBack() result
        await page.waitForTimeout(200);
        if (swallowed !== true) { failures.push('onBack() did not report the press as consumed'); }
        if (await page.evaluate('window.__dropdown.value()') !== after) { failures.push('cancel changed the value'); }
        if (await page.evaluate('window.__dropdown.changes()') !== 1) { failures.push('cancel fired change'); }
        if (await page.evaluate('window.__dropdown.isOpen()')) { failures.push('still open after cancel'); }

        // Navigatable.triggerBack asks the active control first: an open list
        // swallows the press, a closed one lets it through to the view.
        await page.evaluate('window.__dropdown.focus()');
        await page.evaluate('window.__dropdown.key("a")');            // open again
        await page.evaluate('window.__dropdown.triggerViewBack()');
        await page.waitForTimeout(200);
        if (await page.evaluate('window.__dropdown.isOpen()')) { failures.push('triggerBack did not close the open list'); }
        if (await page.evaluate('window.__dropdown.viewBacks()') !== 0) { failures.push('the view saw a back press while the list was open'); }
        await page.evaluate('window.__dropdown.triggerViewBack()');
        if (await page.evaluate('window.__dropdown.viewBacks()') !== 1) { failures.push('the view did not receive the back press of a closed dropdown'); }
        if (await page.evaluate('window.__dropdown.back()') !== false) { failures.push('closed dropdown swallowed the back press'); }
        if (await page.evaluate('window.__dropdown.changes()') !== 1) { failures.push('triggerBack cancel fired change'); }

        // A symbol near the bottom of the view must not open a list that runs
        // off the canvas: the panel is clamped so every visible row shows.
        await page.evaluate('window.__dropdown.moveTo(470, 560)');
        await page.evaluate('window.__dropdown.key("a")');            // open low
        await page.waitForTimeout(300);
        if (!await page.evaluate('window.__dropdown.isOpen()')) { failures.push('the low dropdown did not open'); }
        var canvas = await page.evaluate('window.__dropdown.canvasSize()');
        var lowPanel = await page.evaluate('window.__dropdown.panelRect()');
        var lowAnchor = await page.evaluate('window.__dropdown.anchorRect()');
        if (!(lowAnchor.y + lowPanel.h > canvas.h)) { failures.push('the low dropdown would have fitted anyway, the clamp check is worthless'); }
        if (lowPanel.y + lowPanel.h > canvas.h + 1) { failures.push('popover runs off the canvas bottom: ' + (lowPanel.y + lowPanel.h) + ' > ' + canvas.h); }
        if (Math.abs(lowPanel.y - (canvas.h - lowPanel.h)) > 1) { failures.push('popover not clamped to the canvas bottom: y ' + lowPanel.y + ', expected ' + (canvas.h - lowPanel.h)); }
        var lowInsideBottom = await pixel(page, Math.round(lowPanel.x + (lowPanel.w / 2)), Math.round(lowPanel.y + lowPanel.h - 4));
        if (!isBackground(lowInsideBottom)) { failures.push('the clamped popover does not paint its last row: ' + lowInsideBottom.join(',')); }

        // The wheel is the control's own DOM listener on the canvas: it must
        // scroll the list while the pointer is over the panel.
        var canvasRect = await page.evaluate(function () {
            var c = document.getElementById('container').getElementsByTagName('canvas')[0];
            var r = c.getBoundingClientRect();
            return { left: r.left, top: r.top, sx: r.width / c.width, sy: r.height / c.height };
        });
        var scrollBefore = await page.evaluate('window.__dropdown.scrollTop()');
        await page.mouse.move(
            canvasRect.left + ((lowPanel.x + (lowPanel.w / 2)) * canvasRect.sx),
            canvasRect.top + ((lowPanel.y + (lowPanel.h / 2)) * canvasRect.sy)
        );
        await page.mouse.wheel(0, 120);
        await page.waitForTimeout(200);
        var scrollAfter = await page.evaluate('window.__dropdown.scrollTop()');
        if (scrollAfter !== scrollBefore + 1) { failures.push('wheel over the panel did not scroll the list: ' + scrollBefore + ' -> ' + scrollAfter); }
        await page.mouse.wheel(0, -120);
        await page.waitForTimeout(200);
        if (await page.evaluate('window.__dropdown.scrollTop()') !== scrollBefore) { failures.push('wheel up did not scroll the list back'); }

        await page.evaluate('window.__dropdown.back()');               // cancel
        await page.waitForTimeout(200);
        await page.evaluate('window.__dropdown.moveTo(470, 140)');
        if (await page.evaluate('window.__dropdown.changes()') !== 1) { failures.push('the clamp/wheel round fired change'); }

        // ---- focus capture: an open list owns the navigation axis ----
        // Park the cursor away from every panel first: with mouseover tracking
        // on, a stale pointer position keeps re-highlighting the row under it.
        await page.mouse.move(canvasRect.left + 5, canvasRect.top + 5);
        await page.waitForTimeout(150);

        var idx = await page.evaluate('window.__dropdown.index()');
        var steps = 0;
        while (steps < 20 && await page.evaluate('window.__dropdown.view.currentIndex()') !== idx) {
            await page.evaluate('window.__dropdown.view.next()');
            steps++;
        }
        if (await page.evaluate('window.__dropdown.view.currentIndex()') !== idx) { failures.push('could not focus the dropdown with view.next()'); }

        // Closed, the view still owns the axis (otherwise the capture check
        // below would pass for the wrong reason).
        await page.evaluate('window.__dropdown.view.previous()');
        if (await page.evaluate('window.__dropdown.view.currentIndex()') === idx) { failures.push('view.previous() did not leave the closed dropdown'); }
        await page.evaluate('window.__dropdown.view.next()');
        if (await page.evaluate('window.__dropdown.view.currentIndex()') !== idx) { failures.push('view.next() did not come back to the dropdown'); }

        await page.evaluate('window.__dropdown.key("a")');            // open
        await page.waitForTimeout(200);
        if (!await page.evaluate('window.__dropdown.isOpen()')) { failures.push('the dropdown did not open for the capture check'); }
        var capturedHighlight = await page.evaluate('window.__dropdown.highlight()');
        var capturedValue = await page.evaluate('window.__dropdown.value()');
        var count = await page.evaluate('window.__dropdown.count()');

        // The captured press is forwarded under the VIEW's own navigation name,
        // so what it does depends on the orientation: a vertical view forwards
        // 'down'/'up' (the highlight moves, like a native select under the same
        // arrow keys), a horizontal one 'right'/'left' (nothing happens). The
        // focus must stay put either way.
        var nav = await page.evaluate('window.__dropdown.view.navigation()');
        var vertical = nav[1] === 'down';
        if (nav.length !== 2 || (!vertical && nav[1] !== 'right')) { failures.push('unexpected view navigation controls: ' + nav.join(',')); }

        await page.evaluate('window.__dropdown.view.next()');
        await page.evaluate('window.__dropdown.view.next()');
        await page.waitForTimeout(150);
        if (await page.evaluate('window.__dropdown.view.currentIndex()') !== idx) { failures.push('view.next() moved the focus while the list was open'); }
        if (!await page.evaluate('window.__dropdown.isOpen()')) { failures.push('view.next() closed the open list'); }
        var afterNext = await page.evaluate('window.__dropdown.highlight()');
        var expectedAfterNext = vertical ? Math.min(count - 1, capturedHighlight + 2) : capturedHighlight;
        if (afterNext !== expectedAfterNext) { failures.push('2x captured view.next() (' + nav[1] + ') left the highlight at ' + afterNext + ', expected ' + expectedAfterNext); }
        if (await page.evaluate('window.__dropdown.value()') !== capturedValue) { failures.push('a captured view.next() changed the committed value'); }

        await page.evaluate('window.__dropdown.view.previous()');
        await page.evaluate('window.__dropdown.view.previous()');
        await page.waitForTimeout(150);
        if (await page.evaluate('window.__dropdown.view.currentIndex()') !== idx) { failures.push('view.previous() moved the focus while the list was open'); }
        var afterPrevious = await page.evaluate('window.__dropdown.highlight()');
        var expectedAfterPrevious = vertical ? Math.max(0, expectedAfterNext - 2) : capturedHighlight;
        if (afterPrevious !== expectedAfterPrevious) { failures.push('2x captured view.previous() (' + nav[0] + ') left the highlight at ' + afterPrevious + ', expected ' + expectedAfterPrevious); }

        // 'left'/'right' themselves are the cross axis of an open list: a native
        // select does nothing with them, and neither does this one.
        var beforeCrossAxis = await page.evaluate('window.__dropdown.highlight()');
        await page.evaluate('window.__dropdown.key("left")');
        await page.evaluate('window.__dropdown.key("right")');
        await page.waitForTimeout(150);
        if (await page.evaluate('window.__dropdown.highlight()') !== beforeCrossAxis) { failures.push('left/right moved the highlight of an open list'); }
        if (await page.evaluate('window.__dropdown.value()') !== capturedValue) { failures.push('left/right changed the value of an open list'); }
        if (!await page.evaluate('window.__dropdown.isOpen()')) { failures.push('left/right closed the open list'); }

        // Back where we started, so the commit below must not fire 'change'.
        if (beforeCrossAxis !== capturedHighlight) { failures.push('the captured navigation round did not return the highlight to ' + capturedHighlight + ': ' + beforeCrossAxis); }

        await page.evaluate('window.__dropdown.key("a")');            // commit
        await page.waitForTimeout(200);
        if (await page.evaluate('window.__dropdown.isOpen()')) { failures.push('the list stayed open after the capture commit'); }
        await page.evaluate('window.__dropdown.view.next()');
        await page.waitForTimeout(150);
        if (await page.evaluate('window.__dropdown.view.currentIndex()') === idx) { failures.push('the focus stayed captured after the list was committed'); }
        await page.evaluate('window.__dropdown.view.previous()');     // back on the dropdown
        if (await page.evaluate('window.__dropdown.changes()') !== 1) { failures.push('the capture round fired change'); }

        // ---- a CLOSED list opens on up/down, it does not step the value ----
        var beforeOpenKeys = await page.evaluate('window.__dropdown.value()');
        await page.evaluate('window.__dropdown.key("down")');
        await page.waitForTimeout(200);
        if (!await page.evaluate('window.__dropdown.isOpen()')) { failures.push('"down" did not open the closed list'); }
        if (await page.evaluate('window.__dropdown.value()') !== beforeOpenKeys) { failures.push('"down" changed the value of a closed list'); }
        await page.evaluate('window.__dropdown.key("b")');            // cancel
        await page.waitForTimeout(200);
        if (await page.evaluate('window.__dropdown.isOpen()')) { failures.push('"b" did not close the list opened with "down"'); }

        await page.evaluate('window.__dropdown.key("up")');
        await page.waitForTimeout(200);
        if (!await page.evaluate('window.__dropdown.isOpen()')) { failures.push('"up" did not open the closed list'); }
        await page.evaluate('window.__dropdown.key("b")');            // cancel
        await page.waitForTimeout(200);
        if (await page.evaluate('window.__dropdown.value()') !== beforeOpenKeys) { failures.push('opening a closed list with up/down changed the value'); }
        if (await page.evaluate('window.__dropdown.changes()') !== 1) { failures.push('opening a closed list with up/down fired change'); }

        // ---- the long list: 40 options in a 6 row window ----
        var d;
        await page.evaluate('window.__dropdown.long.key("a")');
        await page.waitForTimeout(300);
        if (!await page.evaluate('window.__dropdown.long.isOpen()')) { failures.push('the long dropdown did not open'); }
        var longPanel = await page.evaluate('window.__dropdown.long.panelRect()');
        if (longPanel.y + longPanel.h > canvas.h + 1) { failures.push('the long popover does not fit on the canvas: ' + (longPanel.y + longPanel.h) + ' > ' + canvas.h); }

        for (d = 0; d < 10; d++) { await page.evaluate('window.__dropdown.long.key("down")'); }
        await page.waitForTimeout(200);
        var longHighlight = await page.evaluate('window.__dropdown.long.highlight()');
        var longScroll = await page.evaluate('window.__dropdown.long.scrollTop()');
        if (longHighlight !== 10) { failures.push('10x "down" left the highlight at ' + longHighlight + ', expected 10'); }
        if (longScroll !== 5) { failures.push('10x "down" scrolled to ' + longScroll + ', expected 5'); }
        var hiRow = await page.evaluate('window.__dropdown.long.rowRect(5)');
        if (hiRow.y < longPanel.y - 1 || hiRow.y + hiRow.h > longPanel.y + longPanel.h + 1) {
            failures.push('the highlighted row is not inside the panel: row ' + hiRow.y + '..' + (hiRow.y + hiRow.h) + ', panel ' + longPanel.y + '..' + (longPanel.y + longPanel.h));
        }

        for (d = 0; d < 10; d++) { await page.evaluate('window.__dropdown.long.key("up")'); }
        await page.waitForTimeout(200);
        if (await page.evaluate('window.__dropdown.long.scrollTop()') !== 0) { failures.push('10x "up" did not scroll the long list back to the top'); }
        if (await page.evaluate('window.__dropdown.long.highlight()') !== 0) { failures.push('10x "up" did not move the highlight back to the first row'); }

        // The wheel scrolls it too, one row per notch.
        var wheelPoint = toClient(canvasRect, longPanel.x + (longPanel.w * 0.35), longPanel.y + (longPanel.h * 0.9));
        await page.mouse.move(wheelPoint.x, wheelPoint.y);
        await page.waitForTimeout(150);
        for (d = 0; d < 3; d++) { await page.mouse.wheel(0, 120); await page.waitForTimeout(80); }
        await page.waitForTimeout(150);
        var wheeled = await page.evaluate('window.__dropdown.long.scrollTop()');
        if (wheeled !== 3) { failures.push('3 wheel notches scrolled the long list to ' + wheeled + ', expected 3'); }
        for (d = 0; d < 3; d++) { await page.mouse.wheel(0, -120); await page.waitForTimeout(80); }
        await page.waitForTimeout(150);
        if (await page.evaluate('window.__dropdown.long.scrollTop()') !== 0) { failures.push('the wheel did not scroll the long list back to the top'); }

        // Hovering a row highlights it (visible row 2, whatever is scrolled).
        var hoverRow = await page.evaluate('window.__dropdown.long.rowRect(2)');
        var hoverPoint = toClient(canvasRect, hoverRow.x + (hoverRow.w * 0.35), hoverRow.y + (hoverRow.h / 2));
        await page.mouse.move(hoverPoint.x, hoverPoint.y);
        await page.waitForTimeout(400);
        var hoverScroll = await page.evaluate('window.__dropdown.long.scrollTop()');
        var hovered = await page.evaluate('window.__dropdown.long.highlight()');
        if (hovered !== hoverScroll + 2) { failures.push('hovering visible row 2 highlighted ' + hovered + ', expected ' + (hoverScroll + 2)); }

        // The scrollbar shows the window and pages on a track click.
        var thumb = await page.evaluate('window.__dropdown.long.thumbRect()');
        if (!thumb) {
            failures.push('a 40 item list has no scrollbar thumb');
        } else {
            var expectedThumbHeight = longPanel.h * (6 / 40);
            if (Math.abs(thumb.h - expectedThumbHeight) > 2) { failures.push('thumb height ' + thumb.h + ', expected ' + expectedThumbHeight); }
            if (Math.abs(thumb.y - longPanel.y) > 1) { failures.push('the thumb of an unscrolled list is not at the top: ' + thumb.y + ' vs ' + longPanel.y); }
            if (thumb.x + thumb.w > longPanel.x + longPanel.w + 1) { failures.push('the scrollbar is drawn outside the panel'); }

            // ... and it is really painted, in the scrollbar colour (#aaaaaa).
            var thumbPixel = await pixel(page, Math.round(thumb.x + (thumb.w / 2)), Math.round(thumb.y + (thumb.h / 2)));
            if (!isScrollbar(thumbPixel)) { failures.push('the scrollbar thumb is not painted: ' + thumbPixel.join(',')); }

            for (d = 0; d < 3; d++) { await page.mouse.wheel(0, 120); await page.waitForTimeout(80); }
            await page.waitForTimeout(150);
            var scrolledThumb = await page.evaluate('window.__dropdown.long.thumbRect()');
            if (!(scrolledThumb.y > thumb.y)) { failures.push('the thumb did not move down when the list scrolled: ' + thumb.y + ' -> ' + scrolledThumb.y); }
            if (Math.abs(scrolledThumb.h - thumb.h) > 1) { failures.push('the thumb changed height while scrolling'); }

            for (d = 0; d < 3; d++) { await page.mouse.wheel(0, -120); await page.waitForTimeout(80); }
            await page.waitForTimeout(150);
            if (await page.evaluate('window.__dropdown.long.scrollTop()') !== 0) { failures.push('the scrollbar round did not leave the list at the top'); }

            // Click the track well below the thumb: exactly one page down.
            var trackPoint = toClient(canvasRect, thumb.x + (thumb.w / 2), longPanel.y + (longPanel.h * 0.75));
            await page.mouse.click(trackPoint.x, trackPoint.y);
            await page.waitForTimeout(300);
            var paged = await page.evaluate('window.__dropdown.long.scrollTop()');
            if (paged !== 6) { failures.push('a click on the track below the thumb paged to ' + paged + ', expected 6'); }
            if (!await page.evaluate('window.__dropdown.long.isOpen()')) { failures.push('the track click closed the list'); }
        }

        await page.evaluate('window.__dropdown.long.key("b")');       // cancel
        await page.waitForTimeout(200);
        if (await page.evaluate('window.__dropdown.long.isOpen()')) { failures.push('the long list stayed open after "b"'); }
        await page.mouse.move(canvasRect.left + 5, canvasRect.top + 5);
        await page.waitForTimeout(150);

        // ---- clicking a row commits it, even across a mouseover tick ----
        // EaselJS only dispatches 'click' when the object under the mouseup is
        // the SAME object that was under the mousedown (Stage._handlePointerUp:
        // `if (target == oTarget)`). The hover highlight fires from the
        // enableMouseOver interval (5 Hz here, as in the game), so a highlight
        // change that rebuilt the rows would swap that object out from under a
        // press in progress and the row would never commit. Drive exactly that:
        // press on row 2, wander to row 3 and back while holding, release.
        await page.evaluate('window.__dropdown.long.key("a")');       // open
        await page.waitForTimeout(300);
        if (!await page.evaluate('window.__dropdown.long.isOpen()')) { failures.push('the long list did not open for the click check'); }
        var clickChangesBefore = await page.evaluate('window.__dropdown.long.changes()');
        var clickScroll = await page.evaluate('window.__dropdown.long.scrollTop()');
        var clickExpected = await page.evaluate('window.__dropdown.long.valueAt(' + (clickScroll + 2) + ')');
        var clickRow = await page.evaluate('window.__dropdown.long.rowRect(2)');
        var neighbourRow = await page.evaluate('window.__dropdown.long.rowRect(3)');
        var clickPoint = toClient(canvasRect, clickRow.x + (clickRow.w * 0.35), clickRow.y + (clickRow.h / 2));
        var neighbourPoint = toClient(canvasRect, neighbourRow.x + (neighbourRow.w * 0.35), neighbourRow.y + (neighbourRow.h / 2));

        await page.mouse.move(clickPoint.x, clickPoint.y);
        await page.waitForTimeout(400);                               // settle the highlight on row 2
        await page.mouse.down();
        await page.mouse.move(neighbourPoint.x, neighbourPoint.y);
        await page.waitForTimeout(400);                               // a mouseover tick, mid-press
        if (await page.evaluate('window.__dropdown.long.highlight()') !== clickScroll + 3) { failures.push('the highlight did not follow the cursor while the button was held'); }
        await page.mouse.move(clickPoint.x, clickPoint.y);
        await page.waitForTimeout(400);                               // and another, back on row 2
        await page.mouse.up();
        await page.waitForTimeout(300);
        if (await page.evaluate('window.__dropdown.long.isOpen()')) { failures.push('clicking a row did not close the list'); }
        if (await page.evaluate('window.__dropdown.long.value()') !== clickExpected) { failures.push('clicking visible row 2 committed ' + await page.evaluate('window.__dropdown.long.value()') + ', expected ' + clickExpected); }
        if (await page.evaluate('window.__dropdown.long.changes()') !== clickChangesBefore + 1) { failures.push('clicking a row did not fire exactly one change'); }

        // ---- clicking outside cancels ----
        if (await page.evaluate('window.__dropdown.long.isOpen()')) { await page.evaluate('window.__dropdown.long.key("b")'); }
        await page.evaluate('window.__dropdown.long.key("a")');       // open again
        await page.waitForTimeout(300);
        var outsideValue = await page.evaluate('window.__dropdown.long.value()');
        var outsideChanges = await page.evaluate('window.__dropdown.long.changes()');
        var outsidePanel = await page.evaluate('window.__dropdown.long.panelRect()');
        if (!outsidePanel) {
            failures.push('the long list is not open for the outside-click check');
        } else {
            // Empty canvas well to the left of the panel (and inside the browser
            // viewport, or the click would never be delivered).
            var outsideX = 10;
            var outsideY = outsidePanel.y + 10;
            if (outsideX >= outsidePanel.x && outsideX <= outsidePanel.x + outsidePanel.w &&
                outsideY >= outsidePanel.y && outsideY <= outsidePanel.y + outsidePanel.h) {
                failures.push('the "outside" click point is inside the panel, the cancel check is worthless');
            }
            var outsidePoint = toClient(canvasRect, outsideX, outsideY);
            var viewport = page.viewportSize();
            if (viewport && (outsidePoint.x > viewport.width || outsidePoint.y > viewport.height)) {
                failures.push('the "outside" click point is off the viewport, the cancel check is worthless');
            }
            await page.mouse.click(outsidePoint.x, outsidePoint.y);
            await page.waitForTimeout(300);
            if (await page.evaluate('window.__dropdown.long.isOpen()')) { failures.push('a click outside the panel did not close the list'); }
            if (await page.evaluate('window.__dropdown.long.value()') !== outsideValue) { failures.push('a click outside the panel changed the value'); }
            if (await page.evaluate('window.__dropdown.long.changes()') !== outsideChanges) { failures.push('a click outside the panel fired change'); }
        }

        await page.mouse.move(canvasRect.left + 5, canvasRect.top + 5);
        await page.waitForTimeout(150);

        // ---- style.width is in element units, scaled at open time ----
        // The long dropdown is given an explicit width in the symbol's own
        // nominalBounds space (see controls.html); the painted popover must
        // come out that many units wide, scaled by the same ancestor
        // transform _scale as every other metric.
        await page.evaluate('window.__dropdown.long.key("a")');       // open
        await page.waitForTimeout(300);
        if (!await page.evaluate('window.__dropdown.long.isOpen()')) { failures.push('the long list did not open for the width check'); }
        var widthPanel = await page.evaluate('window.__dropdown.long.panelRect()');
        var widthScale = await page.evaluate('window.__dropdown.long.scale()');
        var widthUnits = await page.evaluate('window.__dropdown.long.widthUnits()');
        if (!(widthScale > 1.1)) { failures.push('the long dropdown is not scaled, the style.width check is worthless: ' + widthScale); }
        var expectedWidthPx = widthUnits * widthScale;
        if (Math.abs(widthPanel.w - expectedWidthPx) > 2) {
            failures.push('style.width popover width ' + widthPanel.w + ', expected ' + expectedWidthPx + ' (width ' + widthUnits + ' units x scale ' + widthScale + ')');
        }
        await page.evaluate('window.__dropdown.long.key("b")');       // cancel
        await page.waitForTimeout(200);
        if (await page.evaluate('window.__dropdown.long.isOpen()')) { failures.push('the long list stayed open after the width check'); }
        await page.mouse.move(canvasRect.left + 5, canvasRect.top + 5);
        await page.waitForTimeout(150);

        // ---- the shared value model (Controls/Choice) ----
        // Both controls take their value list, their selection and their
        // accessors from Controls/Choice; neither may have lost any of it.
        if (await page.evaluate('typeof window.__easelbone.Controls.Choice')  !== 'function') {
            failures.push('easelbone.Controls.Choice is not exported');
        }
        if (!await page.evaluate('window.__dropdown.isChoice()')) { failures.push('the dropdown is not a Choice / a Base'); }
        if (!await page.evaluate('window.__selectbox.isChoice()')) { failures.push('the selectbox is not a Choice / a Base'); }

        // A dropdown without values answers null instead of throwing.
        var empty = await page.evaluate('window.__dropdown.emptyValues()');
        if (empty.getValue !== null) { failures.push('a valueless dropdown getValue() is ' + empty.getValue + ', expected null'); }
        if (empty.value !== null) { failures.push('a valueless dropdown .value is ' + empty.value + ', expected null'); }
        if (empty.text !== null) { failures.push('a valueless dropdown .text is ' + empty.text + ', expected null'); }
        if (empty.count !== 0) { failures.push('a valueless dropdown has ' + empty.count + ' values, expected 0'); }

        // The selectbox: the example gives it the map { 1: One, 2: Two, 3: Three }
        // and sets its text to 'Three' after a second. Wait that out first, so
        // the round trip below cannot race the example's own setTimeout.
        await page.waitForFunction("window.__selectbox && window.__selectbox.text() === 'Three'", null, { timeout: 10000 });
        if (await page.evaluate('window.__selectbox.count()') !== 3) { failures.push('the selectbox lost its values'); }
        if (String(await page.evaluate('window.__selectbox.value()')) !== '3') { failures.push('selectbox text setter selected ' + await page.evaluate('window.__selectbox.value()') + ', expected 3'); }

        await page.evaluate('window.__selectbox.setValue("1")');
        if (await page.evaluate('window.__selectbox.index()') !== 0) { failures.push('selectbox value setter did not select index 0'); }
        if (await page.evaluate('window.__selectbox.text()') !== 'One') { failures.push('selectbox value setter shows ' + await page.evaluate('window.__selectbox.text()') + ', expected One'); }

        await page.evaluate('window.__selectbox.next()');
        if (await page.evaluate('window.__selectbox.index()') !== 1) { failures.push('selectbox next() did not move to index 1'); }
        if (String(await page.evaluate('window.__selectbox.value()')) !== '2') { failures.push('selectbox next() selected ' + await page.evaluate('window.__selectbox.value()') + ', expected 2'); }

        await page.evaluate('window.__selectbox.previous()');
        if (await page.evaluate('window.__selectbox.index()') !== 0) { failures.push('selectbox previous() did not move back to index 0'); }
        await page.evaluate('window.__selectbox.previous()');       // repeat is off: stays put
        if (await page.evaluate('window.__selectbox.index()') !== 0) { failures.push('selectbox previous() wrapped around with repeat off'); }

        await page.evaluate('window.__selectbox.setIndex(2)');
        if (String(await page.evaluate('window.__selectbox.value()')) !== '3') { failures.push('selectbox index setter selected ' + await page.evaluate('window.__selectbox.value()') + ', expected 3'); }
        await page.evaluate('window.__selectbox.setValue("nope")');  // unknown value: no move
        if (await page.evaluate('window.__selectbox.index()') !== 2) { failures.push('selectbox value setter moved on an unknown value'); }

        // The dropdown's value setter selects by lookup and repaints the
        // collapsed value in the control's own style colour.
        var changesBeforeSetter = await page.evaluate('window.__dropdown.changes()');
        await page.evaluate('window.__dropdown.setValue("de")');
        if (await page.evaluate('window.__dropdown.value()') !== 'de') { failures.push('dropdown value setter did not select de'); }
        if (await page.evaluate('window.__dropdown.textChildren()') !== 1) { failures.push('the collapsed value is not exactly one text object'); }
        if (await page.evaluate('window.__dropdown.textString()') !== 'Deutsch') { failures.push('the collapsed value reads ' + await page.evaluate('window.__dropdown.textString()') + ', expected Deutsch'); }
        if (await page.evaluate('window.__dropdown.textColor()') !== '#ffffff') { failures.push('the collapsed value is not painted in style.text: ' + await page.evaluate('window.__dropdown.textColor()')); }
        if (await page.evaluate('window.__dropdown.highlight()') !== 2) { failures.push('the dropdown value setter did not move the highlight'); }
        if (await page.evaluate('window.__dropdown.changes()') !== changesBeforeSetter) { failures.push('the dropdown value setter fired change'); }

        // ---- Controls.Button with no text placeholder ----
        // An icon-only button (its symbol's `.text` child cleared before the
        // control was constructed - see the example) must not throw, must
        // still click normally, and setText() on it must be a safe no-op.
        if (await page.evaluate('typeof window.__iconButton') !== 'object') {
            failures.push('window.__iconButton was not set up (constructing a text-less Button threw?)');
        } else {
            if (await page.evaluate('window.__iconButton.setTextThrew()')) { failures.push('setText() threw on a text-less button'); }
            if (await page.evaluate('window.__iconButton.clicks()') !== 0) { failures.push('icon button reports clicks before it was clicked'); }
            await page.evaluate('window.__iconButton.click()');
            if (await page.evaluate('window.__iconButton.clicks()') !== 1) { failures.push('icon button click did not reach its handler'); }

            // A normal button on the same page (button1) still renders its
            // label - the TextPlaceholder/BigText path is untouched.
            if (!await page.evaluate('window.__iconButton.normalButtonRendered()')) { failures.push('a normal button no longer renders its label'); }
        }

        // Tearing the view off the display list with the list open must take the
        // popover (a stage child) and its stage listener with it. Last step: it
        // destroys the example view.
        var stageChildrenClosed = await page.evaluate('window.__dropdown.stageChildren()');
        await page.evaluate('window.__dropdown.key("a")');            // open again
        await page.waitForTimeout(100);
        var stageChildrenOpen = await page.evaluate('window.__dropdown.stageChildren()');
        if (stageChildrenOpen !== stageChildrenClosed + 1) { failures.push('the open popover is not a stage child (' + stageChildrenClosed + ' -> ' + stageChildrenOpen + ')'); }

        await page.evaluate('window.__dropdown.removeView()');
        await page.waitForTimeout(200);
        if (await page.evaluate('window.__dropdown.isOpen()')) { failures.push('the list stayed open after its view was removed'); }
        var stageChildrenAfter = await page.evaluate('window.__dropdown.stageChildren()');
        if (stageChildrenAfter !== stageChildrenClosed) { failures.push('the popover was orphaned on the stage (' + stageChildrenClosed + ' -> ' + stageChildrenAfter + ')'); }
        if (await page.evaluate('window.__dropdown.changes()') !== 1) { failures.push('the teardown committed a value'); }

        if (errors.length) { failures.push('page errors: ' + errors.join(' | ')); }
    } finally {
        await browser.close();
        server.kill();
    }
    if (failures.length) { console.error('FAIL\n' + failures.join('\n')); process.exit(1); }
    console.log('OK dropdown');
}
main().catch(function (e) { console.error(e); process.exit(1); });
