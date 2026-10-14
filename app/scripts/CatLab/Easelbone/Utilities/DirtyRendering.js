/**
 * Dirty rendering: repaint the canvas only when the picture changed.
 *
 * A host changes display objects from everywhere (events, timers, tweens,
 * Animate timelines), and nothing tells the root view about it. Instead of
 * an `invalidate()` call at every one of those places, this module looks at
 * the RESULT: after every stage tick the root view walks the display list
 * as the painter would (hidden subtrees and the inside of cached objects are
 * skipped) and folds everything that decides the picture into one number. A
 * different number than last frame = paint. Views/Root asks a Tracker once
 * per tick when it was created with `dirtyRendering: true`.
 *
 * This replaces the two signals the option used before ("a MovieClip
 * advanced a frame", "a tween is active"). Those painted for clips and
 * tweens nobody could see, and missed every change made outside a tick.
 *
 * MovieClips: an independent clip advances in its tick, so the walk (which
 * runs after the tick) reads its new frame, children and child properties.
 * A synched clip (Animate "graphic" symbols, the default for nested clips)
 * only applies its frame when it is DRAWN; before that only its
 * `_synchOffset` / `startPosition` moved. The walk reads those too, and the
 * trailing frames pick up what the draw changed below it.
 *
 * What the walk cannot see, and who covers it:
 *  - a Graphics object redrawn in place: `install()` stamps every Graphics
 *    when its commands change, the walk reads the stamp;
 *  - a playing video behind a Bitmap: the walk reads `currentTime`;
 *  - an image that finished loading, also a new `src` of the same size and
 *    the images of a sprite sheet: the walk listens for `load` on every
 *    image it meets (once per image), a load paints the next frame;
 *  - what easelbone's own objects do behind the display list (an emoji
 *    image that arrived, a Fill that still waits for its content, a pinned
 *    object): they raise Utilities/DirtyFlag themselves;
 *  - pixels drawn into a canvas that a Bitmap shows, a custom `draw()`, a
 *    Graphics command whose fields are changed after it was appended: call
 *    `rootView.invalidate()`;
 *  - anything missed: the root view paints at least every
 *    `heartbeatInterval` ms, so a missed change shows late instead of not
 *    at all.
 *
 * No dependencies on purpose (createjs is handed in), so it runs in plain
 * node (tools/dirty-rendering-test.js).
 */
define(
    [],
    function () {
        'use strict';

        // After a change, keep painting this many more frames. Covers a
        // change that needs a second tick to settle (a text that is laid out
        // one tick after it was set, a decoded image, a Placeholder that
        // takes its position and bounds when its source element is drawn).
        var TRAILING_FRAMES = 2;

        // Units per property, before truncating to an integer.
        var POSITION = 16;      // 1/16 pixel
        var SCALE = 8192;
        var ANGLE = 64;
        var ALPHA = 1024;

        // The tracker of the root view whose views are ticking right now
        // (null: none, or a plain root view). See isActive().
        var ticking = null;
        // Images that finished loading since the page started (see watch()).
        var loads = 0;
        var stampCounter = 0;
        var installed = false;

        /**
         * 32 bit multiply (Math.imul is ES6).
         */
        function mul(a, b) {
            return ((a & 0xffff) * b + ((((a >>> 16) * b) & 0xffff) << 16)) | 0;
        }

        /**
         * Fold one integer into the hash (FNV-1a per word, plus a shift so
         * two changes cannot cancel each other out linearly).
         */
        function mix(h, n) {
            h = mul(h ^ (n | 0), 16777619);
            return h ^ (h >>> 13);
        }

        function mixNumber(h, value, unit) {
            if (typeof (value) !== 'number' || value !== value) {
                return mix(h, 0x5bd1e995);
            }
            return mix(h, value * unit);
        }

        function hashString(value) {
            var h = 0x811c9dc5;
            for (var i = 0; i < value.length; i++) {
                h = mul(h ^ value.charCodeAt(i), 16777619);
            }
            return h;
        }

        function mixString(h, value) {
            if (value === null || typeof (value) === 'undefined') {
                return mix(h, 0x2545f491);
            }
            return mix(h, hashString(String(value)));
        }

        /**
         * A number that is unique for this object and stays with it.
         */
        function stampOf(object) {
            if (!object.__dirtyStamp) {
                object.__dirtyStamp = ++stampCounter;
            }
            return object.__dirtyStamp;
        }

        function onImageLoad() {
            loads++;
        }

        /**
         * Listen for `load` on an image, once per image. Its pixels change
         * when it loads, and nothing in the display list has to: a sprite
         * sheet that was still loading, a `src` swapped for another picture
         * of the same size. Not for a canvas or a video (no load, and a
         * video is read through currentTime).
         */
        function watch(image) {
            image.__dirtyWatched = true;
            if (typeof (image.addEventListener) === 'function' && !image.getContext) {
                image.addEventListener('load', onImageLoad);
            }
        }

        function watchSpriteSheet(sheet) {
            sheet.__dirtyWatched = true;
            var images = sheet._images;
            if (images) {
                for (var i = 0; i < images.length; i++) {
                    if (images[i] && !images[i].__dirtyWatched) {
                        watch(images[i]);
                    }
                }
            }
        }

        function isDrawn(node) {
            return !!(node.visible && node.alpha > 0 && node.scaleX !== 0 && node.scaleY !== 0);
        }

        function mixTransform(h, node) {
            h = mixNumber(h, node.x, POSITION);
            h = mixNumber(h, node.y, POSITION);
            h = mixNumber(h, node.scaleX, SCALE);
            h = mixNumber(h, node.scaleY, SCALE);
            h = mixNumber(h, node.rotation, ANGLE);
            h = mixNumber(h, node.skewX, ANGLE);
            h = mixNumber(h, node.skewY, ANGLE);
            h = mixNumber(h, node.regX, POSITION);
            h = mixNumber(h, node.regY, POSITION);

            var matrix = node.transformMatrix;
            if (matrix) {
                h = mixNumber(h, matrix.a, SCALE);
                h = mixNumber(h, matrix.b, SCALE);
                h = mixNumber(h, matrix.c, SCALE);
                h = mixNumber(h, matrix.d, SCALE);
                h = mixNumber(h, matrix.tx, POSITION);
                h = mixNumber(h, matrix.ty, POSITION);
            }

            return h;
        }

        function mixGraphics(h, graphics) {
            return mix(h, stampOf(graphics));
        }

        function mixImage(h, image) {
            h = mix(h, stampOf(image));

            // createjs.VideoBuffer keeps its video in _video.
            var video = image._video || image;
            if (typeof (video.currentTime) === 'number') {
                h = mixNumber(h, video.currentTime, 1000);
                h = mix(h, video.readyState | 0);
                return h;
            }

            if (!image.__dirtyWatched) {
                watch(image);
            }

            // Not loaded yet = nothing is drawn; loaded = a size.
            h = mix(h, (image.naturalWidth || image.width) | 0);
            h = mix(h, (image.naturalHeight || image.height) | 0);
            return h;
        }

        function mixText(h, node) {
            // The text of a question is long and the same for many frames:
            // hash it once.
            if (node.__dirtyText !== node.text) {
                node.__dirtyText = node.text;
                node.__dirtyTextHash = (node.text === null || typeof (node.text) === 'undefined') ?
                    0x2545f491 : hashString(String(node.text));
            }
            h = mix(h, node.__dirtyTextHash);

            h = mixString(h, node.font);
            h = mixString(h, node.color);
            h = mixString(h, node.textAlign);
            h = mixString(h, node.textBaseline);
            h = mixNumber(h, node.lineWidth, POSITION);
            h = mixNumber(h, node.lineHeight, POSITION);
            h = mixNumber(h, node.maxWidth, POSITION);
            h = mixNumber(h, node.outline, POSITION);
            return h;
        }

        function walk(node, h) {
            // snapToPixel rides along with the id: it rounds the position
            // when the stage has snapToPixelEnabled.
            h = mix(h, ((node.id | 0) << 1) | (node.snapToPixel ? 1 : 0));

            if (!isDrawn(node)) {
                // Not painted, and neither is anything below it.
                return mix(h, 0);
            }

            h = mixTransform(h, node);
            h = mixNumber(h, node.alpha, ALPHA);

            if (node.compositeOperation) {
                h = mixString(h, node.compositeOperation);
            }

            var shadow = node.shadow;
            if (shadow) {
                h = mixString(h, shadow.color);
                h = mixNumber(h, shadow.offsetX, POSITION);
                h = mixNumber(h, shadow.offsetY, POSITION);
                h = mixNumber(h, shadow.blur, POSITION);
            }

            var mask = node.mask;
            if (mask) {
                h = mixTransform(h, mask);
                if (mask.graphics) {
                    h = mixGraphics(h, mask.graphics);
                }
            }

            // A cached object paints its cache: what is below it only shows
            // after updateCache(), which moves cacheID.
            if (node.cacheCanvas) {
                h = mix(h, stampOf(node.cacheCanvas));
                return mix(h, node.cacheID | 0);
            }

            // Bounds are not painted, but Placeholder, Fill and BigText lay
            // themselves out on them (some of them only when drawn).
            var bounds = node._bounds;
            if (bounds) {
                h = mixNumber(h, bounds.x, POSITION);
                h = mixNumber(h, bounds.y, POSITION);
                h = mixNumber(h, bounds.width, POSITION);
                h = mixNumber(h, bounds.height, POSITION);
            }

            if (typeof (node.currentFrame) === 'number') {
                h = mixNumber(h, node.currentFrame, 1);
                if (typeof (node.currentAnimationFrame) === 'number') {
                    h = mixNumber(h, node.currentAnimationFrame, 16);
                }
            }

            // A synched MovieClip applies its frame when it is drawn: until
            // then only the position it will go to has changed.
            if (node.timeline) {
                h = mixNumber(h, node._synchOffset, 1);
                h = mixNumber(h, node.startPosition, 1);
                h = mixString(h, node.mode);
                // Past the end of its timeline, loop decides between
                // wrapping around and holding the last frame.
                h = mix(h, node.loop | 0);
            }

            if (node.spriteSheet) {
                h = mix(h, stampOf(node.spriteSheet));
                if (!node.spriteSheet.__dirtyWatched) {
                    watchSpriteSheet(node.spriteSheet);
                }
            }

            if (typeof (node.text) !== 'undefined' && typeof (node.font) !== 'undefined') {
                h = mixText(h, node);
            } else if (typeof (node.text) !== 'undefined' && node.spriteSheet) {
                // BitmapText: lays its characters out when it is drawn, so
                // what it will lay them out with counts.
                h = mixString(h, node.text);
                h = mixNumber(h, node.letterSpacing, POSITION);
                h = mixNumber(h, node.lineHeight, POSITION);
                h = mixNumber(h, node.spaceWidth, POSITION);
            }

            if (node.image) {
                h = mixImage(h, node.image);

                var rect = node.sourceRect;
                if (rect) {
                    h = mixNumber(h, rect.x, POSITION);
                    h = mixNumber(h, rect.y, POSITION);
                    h = mixNumber(h, rect.width, POSITION);
                    h = mixNumber(h, rect.height, POSITION);
                }
            }

            if (node.graphics) {
                h = mixGraphics(h, node.graphics);
            }

            var children = node.children;
            if (children) {
                h = mix(h, children.length);
                for (var i = 0; i < children.length; i++) {
                    h = walk(children[i], h);
                }
            }

            return h;
        }

        /**
         * Watches one stage. Ask `afterTick()` once per frame, after the
         * stage ticked: true = paint this frame.
         * @param {*} stage
         * @constructor
         */
        function Tracker(stage) {
            this.stage = stage;
            this.last = null;
            this.trailing = 0;
            this.loadsSeen = loads;

            this.tracking = true;

            // Counters for diagnostics and tests.
            this.frames = 0;
            this.changes = 0;
        }

        /**
         * @returns {boolean} true when this frame has to be painted
         */
        Tracker.prototype.afterTick = function () {
            var current = DirtyRendering.fingerprint(this.stage);
            this.frames++;

            // An image loaded (anywhere: a load is rare, a paint too many
            // is cheaper than knowing which stage shows it).
            var loaded = this.loadsSeen !== loads;
            this.loadsSeen = loads;

            if (current !== this.last || loaded) {
                this.last = current;
                this.changes++;
                this.trailing = TRAILING_FRAMES;
                return true;
            }

            if (this.trailing > 0) {
                this.trailing--;
                return true;
            }

            return false;
        };

        /**
         * Stop watching (a root view that is thrown away, or that turned
         * dirty rendering off). Lets go of the stage.
         */
        Tracker.prototype.stop = function () {
            this.tracking = false;
            this.stage = null;
            if (ticking === this) {
                ticking = null;
            }
        };

        var DirtyRendering = {

            TRAILING_FRAMES: TRAILING_FRAMES,

            Tracker: Tracker,

            /**
             * Are the views that tick right now those of a root view that
             * paints from the display list? Views/Base asks this in `tick()`:
             * its "repaint every frame" answer only holds without it. Per
             * root view: a plain root view next to a dirty one gets the old
             * answer. Outside a root view's tick: false.
             * @returns {boolean}
             */
            isActive: function () {
                return ticking !== null;
            },

            /**
             * Views/Root, around ticking its views: the tracker of a dirty
             * root view, or null for a plain one.
             * @param {Tracker|null} tracker
             * @returns {Tracker|null} what was set before (put it back after)
             */
            setTicking: function (tracker) {
                var previous = ticking;
                ticking = tracker && tracker.tracking ? tracker : null;
                return previous;
            },

            /**
             * One number for everything the stage would paint right now.
             * @param stage
             * @returns {number}
             */
            fingerprint: function (stage) {
                return walk(stage, stage.snapToPixelEnabled ? 0x811c9dc4 : 0x811c9dc5);
            },

            /**
             * Stamp every Graphics object when its commands change, so the
             * walk sees a shape that was cleared and redrawn. Safe to call
             * more than once.
             * @param createjs
             */
            install: function (createjs) {
                if (installed || !createjs || !createjs.Graphics) {
                    return;
                }
                installed = true;

                var p = createjs.Graphics.prototype;
                var names = [
                    'append', 'clear', 'store', 'unstore',
                    '_setFill', '_setStroke', 'setStrokeStyle', 'setStrokeDash'
                ];

                names.forEach(function (name) {
                    var original = p[name];
                    if (typeof (original) !== 'function') {
                        return;
                    }

                    var wrapped = function () {
                        this.__dirtyStamp = ++stampCounter;
                        return original.apply(this, arguments);
                    };

                    // The tiny API (`c`, `ss`, `sd`) points at the same
                    // functions: replace those too.
                    for (var key in p) {
                        if (p[key] === original) {
                            p[key] = wrapped;
                        }
                    }
                });
            },

            /**
             * Start watching a stage. Stop the tracker when the root view
             * goes away or turns dirty rendering off.
             * @param stage
             * @param createjs
             * @returns {Tracker}
             */
            track: function (stage, createjs) {
                DirtyRendering.install(createjs);
                return new Tracker(stage);
            },

            /**
             * Tests only.
             */
            reset: function () {
                ticking = null;
            }
        };

        return DirtyRendering;
    }
);
