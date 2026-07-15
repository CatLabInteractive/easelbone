/**
 * Behavioral test for Pinner suppression (park-at-anchor).
 *
 * Renders tools/fixtures/pin-suppress.html headlessly.
 *
 * Semantics under test: while a stage is suppressed, pinned objects are
 * PARKED back into their anchors (regular spot, regular z-order) -- not
 * hidden. Unsuppressing lifts them back into their pin wrappers.
 *
 * Usage: node tools/pin-suppress-test.js [port]
 */
var spawn = require('child_process').spawn;
var chromium = require('playwright').chromium;

var FIXTURE = 'tools/fixtures/pin-suppress.html';
var PORT = parseInt(process.argv[2], 10) || 8127;

function pixel(page, x, y) {
    return page.evaluate(function (p) {
        var ctx = document.getElementById('canvas').getContext('2d');
        var d = ctx.getImageData(p.x, p.y, 1, 1).data;
        return [d[0], d[1], d[2]];
    }, { x: x, y: y });
}

function isGreen(rgb) { return rgb[1] > 150 && rgb[0] < 100 && rgb[2] < 100; }
function isBlue(rgb) { return rgb[2] > 150 && rgb[0] < 100 && rgb[1] < 100; }

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

        // Baseline: pinned + lifted. Green above the blue occluder at the
        // anchor spot (125,125); record obj lives in the wrapper.
        var spot = await pixel(page, 125, 125);
        if (!isGreen(spot)) { failures.push('baseline: expected GREEN at (125,125), got ' + spot); }
        if ((await page.evaluate('window.__pinnedParent()')) !== 'wrapper') { failures.push('baseline: obj should be in wrapper'); }
        if ((await page.evaluate('window.__pinnedToTop()')) !== true) { failures.push('baseline: _pinnedToTop should be true'); }

        // Manual flag on -> PARKED: obj back in the anchor (regular spot,
        // under the occluder -> BLUE), _pinnedToTop false, record kept.
        await page.evaluate('window.__setPinsHidden(true)');
        spot = await pixel(page, 125, 125);
        if (!isBlue(spot)) { failures.push('parked: expected BLUE at (125,125), got ' + spot); }
        if ((await page.evaluate('window.__pinnedParent()')) !== 'anchor') { failures.push('parked: obj should be in anchor'); }
        if ((await page.evaluate('window.__pinnedToTop()')) !== false) { failures.push('parked: _pinnedToTop should be false'); }
        if ((await page.evaluate('window.__pinnedCount()')) !== 1) { failures.push('parked: record must be kept'); }

        // A pin created WHILE suppressed starts parked (replaces the old
        // record on the same anchor -> still exactly 1 record).
        await page.evaluate('window.__pinNewBox()');
        if ((await page.evaluate('window.__pinnedCount()')) !== 1) { failures.push('pin-while-parked: expected 1 record'); }
        if ((await page.evaluate('window.__pinnedParent()')) !== 'anchor') { failures.push('pin-while-parked: obj should start in anchor'); }
        spot = await pixel(page, 125, 125);
        if (!isBlue(spot)) { failures.push('pin-while-parked: expected BLUE at (125,125), got ' + spot); }

        // Manual flag off -> UNPARKED: lifted again, green on top.
        await page.evaluate('window.__setPinsHidden(false)');
        spot = await pixel(page, 125, 125);
        if (!isGreen(spot)) { failures.push('unparked: expected GREEN at (125,125), got ' + spot); }
        if ((await page.evaluate('window.__pinnedParent()')) !== 'wrapper') { failures.push('unparked: obj should be back in wrapper'); }
        if ((await page.evaluate('window.__pinnedToTop()')) !== true) { failures.push('unparked: _pinnedToTop should be true'); }

        if (errors.length) { failures.push('page errors: ' + errors.join(' | ')); }
    } finally {
        await browser.close();
        server.kill();
    }
    if (failures.length) {
        console.error('FAIL pin-suppress-test:\n  - ' + failures.join('\n  - '));
        process.exit(1);
    }
    console.log('PASS pin-suppress-test');
}

main().catch(function (e) { console.error(e); process.exit(1); });
