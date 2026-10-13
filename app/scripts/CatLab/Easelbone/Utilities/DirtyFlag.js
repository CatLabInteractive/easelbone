/**
 * "Paint the next frame" (dirty rendering mode). The root view finds changed
 * display objects by itself (Utilities/DirtyRendering); this flag is for
 * what the display list does not show: an image that arrived for something
 * already painted, a layout that is redone at draw time, an explicit
 * `rootView.invalidate()`.
 *
 * This flag is a module-level singleton shared by all stages: on a page with
 * multiple dirty-rendering Root instances, one stage's consume() may claim
 * another's invalidation; the heartbeat bounds the resulting paint delay to
 * `heartbeatInterval`.
 */
define(
    [],
    function () {
        "use strict";

        var invalidated = false;

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
            }
        };
    }
);
