define(
    [
        'underscore',
        'backbone'
    ],
    function (_, Backbone) {

        var Base = function (element)
        {
            this.checked = false;
            this.active = false;
            this.element = element;

            _.extend(this, Backbone.Events);
        };

        Base.prototype.activate = function (animate) {
            this.active = true;
            this.update(animate);
        };

        Base.prototype.deactivate = function (animate) {
            this.active = false;
            this.update(animate);
        };

        Base.prototype.update = function (animate) {

            if (typeof (animate) === 'undefined') {
                animate = true;
            }

            var state = null;

            if (this.active) {
                if (this.checked) {
                    state = 'Hit';
                } else {
                    state = 'Over';
                }
            } else {
                if (this.checked) {
                    state = 'Down';
                } else {
                    state = 'Up';
                }
            }

            this.gotoWithAnimate(state, animate);
        };

        /**
         * Check if there is a NoAnim framename and use that if animate is set to false.
         * @param frame
         * @param animate
         */
        Base.prototype.gotoWithAnimate = function (frame, animate) {

            if (!animate) {
                if (this.element.timeline.resolve(frame + '-NoAnim')) {
                    this.element.gotoAndPlay(frame + '-NoAnim');
                    return;
                }
            }

            this.element.gotoAndPlay(frame);
        };

        return Base;

    }
);