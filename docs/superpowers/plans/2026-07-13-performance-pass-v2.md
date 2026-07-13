# Performance Pass v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cut easelbone's per-frame CPU cost and asset-load time via hot-path micro-optimizations, parallel loading, and an opt-in dirty-rendering mode — all verified by a new Playwright smoke-test harness and benchmark page running in GitHub CI.

**Architecture:** easelbone is an AMD (RequireJS) browser library combining EaselJS and Backbone. There is **no unit-test infrastructure** and adding one is out of scope; the test layer for this plan is a Playwright smoke harness (built first, in Task 1) that loads every example page headlessly and asserts no console errors, no failed same-origin requests, and a non-blank canvas. Every subsequent task ends with the harness green plus benchmark numbers recorded. Dirty rendering splits EaselJS's combined tick-and-paint (`stage.tickOnUpdate = false`): the stage ticks every frame, but paints only when a dirty signal fired.

**Tech Stack:** RequireJS/AMD, EaselJS-NEXT, TweenJS-NEXT, PreloadJS-NEXT, Backbone, Grunt (build), Playwright + http-server (new devDependencies), GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-07-13-performance-pass-v2-design.md`

## Global Constraints

- Library source lives in `app/scripts/CatLab/`; AMD modules via `define()`. New modules follow the same pattern.
- Write ES5-style code (`var`, `function`) in library files to match the existing codebase (EmojiText has a few stray `let`s — don't add more).
- Match each file's existing indentation (this codebase mixes tabs and 4-space indents per file — copy what surrounds your edit).
- No new **runtime** dependencies. `playwright` and `http-server` are devDependencies only.
- Default behavior must not change: `dirtyRendering` defaults to `false`; with the flag off, `Root.tick` follows the exact same code path as today.
- The spec places the MovieClip hook in `Hacks.js`, but `Hacks.js` is dead code — nothing requires it (verified by grep). The hook goes in a new `Utilities/DirtyFlag.js` module required by `Views/Root.js` instead.
- Build with `npm run build` (grunt). The `dist/` directory is committed in this repo; rebuild + commit dist only in the final task.
- Local serving for verification: `npx http-server dist -p 8080 --silent` after a build. The smoke harness defaults to `http://localhost:8080`.

---

### Task 1: Playwright smoke-test harness

**Files:**
- Create: `tools/smoke-test.js`
- Modify: `package.json` (devDependencies + `smoke` script)

**Interfaces:**
- Produces: `npm run smoke` — exits 0 when all example pages pass, 1 otherwise. Takes an optional base URL argument (`node tools/smoke-test.js http://localhost:8080`). Task 3 appends `'examples/benchmark.html'` to the `PAGES` array. The harness already tests every page in both modes (`''` and `'?dirtyRendering=1'`); pages ignore the unknown query parameter until Tasks 9–10 wire it up, which is harmless.

- [ ] **Step 1: Add devDependencies and the smoke script**

In `package.json`, add to `devDependencies`:

```json
"http-server": "^14.1.1",
"playwright": "^1.45.0"
```

And add to `scripts`:

```json
"smoke": "node tools/smoke-test.js"
```

Run: `npm install && npx playwright install chromium`
Expected: installs succeed (Chromium download ~150MB on first run).

- [ ] **Step 2: Write the harness**

Create `tools/smoke-test.js`:

```js
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
            var errors = await testPage(browser, baseUrl, url);
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
```

- [ ] **Step 3: Run against the built site to verify it passes on current code**

```bash
npm run build
npx http-server dist -p 8080 --silent &
sleep 2
npm run smoke
kill %1
```

Expected: `PASS` for all 14 URL/mode combinations, `All pages passed`, exit 0. If a page fails on current master, investigate before proceeding — the harness must be green on unmodified code. (Note: `npm run build` may rewrite `dist/`; do not commit dist changes in this task — `git checkout dist` if it changed.)

- [ ] **Step 4: Verify the harness actually catches a blank page**

Run once against a bogus page to prove the failure path works:

```bash
npx http-server dist -p 8080 --silent &
sleep 2
node -e "
var s = require('fs').readFileSync('tools/smoke-test.js', 'utf8');
s = s.replace(/examples\/controls.html/, 'examples/doesnotexist.html');
require('fs').writeFileSync('/tmp/smoke-broken.js', s);
"
node /tmp/smoke-broken.js ; echo "exit: $?"
kill %1
```

Expected: `FAIL` on the doesnotexist URL, `exit: 1`.

- [ ] **Step 5: Commit**

```bash
git checkout dist 2>/dev/null || true
git add tools/smoke-test.js package.json package-lock.json
git commit -m "Add Playwright smoke-test harness for example pages"
```

---

### Task 2: CI workflow

**Files:**
- Create: `.github/workflows/test.yml`

**Interfaces:**
- Consumes: `npm run smoke` from Task 1.
- Produces: a required-checkable "Smoke Tests" job on PRs and master pushes.

- [ ] **Step 1: Write the workflow**

Create `.github/workflows/test.yml` (mirrors the install/build steps of the existing `deploy-pr.yml`):

```yaml
name: Smoke Tests

on:
  pull_request:
  push:
    branches:
      - master

jobs:
  smoke-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install npm dependencies
        run: npm install

      - name: Install bower dependencies
        run: npx bower install --allow-root

      - name: Build
        run: npm run build

      - name: Install Playwright browser
        run: npx playwright install --with-deps chromium

      - name: Serve built site
        run: |
          npx http-server dist -p 8080 --silent &
          sleep 2

      - name: Run smoke tests
        run: npm run smoke
```

- [ ] **Step 2: Validate the YAML locally**

Run: `node -e "console.log('ok')" && npx --yes js-yaml .github/workflows/test.yml > /dev/null && echo "yaml ok"`
Expected: `yaml ok`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/test.yml
git commit -m "CI: run headless smoke tests on PRs and master"
```

(The workflow can only be observed running once a PR is opened — final task verifies it.)

---

### Task 3: Benchmark page

**Files:**
- Create: `app/examples/benchmark.html`
- Modify: `app/index.html` (add an example card next to the existing ones at ~line 199-225)
- Modify: `tools/smoke-test.js` (add page to `PAGES`)

**Interfaces:**
- Consumes: `easelbone.Views.Root` `dirtyRendering` option (implemented in Task 9 — until then the option is silently ignored, which is fine: the page works, the toggle just has no effect).
- Produces: `window.__benchmark = { ticksPerSecond, paintsPerSecond, avgTickMs }`, refreshed every second — read by the smoke harness and by humans comparing before/after numbers in later tasks.

- [ ] **Step 1: Create the benchmark page**

Create `app/examples/benchmark.html`. Scene: an 8×6 grid of Animate `Placeholder` symbols each wrapped in an easelbone `Placeholder` holding a `BigText` (48 instances exercising the Placeholder + BigText hot paths), plus 6 `Cog` MovieClips that animate only when the "animate" checkbox is on.

```html
<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title>easelbone benchmark</title>
    <style>
        #stats { font-family: monospace; padding: 8px; background: #222; color: #0f0; }
        #controls { padding: 8px; font-family: sans-serif; }
    </style>
</head>
<body>

<div id="stats">waiting for first sample...</div>
<div id="controls">
    <label><input type="checkbox" id="animate"> animate movieclips</label>
    <label><input type="checkbox" id="dirty"> dirty rendering (reloads page)</label>
</div>

<div id="container" style="width: 1024px; height: 768px;"></div>

<script src="../scripts/vendor/requirejs/require.js"></script>
<script>

    var dirtyRendering = /[?&]dirtyRendering=1/.test(window.location.search);
    document.getElementById('dirty').checked = dirtyRendering;
    document.getElementById('dirty').addEventListener('change', function () {
        window.location.search = this.checked ? '?dirtyRendering=1' : '';
    });

    require.config({
        'baseUrl': '../scripts/',
        'urlArgs': 'bust=v2'
    });

    require(['main'], function (easelbone) {

        require.config({
            'paths': {
                'assets': '../examples/assets/easelboneassets'
            },
            'shim': {
                assets: { exports: "lib" }
            }
        });

        require(['backbone', 'easeljs', 'assets'], function (backbone, createjs, assets) {

            createjs.Ticker.timingMode = createjs.Ticker.RAF;

            var rootView = new easelbone.Views.Root({
                'container': document.getElementById('container'),
                'dirtyRendering': dirtyRendering
            });

            easelbone.setProperties(assets.properties);

            var loader = new easelbone.Loader();
            loader.loadAssets(assets, '../examples/assets/');

            // --- stats ---------------------------------------------------
            window.__benchmark = { ticksPerSecond: 0, paintsPerSecond: 0, avgTickMs: 0 };

            var tickCount = 0;
            var paintCount = 0;
            var tickTimeSum = 0;

            var originalUpdate = rootView.update.bind(rootView);
            rootView.update = function () {
                paintCount++;
                originalUpdate();
            };

            var originalTick = rootView.tick.bind(rootView);
            rootView.tick = function (event) {
                var start = performance.now();
                originalTick(event);
                tickTimeSum += performance.now() - start;
                tickCount++;
            };

            setInterval(function () {
                window.__benchmark.ticksPerSecond = tickCount;
                window.__benchmark.paintsPerSecond = paintCount;
                window.__benchmark.avgTickMs = tickCount ? (tickTimeSum / tickCount) : 0;

                document.getElementById('stats').textContent =
                    'ticks/s: ' + tickCount +
                    ' | paints/s: ' + paintCount +
                    ' | avg tick: ' + window.__benchmark.avgTickMs.toFixed(2) + 'ms' +
                    ' | dirtyRendering: ' + (dirtyRendering ? 'ON' : 'OFF');

                tickCount = 0;
                paintCount = 0;
                tickTimeSum = 0;
            }, 1000);

            // --- scene ---------------------------------------------------
            loader.load(function () {

                var cogs = [];

                var BenchmarkView = easelbone.Views.Base.extend({

                    render: function () {
                        var COLS = 8;
                        var ROWS = 6;
                        var CELL_W = 1024 / COLS;
                        var CELL_H = 640 / ROWS;

                        for (var row = 0; row < ROWS; row++) {
                            for (var col = 0; col < COLS; col++) {
                                var element = new assets.Placeholder();
                                element.x = col * CELL_W + 4;
                                element.y = row * CELL_H + 4;
                                element.scaleX = (CELL_W - 8) / 100;
                                element.scaleY = (CELL_H - 8) / 100;
                                this.el.addChild(element);

                                var placeholder = new easelbone.EaselJS.Placeholder(element);
                                placeholder.addChild(new createjs.BigText(
                                    'Cell ' + (row * COLS + col) + ' with some longer text',
                                    'Arial',
                                    '#333333'
                                ));
                            }
                        }

                        for (var c = 0; c < 6; c++) {
                            var cog = new assets.Cog();
                            cog.x = 80 + c * 160;
                            cog.y = 700;
                            cog.stop();
                            this.el.addChild(cog);
                            cogs.push(cog);
                        }
                    },

                    // With dirty rendering off, keep the always-paint
                    // behavior as the baseline. With it on, rely on the
                    // dirty signals.
                    tick: function () {
                        return !dirtyRendering;
                    }
                });

                document.getElementById('animate').addEventListener('change', function () {
                    var playing = this.checked;
                    cogs.forEach(function (cog) {
                        if (playing) { cog.play(); } else { cog.stop(); }
                    });
                });

                rootView.setView(new BenchmarkView());
            });
        });
    });

</script>
</body>
</html>
```

- [ ] **Step 2: Add the example card to `app/index.html`**

After the emoji card (which ends at line 225 with `</a>`), inside the same `<div class="examples">`, add:

```html
                <a class="example-card" href="examples/benchmark.html">
                    <h3>Benchmark</h3>
                    <p>Performance stress test with paint/tick statistics and a dirty-rendering toggle.</p>
                </a>
```

- [ ] **Step 3: Add the page to the smoke harness**

In `tools/smoke-test.js`, append to `PAGES`:

```js
    'examples/emoji.html',
    'examples/benchmark.html'
```

- [ ] **Step 4: Verify in browser and record baseline numbers**

```bash
npm run build
npx http-server dist -p 8080 --silent &
sleep 2
npm run smoke
kill %1
git checkout dist
```

Expected: all 16 URL/mode combinations PASS; the benchmark entries print a `perf:` line. **Record the `avgTickMs` and `paintsPerSecond` values** (both modes) — these are the baseline for Tasks 4-10. At this point both modes should show ~identical numbers (paints/s ≈ ticks/s ≈ 60) since dirty rendering doesn't exist yet.

- [ ] **Step 5: Commit**

```bash
git add app/examples/benchmark.html app/index.html tools/smoke-test.js
git commit -m "Add benchmark example page with paint/tick statistics"
```

---

### Task 4: Loader parallelism

**Files:**
- Modify: `app/scripts/CatLab/Easelbone/Utilities/Loader.js:20-24`

**Interfaces:**
- Produces: `new easelbone.Loader({ maxConnections: n })` — optional; defaults to 6. Caller-supplied queues (`options.queue`) are never modified.

- [ ] **Step 1: Set max connections on self-created queues**

In `Loader.js`, replace:

```js
		if (typeof(options.queue) === 'undefined') {
			this.queue = new createjs.LoadQueue(false);
		} else {
			this.queue = options.queue;
		}
```

with:

```js
		if (typeof(options.queue) === 'undefined') {
			this.queue = new createjs.LoadQueue(false);

			// PreloadJS defaults to a single connection; load assets in parallel.
			this.queue.setMaxConnections(
				typeof(options.maxConnections) !== 'undefined' ? options.maxConnections : 6
			);
		} else {
			this.queue = options.queue;
		}
```

- [ ] **Step 2: Verify parallel loading**

```bash
npm run build
npx http-server dist -p 8080 --silent &
sleep 2
npm run smoke
kill %1
git checkout dist
```

Expected: all pages PASS. Additionally, open `http://localhost:8080/examples/controls.html` in a browser with devtools Network open (or trust the smoke pass — the examples load a manifest of images through this code path, so a regression breaks them visibly).

- [ ] **Step 3: Commit**

```bash
git add app/scripts/CatLab/Easelbone/Utilities/Loader.js
git commit -m "Loader: load assets over 6 parallel connections (configurable)"
```

---

### Task 5: BigText — allocation-free change detection + normalized line-height cache

**Files:**
- Modify: `app/scripts/CatLab/Easelbone/EaselJS/DisplayObjects/BigText.js`

**Interfaces:**
- Consumes: nothing new.
- Produces: unchanged public API. `p.getLocationHash` is removed (grep-verified: only used by `hasChanged` internally). Internal helper signature changes: `getFontLineheight(font, fontSize)` (was `getFontLineheight(text, font)`).

- [ ] **Step 1: Replace hash-string change detection with field comparison**

Delete the `getLocationHash` method (lines 310-322) and replace `hasChanged` (lines 324-340) with:

```js
        /**
         * Determine if the dimensions or content have changed since last frame.
         * Field-by-field comparison — no string allocation per tick.
         * @returns {boolean}
         */
        p.hasChanged = function () {
            if (this.textElement && this.textElement._redrawRequested) {
                this.textElement._redrawRequested = false;
                return true;
            }

            var space = this.getAvailableSpace();
            var spaceWidth = Math.floor(space.width);
            var spaceHeight = Math.floor(space.height);

            if (
                this._lastSpaceWidth === spaceWidth &&
                this._lastSpaceHeight === spaceHeight &&
                this._lastText === this.textstring &&
                this._lastAlign === this._align &&
                this._lastFont === this._font &&
                this._lastColor === this._color
            ) {
                return false;
            }

            this._lastSpaceWidth = spaceWidth;
            this._lastSpaceHeight = spaceHeight;
            this._lastText = this.textstring;
            this._lastAlign = this._align;
            this._lastFont = this._font;
            this._lastColor = this._color;

            return true;
        };
```

Also delete the now-unused module-level `var hash;` and `var hasChanged = false;` declarations (lines 11-12), and the `this.lastHash` usage disappears with the old implementation.

(Note: the original used `parseInt` on the dimensions; `Math.floor` is equivalent for these non-negative numbers.)

- [ ] **Step 2: Normalize the font line-height cache per family**

Replace `measureLineHeight` and `measureLetter` (lines 98-111) and `getFontLineheight` (lines 113-119) with:

```js
        var REFERENCE_FONT_SIZE = 100;

        /**
         * Measured line-height per font family, normalized to font size 1.
         * Measuring once per family (instead of per family+size) keeps the
         * cache bounded and skips measureText calls in later fit-searches.
         */
        function getNormalizedLineHeight(font) {
            if (typeof (fontLineheightCache[font]) === 'undefined') {
                var ctx = createjs.Text._workingContext;
                ctx.save();
                ctx.font = REFERENCE_FONT_SIZE + 'px ' + font;
                fontLineheightCache[font] = Math.max(
                    ctx.measureText('M').width,
                    ctx.measureText('m').width
                ) * 1.2 / REFERENCE_FONT_SIZE;
                ctx.restore();
            }
            return fontLineheightCache[font];
        }

        function getFontLineheight(font, fontSize) {
            return getNormalizedLineHeight(font) * fontSize * BigText.getFontLineHeightFactor(font);
        }
```

Update the three call sites:

In `goBigOrGoHomeLinear` (line 233):
```js
                current.lineHeight = getFontLineheight(self._font, fontsize);
```

In `goBigOrGoHomeBinary` (line 287):
```js
				measureObj.lineHeight = getFontLineheight(this._font, midFontSize);
```

In `goBigOrGoHomeBinary` final fit (line 301):
```js
			bestFit.lineHeight = getFontLineheight(this._font, bestFontSize);
```

- [ ] **Step 3: Verify**

```bash
npm run build
npx http-server dist -p 8080 --silent &
sleep 2
npm run smoke
kill %1
```

Expected: all pages PASS (bigtext.html and emoji.html exercise this heavily). Open `http://localhost:8080/examples/bigtext.html` and visually confirm the text grid fills its boxes exactly as before (text sized to fit, centered). Compare the benchmark `avgTickMs` against the Task 3 baseline — it should drop or stay equal, never rise. Then `git checkout dist`.

- [ ] **Step 4: Commit**

```bash
git add app/scripts/CatLab/Easelbone/EaselJS/DisplayObjects/BigText.js
git commit -m "BigText: allocation-free change detection, per-family line-height cache"
```

---

### Task 6: Background — numeric change detection

**Files:**
- Modify: `app/scripts/CatLab/Easelbone/EaselJS/DisplayObjects/Background.js:125-141`

**Interfaces:**
- Produces: unchanged public API; `p.getLocationHash` removed (grep-verified internal-only). Per-instance `_lastSpaceWidth`/`_lastSpaceHeight` fields also fix a latent bug where the module-level `hash`/`hasChanged` vars were shared across instances.

- [ ] **Step 1: Replace the hash with numbers**

Delete `getLocationHash` (lines 125-128) and replace `hasChanged` (lines 130-141) with:

```js
        /**
         * Determine if the dimensions have changed since last frame.
         * @returns {boolean}
         */
        p.hasChanged = function () {
            var space = this.getAvailableSpace();
            var spaceWidth = Math.floor(space.width);
            var spaceHeight = Math.floor(space.height);

            if (
                this._lastSpaceWidth === spaceWidth &&
                this._lastSpaceHeight === spaceHeight
            ) {
                return false;
            }

            this._lastSpaceWidth = spaceWidth;
            this._lastSpaceHeight = spaceHeight;
            return true;
        };
```

Also delete the now-unused module-level `var hash;` and `var hasChanged = false;` (lines 9-10).

- [ ] **Step 2: Verify**

```bash
npm run build
npx http-server dist -p 8080 --silent &
sleep 2
npm run smoke
kill %1
git checkout dist
```

Expected: all pages PASS — `background.html` exercises this directly; confirm visually that fills/backgrounds still cover their areas at `http://localhost:8080/examples/background.html`.

- [ ] **Step 3: Commit**

```bash
git add app/scripts/CatLab/Easelbone/EaselJS/DisplayObjects/Background.js
git commit -m "Background: numeric change detection instead of hash strings"
```

---

### Task 7: Placeholder — cheaper z-index and bounds checks

**Files:**
- Modify: `app/scripts/CatLab/Easelbone/EaselJS/DisplayObjects/Placeholder.js`

**Interfaces:**
- Produces: unchanged public behavior. `getBoundsHash` removed (grep-verified: only used by `hasBoundsChanged`). The `bounds:change` event still fires exactly when width/height change.

- [ ] **Step 1: Remove the duplicate z-index maintenance from draw**

In the `element.draw` override (lines 65-71), remove the `this.updateZIndex();` call so it reads:

```js
            // Override the draw method of the original placeholder.
            element.draw = function (ctx, ignoreCache) {

                this.updateBounds();

                return element.original_draw.apply(element, arguments);
            };
```

(z-index is still maintained every frame by the `element._tick` override.)

- [ ] **Step 2: Replace the bounds hash with cached numbers**

Replace the `boundHash`/`oldBoundHash` declarations (lines 31-32) with:

```js
            var lastBoundsWidth = null;
            var lastBoundsHeight = null;
            var lastVerifiedIndex = -1;
```

Delete `this.getBoundsHash` (lines 73-81) and replace `this.hasBoundsChanged` (lines 83-89) with:

```js
            this.hasBoundsChanged = function () {
                var bounds = this.getBounds();
                if (!bounds) {
                    return false;
                }

                if (
                    bounds.width === lastBoundsWidth &&
                    bounds.height === lastBoundsHeight
                ) {
                    return false;
                }

                lastBoundsWidth = bounds.width;
                lastBoundsHeight = bounds.height;
                return true;
            };
```

- [ ] **Step 3: Skip the getChildIndex scans when nothing moved**

Replace `element.updateZIndex` (lines 100-113) with:

```js
            element.updateZIndex = function() {

                if (!element.children) {
                    return;
                }

                // Fast path: verify the cached position directly instead of
                // scanning the parent's children twice with getChildIndex.
                var siblings = element.parent.children;
                if (
                    lastVerifiedIndex > 0 &&
                    siblings[lastVerifiedIndex] === innerPlaceholder &&
                    siblings[lastVerifiedIndex - 1] === element
                ) {
                    return;
                }

                // check if order is still correct
                innerIndex = element.parent.getChildIndex(innerPlaceholder);
                originalIndex = element.parent.getChildIndex(element);

                if (originalIndex + 1 !== innerIndex) {
                    element.parent.addChildAt(innerPlaceholder, originalIndex + 1);
                }

                lastVerifiedIndex = originalIndex + 1;
            };
```

- [ ] **Step 4: Verify**

```bash
npm run build
npx http-server dist -p 8080 --silent &
sleep 2
npm run smoke
kill %1
```

Expected: all pages PASS. Manually open `http://localhost:8080/examples/controls.html` (placeholder-heavy) and confirm: controls render in the right places, slider drags, checkbox toggles, selectbox opens — placeholder content must appear *above* its host element (z-order intact). Compare benchmark `avgTickMs` to baseline — the 48-placeholder grid should tick measurably cheaper. Then `git checkout dist`.

- [ ] **Step 5: Commit**

```bash
git add app/scripts/CatLab/Easelbone/EaselJS/DisplayObjects/Placeholder.js
git commit -m "Placeholder: cache z-index position, numeric bounds comparison"
```

---

### Task 8: EmojiText — cached key list and dense emoji array

**Files:**
- Modify: `app/scripts/CatLab/Easelbone/EaselJS/DisplayObjects/EmojiText.js`

**Interfaces:**
- Produces: unchanged public API (`EmojiText.setEmojis` static, `p.setEmojis` instance). Internal: `this._emoji` becomes a dense array of `{ index: number, data: { replacement, src } }` instead of a sparse array — `_drawLineWithEmoji` is updated to match in the same task.

- [ ] **Step 1: Cache the sorted emoji key list**

After the `var emojiList = {};` declaration (line 11), add:

```js
		var emojiListVersion = 0;
		var sortedGlobalKeys = null;

		function byLengthDesc(a, b) {
			return b.length - a.length;
		}

		function getGlobalSortedKeys() {
			if (sortedGlobalKeys === null) {
				sortedGlobalKeys = Object.keys(emojiList).sort(byLengthDesc);
			}
			return sortedGlobalKeys;
		}
```

Replace the static setter (lines 26-28) with:

```js
		EmojiText.setEmojis = function (aEmojis) {
			emojiList = aEmojis;
			emojiListVersion++;
			sortedGlobalKeys = null;
		};
```

Replace the instance setter (lines 32-34) with:

```js
		p.setEmojis = function (aEmojis) {
			this._additionalEmojis = aEmojis;
			this._sortedKeys = null;
			this._lastReplacedText = null;
		};
```

In the constructor (after line 19, `this._additionalEmojis = {};`), add:

```js
			this._sortedKeys = null;
			this._sortedKeysVersion = -1;
```

Add a new method after the instance `setEmojis`:

```js
		/**
		 * Sorted (longest first) list of all emoji keys applicable to this
		 * instance. Cached; rebuilt only when the emoji lists change.
		 * @returns {Array}
		 * @private
		 */
		p._getSortedEmojiKeys = function () {
			var hasAdditional = false;
			for (var k in this._additionalEmojis) {
				if (this._additionalEmojis.hasOwnProperty(k)) {
					hasAdditional = true;
					break;
				}
			}

			if (!hasAdditional) {
				return getGlobalSortedKeys();
			}

			if (this._sortedKeys !== null && this._sortedKeysVersion === emojiListVersion) {
				return this._sortedKeys;
			}

			var merged = Object.assign({}, emojiList, this._additionalEmojis);
			this._sortedKeys = Object.keys(merged).sort(byLengthDesc);
			this._sortedKeysVersion = emojiListVersion;
			return this._sortedKeys;
		};
```

- [ ] **Step 2: Use the cache and a dense emoji array in `_replaceEmojis`**

In `_replaceEmojis` (lines 193-239), replace the merge+sort block:

```js
			var allEmojis = Object.assign({}, emojiList, this._additionalEmojis);

			// Sort emoji keys by length descending for longest match first
			var emojiKeys = Object.keys(allEmojis).sort(function (a, b) {
				return b.length - a.length;
			});
```

with:

```js
			var emojiKeys = this._getSortedEmojiKeys();
```

And replace the match bookkeeping line:

```js
							this._emoji[outputIndex] = replaced;
```

with:

```js
							this._emoji.push({ index: outputIndex, data: replaced });
```

- [ ] **Step 3: Iterate the dense array in `_drawLineWithEmoji`**

Replace the `for (var index in this._emoji)` loop (lines 131-146) with:

```js
			for (var e = 0; e < this._emoji.length; e++) {
				var entry = this._emoji[e];
				if (
					entry.index >= charCount &&
					entry.index < (charCount + str.length)
				) {
					this._drawEmoji(
						ctx,
						entry.data,
						strW * alignOffset + ctx.measureText(str.substring(0, entry.index - charCount)).width,
						y,
						lineHeight
					);
				}
			}
```

(The `this._emoji.length === 0` early-out at line 123 keeps working with a dense array.)

- [ ] **Step 4: Verify**

```bash
npm run build
npx http-server dist -p 8080 --silent &
sleep 2
npm run smoke
kill %1
git checkout dist
```

Expected: all pages PASS. Open `http://localhost:8080/examples/emoji.html` and confirm the emoji/flag test strings (`123🐈456🇧🇪789 AB🇧🇪CDE🐱FG`) render the same as on master (emoji visible as glyphs, text sized to boxes).

- [ ] **Step 5: Commit**

```bash
git add app/scripts/CatLab/Easelbone/EaselJS/DisplayObjects/EmojiText.js
git commit -m "EmojiText: cache sorted emoji keys, dense emoji index array"
```

---

### Task 9: Dirty rendering — DirtyFlag module and Root option

**Files:**
- Create: `app/scripts/CatLab/Easelbone/Utilities/DirtyFlag.js`
- Modify: `app/scripts/CatLab/Easelbone/Views/Root.js`
- Modify: `app/scripts/CatLab/Easelbone/EaselJS/DisplayObjects/BigText.js` (invalidate on redraw)
- Modify: `app/scripts/CatLab/Easelbone/EaselJS/DisplayObjects/EmojiText.js` (invalidate on emoji image load)

**Interfaces:**
- Consumes: `createjs.Tween.hasActiveTweens()` (present in vendored TweenJS-NEXT), `stage.tickOnUpdate` and `stage.tick(event)` (present in vendored EaselJS-NEXT), `MovieClip.prototype._tick` / `currentFrame`.
- Produces:
  - `DirtyFlag` module: `invalidate()`, `consume(): boolean`, `installMovieClipHook(createjs)`.
  - `new Root({ dirtyRendering: true })` option (default `false` — flag off keeps today's exact code path).
  - `root.invalidate()` public method.
  - `root.heartbeatInterval` property (ms, default 1000).

- [ ] **Step 1: Create the DirtyFlag module**

Create `app/scripts/CatLab/Easelbone/Utilities/DirtyFlag.js`:

```js
define(
    [],
    function () {
        "use strict";

        var invalidated = false;
        var movieClipHookInstalled = false;

        return {

            /**
             * Request a repaint on the next frame (dirty rendering mode).
             */
            invalidate: function () {
                invalidated = true;
            },

            /**
             * Read and clear the flag. Called once per frame by the root view.
             * @returns {boolean}
             */
            consume: function () {
                var value = invalidated;
                invalidated = false;
                return value;
            },

            /**
             * Wrap MovieClip._tick so any clip that actually advances a frame
             * marks the stage dirty. Installed once, and only when a root
             * view enables dirty rendering.
             * @param createjs
             */
            installMovieClipHook: function (createjs) {
                if (movieClipHookInstalled || typeof (createjs.MovieClip) === 'undefined') {
                    return;
                }
                movieClipHookInstalled = true;

                var originalTick = createjs.MovieClip.prototype._tick;
                createjs.MovieClip.prototype._tick = function (evtObj) {
                    var frameBefore = this.currentFrame;
                    originalTick.call(this, evtObj);
                    if (this.currentFrame !== frameBefore) {
                        invalidated = true;
                    }
                };
            }
        };
    }
);
```

- [ ] **Step 2: Wire the option into Root**

In `Root.js`, add the dependency:

```js
define(
    [
        'backbone',
        'easeljs',

        'CatLab/Easelbone/Views/Layer',
        'CatLab/Easelbone/Utilities/DirtyFlag'
    ],
    function (Backbone, createjs, Layer, DirtyFlag) {
```

In `initializeRootView`, after the `this.snapToPixel = ...` line (line 67), add:

```js
                this.dirtyRendering = typeof(options.dirtyRendering) !== 'undefined' ? !!options.dirtyRendering : false;
                this.heartbeatInterval = 1000;
                this._lastPaintTime = 0;

                if (this.dirtyRendering) {
                    // Split EaselJS's combined tick-and-paint: we tick the
                    // stage every frame ourselves and paint only when dirty.
                    this.stage.tickOnUpdate = false;

                    DirtyFlag.installMovieClipHook(createjs);

                    // Mouse interaction changes hover/press visuals.
                    var invalidate = this.invalidate.bind(this);
                    this.stage.on('stagemousedown', invalidate);
                    this.stage.on('stagemouseup', invalidate);
                    this.stage.on('stagemousemove', invalidate);
                }
```

Add the public method (next to `update`):

```js
            /**
             * Force a repaint on the next frame (dirty rendering mode).
             */
            invalidate: function () {
                DirtyFlag.invalidate();
            },
```

Replace the `tick` method (lines 149-170) with:

```js
            tick: function (event) {
                this.trigger('tick:before', event);
                this.dirty = false;

                for (i = 0; i < this.layers.length; i++) {
                    layer = this.layers[i];
                    if (layer.tick(event)) {
                        this.dirty = true;
                    }
                }

                if (this.dirtyRendering) {
                    // Advance the display list (MovieClips, BigText change
                    // detection) without painting; paint only when dirty.
                    this.stage.tick(event);

                    if (DirtyFlag.consume()) {
                        this.dirty = true;
                    }

                    if (
                        typeof (createjs.Tween) !== 'undefined' &&
                        createjs.Tween.hasActiveTweens &&
                        createjs.Tween.hasActiveTweens()
                    ) {
                        this.dirty = true;
                    }

                    // Self-healing safety net: never go longer than the
                    // heartbeat interval without a paint.
                    if (event.time - this._lastPaintTime >= this.heartbeatInterval) {
                        this.dirty = true;
                    }

                    if (this.dirty) {
                        this._lastPaintTime = event.time;
                        this.update();
                    }
                } else if (this.dirty) {
                    this.update();
                }

                this.trigger('tick:after');
            },
```

- [ ] **Step 3: Invalidate from BigText and EmojiText**

In `BigText.js`, add `'CatLab/Easelbone/Utilities/DirtyFlag'` to the define dependencies (and `DirtyFlag` to the factory params):

```js
define(
    [
        'easeljs',
        'CatLab/Easelbone/Utilities/GlobalProperties',
        'CatLab/Easelbone/EaselJS/DisplayObjects/EmojiText',
        'CatLab/Easelbone/Utilities/DirtyFlag'
    ],
    function (createjs, GlobalProperties, EmojiText, DirtyFlag) {
```

In `p.drawText`, add as the first line of the function body:

```js
            DirtyFlag.invalidate();
```

In `EmojiText.js`, add the same dependency:

```js
define(
	[
		'easeljs',
		'CatLab/Easelbone/Utilities/DirtyFlag'
	],
	function (createjs, DirtyFlag) {
```

And extend `_requestRedraw` (line 304):

```js
		p._requestRedraw = function () {
			this._redrawRequested = true;
			DirtyFlag.invalidate();
		};
```

- [ ] **Step 4: Verify both modes**

```bash
npm run build
npx http-server dist -p 8080 --silent &
sleep 2
npm run smoke
kill %1
```

Expected: all pages PASS in both modes (examples don't pass the option yet — identical behavior — but the benchmark page does). **Check the benchmark perf line for the `?dirtyRendering=1` run:** `paintsPerSecond` should drop to ~1 (heartbeat only) while `ticksPerSecond` stays ~60. The default-mode benchmark should still show paints ≈ ticks. Manually open `http://localhost:8080/examples/benchmark.html?dirtyRendering=1`: enabling "animate movieclips" must make the cogs spin (paints/s jumps to ~60), disabling must drop paints/s back to ~1. Then `git checkout dist`.

- [ ] **Step 5: Commit**

```bash
git add app/scripts/CatLab/Easelbone/Utilities/DirtyFlag.js \
        app/scripts/CatLab/Easelbone/Views/Root.js \
        app/scripts/CatLab/Easelbone/EaselJS/DisplayObjects/BigText.js \
        app/scripts/CatLab/Easelbone/EaselJS/DisplayObjects/EmojiText.js
git commit -m "Add opt-in dirty rendering: tick always, paint only when dirty"
```

---

### Task 10: Wire the query parameter into all example pages

**Files:**
- Modify: `app/examples/controls.html`, `app/examples/scroll.html`, `app/examples/float.html`, `app/examples/alphamask.html`, `app/examples/background.html`, `app/examples/bigtext.html`, `app/examples/emoji.html`

**Interfaces:**
- Consumes: the `dirtyRendering` Root option from Task 9.
- Produces: every example page honors `?dirtyRendering=1`, which is what makes the smoke harness's second mode meaningful.

- [ ] **Step 1: Add the flag to each page**

In each of the seven files, find the Root construction line (exact whitespace varies slightly per file — locate `new easelbone.Views.Root`):

```js
					var rootView = new easelbone.Views.Root ({'container': document.getElementById ('container') });
```

and replace with:

```js
					var dirtyRendering = /[?&]dirtyRendering=1/.test(window.location.search);
					var rootView = new easelbone.Views.Root ({'container': document.getElementById ('container'), 'dirtyRendering': dirtyRendering });
```

(Keep each file's existing indentation. If a page passes other options already, just add the `dirtyRendering` key.)

- [ ] **Step 2: Verify**

```bash
npm run build
npx http-server dist -p 8080 --silent &
sleep 2
npm run smoke
kill %1
```

Expected: all pages PASS in **both** modes. This is the critical regression gate: in dirty mode the example views still return `true` from `tick()` (Base default), so visuals must be pixel-identical; any blank canvas or console error here means the Task 9 tick/paint split broke something. Then `git checkout dist`.

- [ ] **Step 3: Manual interaction sweep (once)**

With the server running, in a real browser check each example with `?dirtyRendering=1`:
- `controls.html`: drag the slider, toggle the checkbox, open the selectbox, click the button — all must respond visually without lag.
- `scroll.html`: drag-scroll and mouse-wheel the scroll area.
- `float.html`, `alphamask.html`, `background.html`, `bigtext.html`, `emoji.html`: render correctly, no frozen content.

Expected: identical behavior to the default mode.

- [ ] **Step 4: Commit**

```bash
git add app/examples/*.html
git commit -m "Examples: honor ?dirtyRendering=1 query parameter"
```

---

### Task 11: Final verification, rebuild, and PR

**Files:**
- Modify: `dist/` (rebuild), `README.md` (document the new option)

- [ ] **Step 1: Document dirty rendering in the README**

In `README.md`, add to the Features list:

```markdown
- Opt-in dirty rendering (`new easelbone.Views.Root({ ..., dirtyRendering: true })`): the stage ticks every frame but repaints only when something changed — MovieClip frames, tweens, text redraws, mouse activity, or an explicit `rootView.invalidate()` call. Views can return `false` from `tick()` when static to skip repaints entirely.
```

And add "Benchmark" to the examples list:

```markdown
- [Benchmark](https://catlabinteractive.github.io/easelbone/examples/benchmark.html) — Performance stress test with paint/tick statistics
```

- [ ] **Step 2: Full rebuild and final local run**

```bash
npm run build
npx http-server dist -p 8080 --silent &
sleep 2
npm run smoke
kill %1
```

Expected: all 16 URL/mode combinations PASS. Record the final benchmark numbers (both modes) and compare against the Task 3 baseline; the summary belongs in the PR description.

- [ ] **Step 3: Commit the rebuild**

```bash
git add dist README.md
git commit -m "Rebuild"
```

- [ ] **Step 4: Push branch and open a PR**

This work should have been done on a feature branch (per the worktree/branch workflow). Push and open a PR against master:

```bash
git push -u origin HEAD
gh pr create --title "Performance pass v2: dirty rendering, hot-path optimizations, CI smoke tests" --body "$(cat <<'EOF'
Implements docs/superpowers/specs/2026-07-13-performance-pass-v2-design.md:

- Opt-in dirty rendering (`dirtyRendering` Root option): stage ticks every frame, paints only when dirty (view signal, MovieClip/tween auto-detect, invalidate(), mouse, 1s heartbeat)
- Placeholder: cached z-index verification, numeric bounds comparison, no duplicate z-index pass in draw
- BigText/Background: allocation-free change detection; per-family font line-height cache
- EmojiText: cached sorted emoji keys, dense emoji index array
- Loader: 6 parallel connections (was PreloadJS default of 1)
- New benchmark example page with paint/tick statistics
- New CI workflow: Playwright smoke tests over all example pages in both rendering modes

Benchmark (local): [fill in baseline vs. final numbers from Task 3 / Task 11]

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 5: Verify CI**

Watch the PR checks: the new "Smoke Tests" workflow and the existing PR-preview deploy must both pass.

```bash
gh pr checks --watch
```

Expected: all checks green. If the smoke job fails in CI but passed locally, pull the job log — the usual suspects are the server not being up (increase the `sleep`) or a font/emoji rendering difference on the runner (the pixel check only needs 2 distinct values, so this should not trigger).
