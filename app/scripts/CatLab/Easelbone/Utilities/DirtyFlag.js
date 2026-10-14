/**
 * "Paint the next frame" (dirty rendering mode). The root view finds changed
 * display objects by itself (Utilities/DirtyRendering); this flag is for
 * what the display list does not show: an image that arrived for something
 * already painted, a layout that is redone at draw time, an explicit
 * `rootView.invalidate()`.
 *
 * Page-wide (the objects that raise it do not know their root view), but
 * every root view keeps the generation it saw last: an invalidation paints
 * each dirty-rendering root view once, none of them takes it from another.
 */
define(
    [],
    function () {
        "use strict";

        var invalidated = false;
        var generation = 0;

        return {

            /**
             * Request a repaint on the next frame (dirty rendering mode).
             */
            invalidate: function () {
                invalidated = true;
                generation++;
            },

            /**
             * Goes up by one on every invalidate(). A root view paints when
             * it differs from the value it saw last.
             * @returns {number}
             */
            generation: function () {
                return generation;
            },

            /**
             * Read and clear the flag. Kept for hosts that read it; the root
             * views use generation().
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
