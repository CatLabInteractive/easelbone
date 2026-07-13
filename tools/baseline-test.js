/**
 * Behavioral test for BigText vertical positioning.
 *
 * Renders tools/fixtures/bigtext-baseline.html headlessly and measures where
 * the glyph ink actually lands on the canvas:
 *  - without a manual font offset, the ink must be vertically centered in the
 *    container (single-line and multi-line)
 *  - with a manual offset registered via BigText.setFontOffset, the legacy
 *    positioning must still apply (ink visibly pushed off-center)
 *
 * Serves the repository root itself; no external server needed.
 *
 * Usage: node tools/baseline-test.js [port]
 * Default port: 8124
 */
var spawn = require('child_process').spawn;
var path = require('path');
var chromium = require('playwright').chromium;

var FIXTURE = 'tools/fixtures/bigtext-baseline.html';
var CENTER_TOLERANCE_PX = 10;

/**
 * Load the fixture with the given query string and return the ink bounding
 * box (canvas pixels brighter than the black background) together with the
 * container rectangle the fixture rendered into.
 */
async function measureInk(browser, baseUrl, query) {
    var page = await browser.newPage();
    var errors = [];

    try {
        page.on('pageerror', function (err) {
            errors.push('pageerror: ' + err.message);
        });
        page.on('console', function (msg) {
            if (msg.type() === 'error') {
                errors.push('console: ' + msg.text());
            }
        });

        await page.goto(baseUrl + '/' + FIXTURE + query, {waitUntil: 'load', timeout: 30000});
        await page.waitForFunction(function () {
            return window.__ready === true;
        }, null, {timeout: 15000});

        var result = await page.evaluate(function () {
            var canvas = document.querySelector('canvas');
            var ctx = canvas.getContext('2d');
            var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

            var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            for (var y = 0; y < canvas.height; y++) {
                for (var x = 0; x < canvas.width; x++) {
                    var i = (y * canvas.width + x) * 4;
                    if (data[i] + data[i + 1] + data[i + 2] > 100) {
                        if (x < minX) { minX = x; }
                        if (x > maxX) { maxX = x; }
                        if (y < minY) { minY = y; }
                        if (y > maxY) { maxY = y; }
                    }
                }
            }

            if (maxX < minX) {
                return {ink: null, container: window.__container};
            }
            return {
                ink: {top: minY, bottom: maxY, left: minX, right: maxX},
                container: window.__container
            };
        });

        result.errors = errors;
        return result;
    } finally {
        await page.close();
    }
}

function gaps(result) {
    var topGap = result.ink.top - result.container.y;
    var bottomGap = (result.container.y + result.container.height) - result.ink.bottom;
    return {top: topGap, bottom: bottomGap};
}

async function runScenarios(baseUrl) {
    var browser = await chromium.launch();
    var failures = [];

    function check(name, condition, detail) {
        if (condition) {
            console.log('PASS ' + name + ' (' + detail + ')');
        } else {
            failures.push(name);
            console.error('FAIL ' + name + ' (' + detail + ')');
        }
    }

    try {
        var scenarios = [
            {
                name: 'single line ink is vertically centered without manual offset',
                query: '?text=gyp',
                assert: function (result) {
                    var g = gaps(result);
                    check(this.name, Math.abs(g.top - g.bottom) <= CENTER_TOLERANCE_PX,
                        'topGap=' + g.top + ' bottomGap=' + g.bottom);
                }
            },
            {
                name: 'multi-line ink is vertically centered without manual offset',
                query: '?text=' + encodeURIComponent('gyp\ngyp'),
                assert: function (result) {
                    var g = gaps(result);
                    check(this.name, Math.abs(g.top - g.bottom) <= CENTER_TOLERANCE_PX,
                        'topGap=' + g.top + ' bottomGap=' + g.bottom);
                }
            },
            {
                name: 'manual setFontOffset still overrides automatic centering',
                query: '?text=gyp&offsetY=0.2',
                assert: function (result) {
                    var g = gaps(result);
                    check(this.name, (g.top - g.bottom) > 40,
                        'topGap=' + g.top + ' bottomGap=' + g.bottom);
                }
            }
        ];

        for (var i = 0; i < scenarios.length; i++) {
            var scenario = scenarios[i];
            var result;
            try {
                result = await measureInk(browser, baseUrl, scenario.query);
            } catch (err) {
                check(scenario.name, false, 'harness exception: ' + err.message);
                continue;
            }
            if (result.errors.length) {
                check(scenario.name, false, result.errors.join('; '));
            } else if (!result.ink) {
                check(scenario.name, false, 'no ink drawn on canvas');
            } else {
                scenario.assert(result);
            }
        }
    } finally {
        await browser.close();
    }

    return failures;
}

(async function main() {
    var port = parseInt(process.argv[2], 10) || 8124;
    var root = path.join(__dirname, '..');
    var serverBin = path.join(root, 'node_modules', '.bin', 'http-server');

    var server = spawn(serverBin, ['.', '-p', String(port), '--silent'], {cwd: root});
    // Give the static server a moment to bind.
    await new Promise(function (resolve) { setTimeout(resolve, 1500); });

    var failures;
    try {
        failures = await runScenarios('http://localhost:' + port);
    } finally {
        server.kill();
    }

    if (failures.length) {
        console.error(failures.length + ' scenario(s) failed');
        process.exit(1);
    }
    console.log('All scenarios passed');
})().catch(function (err) {
    console.error(err);
    process.exit(1);
});
