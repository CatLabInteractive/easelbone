/**
 * Behavioral test for EmojiText's image placement inside BigText.
 *
 * Renders tools/fixtures/bigtext-emoji.html headlessly, where the emoji
 * "🟥" is a solid red image and the text is white, and measures where each
 * colour's ink lands:
 *  - an emoji-only text must sit centred in its container, both ways
 *    (BigText centres the line box; the image must be centred on it)
 *  - an emoji inside a line of text must sit on the text's vertical centre
 *    (it used to hang from the bottom of the line box, so an image taller
 *    than the line rose above the text once the fonts' manual offsets
 *    went away)
 *
 * Serves the repository root itself (node_modules/.bin/http-server when
 * installed, else python3 -m http.server); no external server needed.
 *
 * Usage: node tools/emoji-test.js [port]
 * Default port: 8125
 */
var spawn = require('child_process').spawn;
var fs = require('fs');
var path = require('path');
var chromium = require('playwright').chromium;

var FIXTURE = 'tools/fixtures/bigtext-emoji.html';
var CENTER_TOLERANCE_PX = 10;

/**
 * Load the fixture with the given query string and return the bounding box
 * of the red ink (the emoji image) and of the white ink (the text), with
 * the container rectangle the fixture rendered into.
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

            function box() {
                return {top: Infinity, bottom: -Infinity, left: Infinity, right: -Infinity};
            }
            function grow(b, x, y) {
                if (x < b.left) { b.left = x; }
                if (x > b.right) { b.right = x; }
                if (y < b.top) { b.top = y; }
                if (y > b.bottom) { b.bottom = y; }
            }
            function done(b) {
                return b.right < b.left ? null : b;
            }

            var red = box();
            var white = box();
            for (var y = 0; y < canvas.height; y++) {
                for (var x = 0; x < canvas.width; x++) {
                    var i = (y * canvas.width + x) * 4;
                    var r = data[i], g = data[i + 1], b = data[i + 2];
                    if (r > 150 && g < 90 && b < 90) {
                        grow(red, x, y);
                    } else if (r > 150 && g > 150 && b > 150) {
                        grow(white, x, y);
                    }
                }
            }

            return {red: done(red), white: done(white), container: window.__container};
        });

        result.errors = errors;
        return result;
    } finally {
        await page.close();
    }
}

function gaps(ink, c) {
    return {
        top: ink.top - c.y,
        bottom: (c.y + c.height) - ink.bottom,
        left: ink.left - c.x,
        right: (c.x + c.width) - ink.right
    };
}

function middle(ink) {
    return (ink.top + ink.bottom) / 2;
}

async function runScenarios(baseUrl) {
    // CHROMIUM_EXECUTABLE: use an already installed Chromium (or headless
    // shell) when Playwright's own download is not available.
    var browser = await chromium.launch(process.env.CHROMIUM_EXECUTABLE
        ? {executablePath: process.env.CHROMIUM_EXECUTABLE}
        : {});
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
                name: 'an emoji-only text is centred in its container',
                query: '?text=' + encodeURIComponent('🟥'),
                assert: function (result) {
                    var g = gaps(result.red, result.container);
                    check(this.name,
                        Math.abs(g.top - g.bottom) <= CENTER_TOLERANCE_PX &&
                        Math.abs(g.left - g.right) <= CENTER_TOLERANCE_PX,
                        JSON.stringify(g));
                }
            },
            {
                // A short line box: the image follows the line, not the
                // platform's emoji glyph (on an iPhone that glyph is wider than
                // a normal line is tall; hanging from the line's bottom, the
                // image rose above the centre and out of its box).
                name: 'an emoji-only text stays centred and inside with a short line box',
                query: '?text=' + encodeURIComponent('🟥') + '&lineHeightFactor=0.6',
                assert: function (result) {
                    var g = gaps(result.red, result.container);
                    check(this.name,
                        Math.abs(g.top - g.bottom) <= CENTER_TOLERANCE_PX &&
                        Math.abs(g.left - g.right) <= CENTER_TOLERANCE_PX &&
                        g.top >= 0 && g.bottom >= 0,
                        JSON.stringify(g));
                }
            },
            {
                name: 'an emoji-only text is centred in a wide, short container too',
                query: '?text=' + encodeURIComponent('🟥') + '&w=700&h=80',
                assert: function (result) {
                    var g = gaps(result.red, result.container);
                    check(this.name,
                        Math.abs(g.top - g.bottom) <= CENTER_TOLERANCE_PX &&
                        Math.abs(g.left - g.right) <= CENTER_TOLERANCE_PX,
                        JSON.stringify(g));
                }
            },
            {
                name: 'an emoji in a line of text sits on the text\'s vertical centre',
                query: '?text=' + encodeURIComponent('xo 🟥 xo') + '&w=700&h=120',
                assert: function (result) {
                    if (!result.white) {
                        check(this.name, false, 'no text ink drawn');
                        return;
                    }
                    var redHeight = result.red.bottom - result.red.top;
                    var offset = middle(result.red) - middle(result.white);
                    // x-height letters: their centre is the line's visual middle.
                    check(this.name, Math.abs(offset) <= Math.max(CENTER_TOLERANCE_PX, redHeight * 0.2),
                        'emojiMiddle=' + middle(result.red) + ' textMiddle=' + middle(result.white) +
                        ' emojiHeight=' + redHeight);
                }
            },
            {
                name: 'the emoji image keeps its aspect ratio',
                query: '?text=' + encodeURIComponent('🟥') + '&w=300&h=300',
                assert: function (result) {
                    var w = result.red.right - result.red.left + 1;
                    var h = result.red.bottom - result.red.top + 1;
                    check(this.name, Math.abs(w - h) <= 2, 'width=' + w + ' height=' + h);
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
            } else if (!result.red) {
                check(scenario.name, false, 'no emoji ink drawn on canvas');
            } else {
                scenario.assert(result);
            }
        }
    } finally {
        await browser.close();
    }

    return failures;
}

function startServer(root, port) {
    var serverBin = path.join(root, 'node_modules', '.bin', 'http-server');
    if (fs.existsSync(serverBin)) {
        return spawn(serverBin, ['.', '-p', String(port), '--silent'], {cwd: root});
    }
    return spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], {cwd: root, stdio: 'ignore'});
}

(async function main() {
    var port = parseInt(process.argv[2], 10) || 8125;
    var root = path.join(__dirname, '..');

    var server = startServer(root, port);
    // Give the static server a moment to bind.
    await new Promise(function (resolve) { setTimeout(resolve, 1500); });

    var failures;
    try {
        failures = await runScenarios('http://127.0.0.1:' + port);
    } finally {
        server.kill();
    }

    if (failures.length) {
        console.error('\n' + failures.length + ' scenario(s) failed.');
        process.exit(1);
    }
    console.log('\nAll emoji placement scenarios passed.');
})().catch(function (err) {
    console.error(err);
    process.exit(1);
});
