/**
 * Headless smoke tests for the easelbone example pages.
 *
 * For every example page, in both default and dirty-rendering mode:
 *  - fails on console errors and uncaught page errors
 *  - fails on failed same-origin requests (external requests are ignored;
 *    CI runners may block them)
 *  - fails when the canvas is blank after the page settles
 *  - logs window.__benchmark perf numbers when the page exposes them
 *    (informational only, never asserted)
 *
 * Usage: node tools/smoke-test.js [baseUrl]
 * Default baseUrl: http://localhost:8080
 */
var chromium = require('playwright').chromium;

var PAGES = [
    'examples/controls.html',
    'examples/scroll.html',
    'examples/float.html',
    'examples/alphamask.html',
    'examples/background.html',
    'examples/bigtext.html',
    'examples/emoji.html'
];

var MODES = ['', '?dirtyRendering=1'];
var SETTLE_MS = 4000;

async function testPage(browser, baseUrl, url) {
    var page = await browser.newPage();
    var errors = [];
    var origin = baseUrl.split('/').slice(0, 3).join('/');

    page.on('console', function (msg) {
        if (msg.type() === 'error') {
            errors.push('console: ' + msg.text());
        }
    });
    page.on('pageerror', function (err) {
        errors.push('pageerror: ' + err.message);
    });
    page.on('requestfailed', function (req) {
        if (req.url().indexOf(origin) === 0) {
            errors.push('requestfailed: ' + req.url() + ' (' + req.failure().errorText + ')');
        }
    });

    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(SETTLE_MS);

    try {
        var distinctPixels = await page.evaluate(function () {
            var canvas = document.querySelector('canvas');
            if (!canvas) {
                return null;
            }
            var ctx = canvas.getContext('2d');
            var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            var distinct = {};
            // Sample ~1000 pixels spread over the canvas.
            var pixelCount = data.length / 4;
            var step = Math.max(1, Math.floor(pixelCount / 1000)) * 4;
            for (var i = 0; i < data.length; i += step) {
                distinct[data[i] + ',' + data[i + 1] + ',' + data[i + 2] + ',' + data[i + 3]] = true;
            }
            return Object.keys(distinct).length;
        });

        if (distinctPixels === null) {
            errors.push('no canvas element found');
        } else if (distinctPixels < 2) {
            errors.push('canvas appears blank (' + distinctPixels + ' distinct sampled pixel values)');
        }
    } catch (e) {
        errors.push('pixel check failed: ' + e.message);
    }

    var bench = await page.evaluate(function () {
        return window.__benchmark || null;
    });
    if (bench) {
        console.log('  perf: ' + JSON.stringify(bench));
    }

    await page.close();
    return errors;
}

(async function main() {
    var baseUrl = process.argv[2] || 'http://localhost:8080';
    var browser = await chromium.launch();
    var failures = 0;

    for (var p = 0; p < PAGES.length; p++) {
        for (var m = 0; m < MODES.length; m++) {
            var url = baseUrl + '/' + PAGES[p] + MODES[m];
            var errors;
            try {
                errors = await testPage(browser, baseUrl, url);
            } catch (err) {
                errors = ['harness exception: ' + err.message];
            }
            if (errors.length) {
                failures++;
                console.error('FAIL ' + url);
                errors.forEach(function (e) { console.error('  ' + e); });
            } else {
                console.log('PASS ' + url);
            }
        }
    }

    await browser.close();
    if (failures) {
        console.error(failures + ' page(s) failed');
        process.exit(1);
    }
    console.log('All pages passed');
})().catch(function (err) {
    console.error(err);
    process.exit(1);
});
