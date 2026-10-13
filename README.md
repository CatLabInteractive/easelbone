# easelbone

A GUI engine combining [EaselJS](https://createjs.com/easeljs) and [Backbone.js](https://backbonejs.org/). Originally developed for use with Flash CC HTML5 output, but can be used with any EaselJS content.

## Features
- Navigatable views with keyboard, mouse and touch support (single-touch is enabled on the stage; `new easelbone.Views.Root({ ..., touch: false })` opts out)
- UI controls: sliders, checkboxes, selectboxes, and buttons
- Scrollable containers with list and float layouts, scrolled by wheel, scrollbar, keyboard focus or dragging the content (touch)
- Text rendering with auto-sizing and emoji support
- Alpha mask support
- Asset loading and management
- Built on top of AMD modules (RequireJS)
- Opt-in dirty rendering (`new easelbone.Views.Root({ ..., dirtyRendering: true })`): the stage ticks every frame but is repainted only when the picture changed. After each tick the root view walks the display list as the painter would (hidden subtrees and the inside of cached objects are skipped) and compares a fingerprint of everything that decides the picture: transforms, alpha, child order, MovieClip and Sprite frames (nested at any depth, independent or synched), text, images, video time, masks, shadows, redrawn Graphics. No `invalidate()` calls are needed for changed display objects, also not for changes made outside a tick. See [Dirty rendering](#dirty-rendering) below.

## Documentation

Visit the [documentation and examples page](https://catlabinteractive.github.io/easelbone/) for a full overview of the library and live demos.

## Installation
```bash
npm install easelbone
```

Or with Bower:
```bash
bower install easelbone
```

## Examples

Live examples are hosted on GitHub Pages:

- [Controls](https://catlabinteractive.github.io/easelbone/examples/controls.html) — Sliders, checkboxes, selectboxes, and buttons
- [Scrollable Areas](https://catlabinteractive.github.io/easelbone/examples/scroll.html) — Scrollable container demo
- [Float Layout](https://catlabinteractive.github.io/easelbone/examples/float.html) — Float layout demo
- [Alpha Mask](https://catlabinteractive.github.io/easelbone/examples/alphamask.html) — Alpha mask demo
- [Background & Fill](https://catlabinteractive.github.io/easelbone/examples/background.html) — Background fill and placeholder demo
- [BigText](https://catlabinteractive.github.io/easelbone/examples/bigtext.html) — Auto-sizing text rendering demo
- [Emoji Text](https://catlabinteractive.github.io/easelbone/examples/emoji.html) — Text rendering with emoji support
- [Benchmark](https://catlabinteractive.github.io/easelbone/examples/benchmark.html) — Performance stress test with paint/tick statistics

Pull request previews are automatically deployed to `https://catlabinteractive.github.io/easelbone/pr/<PR_NUMBER>/examples/`.

## Development

```bash
# Install dependencies
npm install
npx bower install

# Build
npm run build

# Watch for changes
npx grunt watch

# Headless tests (need `npx playwright install chromium` once)
npx http-server dist -p 8080 --silent &   # serve the build first
npm run smoke                             # every example page renders cleanly
npm run test:baseline                     # BigText vertical centering (self-serving)
npm run test:touch                        # touch on the stage, drag scrolling (self-serving)
npm run test:dirty                        # dirty rendering, nested MovieClips (plain node, no browser)
```

Note: `BigText` fits and centers text on the measured glyph bounds
(`TextMetrics.actualBoundingBox*`), so the drawn ink never leaves the
available space and manual `BigText.setFontOffset(...)` calls are no longer
needed in modern browsers — even for decorative fonts whose glyphs extend
beyond their em box or advance widths. Registering an offset still works and
takes precedence (restoring the fully legacy behavior for that font), as does
the legacy heuristic on browsers without extended TextMetrics.

## Dirty rendering

Off by default. With `dirtyRendering: true` the root view paints a frame when one of these is true:

1. the display-list fingerprint differs from the previous frame, plus the two frames after that;
2. a view's `tick()` returned `true` (`Views.Base.tick()` returns `false` while a dirty-rendering root view exists and `true` otherwise, so a view that does not override it leaves the decision to the fingerprint; a view that overrides it and returns `true` keeps painting every frame);
3. `rootView.invalidate()` was called, the mouse moved or was pressed over the stage, or the page became visible again;
4. an easelbone object asked for it: an emoji image that arrived after its text was painted, a `Fill` that is laid out at draw time or still waits for its content (it keeps every frame painted until the content has bounds), a pinned object that moved;
5. nothing was painted for `rootView.heartbeatInterval` ms (default `500`): a change nothing noticed shows that late instead of not at all.

What the fingerprint cannot see, and needs `rootView.invalidate()`: pixels drawn into a canvas that a Bitmap shows, a display object with a custom `draw()`, a Graphics command whose fields are edited after it was appended. (A Graphics object that is cleared and redrawn, or appended to, is seen.)

Other things to know:

- A MovieClip or tween that changes nothing visible (under a hidden or cached ancestor) no longer causes paints. A cached container shows what is below it only after `updateCache()`, as always.
- `rootView.render()` (and so `setView()` and `resize()`) ticks the stage before painting, as `stage.update()` does without the option. `rootView.update()` only paints.
- `rootView.paintCount` counts stage paints in both modes; a host can show paints per second next to the ticker FPS.
- `easelbone.DirtyRendering` exposes `fingerprint(stage)` and `isActive()`. Its presence also tells a host that this build decides on the display list. Up to 1.2.18 the option painted while any MovieClip advanced or any tween was active, visible or not, and missed changes made outside a tick.
- The state behind `isActive()` and `invalidate()` is page-wide. With several root views on one page, mix dirty and non-dirty ones only if the views of the non-dirty ones return `true` from `tick()` themselves.

## Releasing

```bash
npm run bump        # or bump:minor — bumps package.json, commits, creates the vX.Y.Z tag
npm publish
```

`npm publish` wraps itself around that:

- `prepublishOnly` runs `bower install && npm run build`, so a stale or missing
  `dist/scripts/easelbone.js` can never be published.
- The published tarball is limited to the built bundle and its source map (see
  the `files` field) — the examples, sources and tooling stay in the repo.
- `postpublish` pushes the branch and the new tag with `git push --follow-tags`,
  then creates the matching GitHub Release with auto-generated notes
  (`gh release create ... --generate-notes --verify-tag`). This needs the
  [GitHub CLI](https://cli.github.com/) to be installed and authenticated
  (`gh auth login`); `--verify-tag` makes it abort rather than invent a tag if
  you published without bumping first.

## License

[MIT](LICENSE)