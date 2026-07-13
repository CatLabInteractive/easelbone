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
