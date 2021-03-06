define(
    [
        'easeljs',
        'CatLab/Easelbone/EaselJS/DisplayObjects/Placeholder',
        'CatLab/Easelbone/Utilities/Deferred'
    ],
    function (createjs, Placeholder, Deferred) {
        var ScrollArea = function (element) {

            this.initialize();

            var parent = new Placeholder(element);

            parent.on('bounds:change', function () {

                // Also set the mask.
                var bounds = parent.getBounds();

                var maskShape = new createjs.Shape();
                maskShape.graphics.drawRect(0, 0, bounds.width, bounds.height);

                if (typeof (this.setMask) !== 'undefined') {
                    this.setMask(maskShape);
                } else {
                    this.mask = maskShape;
                }
            }.bind(this));

            parent.addChild(this);

            this.on('tick', function () {
                this.setScroll(0);
            }, this, true);

            Object.defineProperty(this, 'scroll', {
                'set': function (value) {
                    this.setScroll(value);
                },
                'get': function () {
                    return this.getScroll();
                }
            })
        };

        var p = ScrollArea.prototype = new Placeholder();
        var event;

        p.isActive = function () {
            return this.getBounds() !== null &&
                this.parent !== null &&
                this.parent.getBounds() !== null;
        };

        p.getFinalDestination = function (y) {

            if (!this.isActive()) {
                return 0;
            }

            else if (y < 0) {
                return 0;
            }

            else if (this.getBounds().height - this.parent.getBounds().height < 0) {
                return 0;
            }

            else if (y > (this.getBounds().height - this.parent.getBounds().height)) {
                return 0 - (this.getBounds().height - this.parent.getBounds().height);
            }

            else {
                return 0 - y;
            }
        };

        p.setScroll = function (y) {

            this.oldY = this.y;
            this.y = this.getFinalDestination(y);

            if (this.oldY !== this.y) {
                this.onScroll();
            }

            return this;
        };

        p.getDistance = function (y) {
            return Math.abs(this.y - this.getFinalDestination(y));
        };

        p.getScroll = function () {
            return 0 - this.y;
        };

        p.down = function (amount) {
            return this.setScroll(this.getScroll() + amount);
        };

        p.up = function (amount) {
            return this.setScroll(this.getScroll() - amount);
        };

        p.getPercentage = function () {
            if (!this.getBounds()) {
                return 0;
            }

            return this.getScroll() / (this.getBounds().height - this.parent.getBounds().height);
        };

        p.focus = function (element, delay, ease) {

            var state = new Deferred();

            if (!this.parent.getBounds()) {
                state.resolve();
                return state.promise();
            }

            if (typeof (delay) === 'undefined') {
                delay = 0;
            }

            var y = element.y;
            //this.setScroll (y);

            // Center around this y position.
            var height = 0;
            if (element.getBounds()) {
                height = element.getBounds().height;
            }

            // y should be in the middle of the screen, so...
            if (height < this.parent.getBounds().height) {
                y -= (this.parent.getBounds().height / 2) - (height / 2);
            }

            if (delay > 0) {
                createjs.Tween.get(this)
                    .to({'scroll': y}, delay, ease)
                    .call(function() {
                        state.resolve()
                    }.bind(this));
            } else {
                this.scroll = y;
                state.resolve();
            }

            return state.promise();
        };

        p.scrollTo = function (percentage) {

            if (!this.getBounds()) {
                this.setScroll(0);
                return;
            }

            this.setScroll(percentage * (this.getBounds().height - this.parent.getBounds().height));
        };

        p.onScroll = function () {

            event = new createjs.Event('scroll');
            this.dispatchEvent(event);
        };

        return ScrollArea;
    }
);