// Verifies a pinned Placeholder stays in the pin layer despite
// Placeholder.updateZIndex re-inserting inner placeholders each tick.
// Serves the repo root itself. Usage: node tools/pin-placeholder-test.js [port]
var spawn = require('child_process').spawn;
var chromium = require('playwright').chromium;

var FIXTURE = 'tools/fixtures/pin-placeholder.html';
var PORT = parseInt(process.argv[2], 10) || 8171;

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

        var initial = await page.evaluate('window.__centerRGB()');
        if (!isGreen(initial)) { failures.push('expected pinned placeholder GREEN at (125,125), got ' + initial); }

        // Run several ticks so Placeholder.updateZIndex fires repeatedly.
        await page.evaluate('window.__tick()');
        var afterTicks = await page.evaluate('window.__centerRGB()');
        var inPinLayer = await page.evaluate('window.__placeholderInPinLayer()');
        if (!isGreen(afterTicks)) { failures.push('after ticks: expected GREEN to stay on top at (125,125), got ' + afterTicks + ' (updateZIndex dragged the placeholder back below the occluder)'); }
        if (!inPinLayer) { failures.push('after ticks: expected pinned placeholder to remain in the pin layer'); }

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
