/**
 * Behavioral test for Pinner (pinToTop).
 *
 * Renders tools/fixtures/pin-baseline.html headlessly and checks:
 *  - the pinned GREEN box paints ON TOP of the BLUE occluder at the anchor
 *  - moving the anchor moves the pinned box with it
 *
 * Serves the repository root itself; no external server needed.
 * Usage: node tools/pin-test.js [port]
 */
var spawn = require('child_process').spawn;
var chromium = require('playwright').chromium;

var FIXTURE = 'tools/fixtures/pin-baseline.html';
var PORT = parseInt(process.argv[2], 10) || 8125;

function pixel(page, x, y) {
    return page.evaluate(function (p) {
        var ctx = document.getElementById('canvas').getContext('2d');
        var d = ctx.getImageData(p.x, p.y, 1, 1).data;
        return [d[0], d[1], d[2]];
    }, { x: x, y: y });
}

function isGreen(rgb) { return rgb[1] > 150 && rgb[0] < 100 && rgb[2] < 100; }

async function main() {
    var server = spawn('node', ['node_modules/http-server/bin/http-server', '.', '-p', String(PORT), '-c-1'], { stdio: 'ignore' });
    await new Promise(function (r) { setTimeout(r, 1500); });
    var browser = await chromium.launch();
    var failures = [];
    try {
        var page = await browser.newPage();
        var errors = [];
        page.on('pageerror', function (e) { errors.push(e.message); });
        page.on('console', function (m) { if (m.type() === 'error') errors.push(m.text()); });
        await page.goto('http://localhost:' + PORT + '/' + FIXTURE, { waitUntil: 'load', timeout: 30000 });
        await page.waitForFunction('window.__ready === true', { timeout: 10000 });

        // Anchor at (100,100), box 50x50 -> center (125,125) should be GREEN
        // (pinned box on top of the blue occluder).
        var center = await pixel(page, 125, 125);
        if (!isGreen(center)) { failures.push('expected GREEN at (125,125), got ' + center); }

        // Move anchor +100,+0 -> old center now blue, new center green.
        await page.evaluate('window.__moveAnchor(100, 0)');
        await page.waitForTimeout(200);
        var oldSpot = await pixel(page, 125, 125);
        var newSpot = await pixel(page, 225, 125);
        if (isGreen(oldSpot)) { failures.push('expected GREEN to have LEFT (125,125), still green'); }
        if (!isGreen(newSpot)) { failures.push('expected GREEN at moved (225,125), got ' + newSpot); }

        if (errors.length) { failures.push('page errors: ' + errors.join('; ')); }
        await page.close();
    } finally {
        await browser.close();
        server.kill();
    }
    if (failures.length) { console.error('FAIL\n' + failures.join('\n')); process.exit(1); }
    console.log('PASS');
}
main();
