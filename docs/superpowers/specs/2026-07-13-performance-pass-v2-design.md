# Performance Pass v2 — Design

**Date:** 2026-07-13
**Status:** Approved for planning
**Targets:** runtime FPS/CPU and startup/load time (general library hardening; follow-up to the v1.2.5 perf work in `ed8a1c9`).

## Background

Easelbone redraws the full stage every tick: `Views/Base.tick()` returns `true`
unconditionally, so `Root.tick` calls `stage.update()` every frame even on
static screens. On top of that, several hot paths allocate strings or do
linear scans per frame per display object, and the asset loader runs on
PreloadJS's default of a single connection.

This pass has four parts: an opt-in dirty-rendering mode, hot-path
micro-optimizations, loader parallelism, and a benchmark page to measure it
all.

## 1. Dirty rendering (opt-in)

### API

- `new Root({ dirtyRendering: true })` — default `false`. With the flag off,
  behavior is byte-for-byte identical to today.
- `root.invalidate()` — public method that forces a paint on the next frame.

### Mechanism

When enabled, `Root`:

1. Sets `stage.tickOnUpdate = false`, splitting EaselJS's combined
   tick-and-paint.
2. Each frame calls `stage.tick(event)` unconditionally — MovieClips advance
   and `BigText._tick` change detection keeps running.
3. Calls `stage.update()` only when a dirty signal fired that frame.

### Dirty signals

| Signal | Source |
|---|---|
| View reports animation | Existing `view.tick()` return contract. `Base.tick()` keeps returning `true` by default; a view opts into savings by returning `false` when static. |
| MovieClip advanced | Hook in `Hacks.js` wraps `createjs.MovieClip.prototype._tick`: sets a flag when an unpaused clip with more than one frame ticks. Playing clips paint even when the view returns `false`. |
| Active tweens | Check `createjs.Tween` for active tweens each frame. |
| Explicit invalidation | `root.invalidate()`, and internal components (BigText redraw, EmojiText emoji-image load) setting the same flag via the stage. |
| Mouse activity | `stagemousedown` / `stagemouseup` / `stagemousemove` listeners mark dirty so hover/press states repaint. |
| Heartbeat | Force a paint if none happened for ~1 second — self-healing net for any missed signal. |

The accumulated flag is read and cleared by `Root.tick` each frame.

### Why views must still cooperate

Even with the flag on, the default `Base.tick()` returning `true` means every
frame paints — no silent behavior change for subclasses. Consumers get savings
by (a) enabling the flag and (b) returning `false` from `tick()` when their
view is static; the auto-detect signals cover MovieClips, tweens, text
redraws, and mouse feedback so returning `false` is safe.

## 2. Hot-path micro-optimizations

All behavior-neutral; no API changes.

### Placeholder (`EaselJS/DisplayObjects/Placeholder.js`)

- Remove the duplicate `updateZIndex()` call from the overridden `draw`
  (keep the `_tick` one). Today every placeholder re-derives its z-index
  twice per frame.
- In `updateZIndex`, cache the last-known child index and verify it with a
  direct array element check (`parent.children[i] === obj`) before falling
  back to the two `getChildIndex` (`Array.indexOf`) scans.
- Replace the `getBoundsHash()` string (`width + ':' + height`, built from
  three `getBounds()` calls per draw) with two cached numbers compared
  directly.

### BigText (`EaselJS/DisplayObjects/BigText.js`)

- `hasChanged()` currently builds a hash string per tick that embeds the full
  text content. Replace with field-by-field comparison: width and height as
  numbers, text/align/font/color by reference equality. Zero allocation per
  frame. Keep the `_redrawRequested` fast path.

### Background (`EaselJS/DisplayObjects/Background.js`)

- Same fix as BigText: numeric width/height comparison instead of a hash
  string per draw.

### EmojiText (`EaselJS/DisplayObjects/EmojiText.js`)

- `_replaceEmojis` re-merges (`Object.assign`) and re-sorts the full emoji
  key list on every cache miss. Cache the merged, length-sorted key list;
  rebuild only when the static `EmojiText.setEmojis` or the instance
  `setEmojis` runs. Instances without additional emojis share a module-level
  cached list.
- Store found emojis as a dense array of `{index, emoji}` entries instead of
  a sparse array iterated with `for..in` + `parseInt` per line per draw.

### Font line-height cache (BigText)

- `fontLineheightCache` is keyed by the full font string including pixel
  size, so binary search adds ~log₂(height) entries per size ever used.
  Measure once per font family at a reference size (100px) and scale
  linearly by requested size. Kills unbounded cache growth and removes
  `measureText` calls from later searches of the same family.

## 3. Loader parallelism (`Utilities/Loader.js`)

- When `Loader` constructs its own queue (`new createjs.LoadQueue(false)`),
  call `queue.setMaxConnections(n)` with a default of 6.
- Configurable via `options.maxConnections`.
- Never touch a caller-supplied `options.queue`.

PreloadJS defaults to 1 concurrent connection, so all manifests currently
load serially; this is expected to be the largest startup win.

## 4. Benchmark page

New `app/examples/benchmark.html` (+ deploy alongside existing examples):

- Stress scene: a grid of many placeholders holding BigTexts, plus a few
  looping MovieClip animations, built from the existing example assets.
- Live readout: FPS and average frame time (ms) over a rolling window.
- Toggle: dirty rendering on/off at runtime, so the effect of every change
  in this pass is measurable before/after.
- Doubles as a live demo on the GitHub Pages examples index.

## 5. Risks & verification

**Risk profile:**

- Micro-optimizations and loader change: behavior-neutral by construction;
  main risk is a comparison-logic bug (missed redraw) — covered by the
  example-page sweep.
- Dirty rendering: entirely behind its flag; with the flag off the code path
  is unchanged. With the flag on, the heartbeat bounds any missed-signal bug
  to a ~1 s visual stall instead of a freeze.

**Verification:**

1. Benchmark page numbers before/after each change (frame time, FPS).
2. Manual sweep of all existing example pages — controls, scroll, float,
   alphamask, background, bigtext, emoji — with `dirtyRendering` off (default)
   and on, confirming identical visuals and working interaction.
3. Loader: confirm parallel requests in devtools network tab on an example
   that loads a manifest.

## Out of scope

- Idle tick-rate throttling (Ticker framerate reduction) — possible follow-up.
- Memory/GC work beyond what the micro-optimizations remove incidentally.
- Bundle/module-loading changes.
