/**
 * Behavioral test for Controls.Dropdown on app/examples/controls.html.
 *  - opening paints the popover ABOVE the example view (pixel check on the
 *    popover background colour inside the panel area, and on the highlighted
 *    row), and closing removes it again
 *  - 'down' moves the highlight, 'a' commits and fires 'change'
 *  - 'back' cancels: value unchanged, no 'change' event
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
