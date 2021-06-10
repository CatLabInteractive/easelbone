define(
    [
        'easeljs'
    ],
    function (createjs) {
        var width;
        var height;
        var debug = false;
        var hash;
        var hasChanged = false;
        var zooms = {};
        var bounds;

        var Background = function (background, options) {
            if (typeof (options) === 'undefined') {
                options = {
                    'zoom': 'stretch'
                };
            }

            this.fillOptions = options;
            this.limits = null;
            this.initialized = false;
            this.debug = debug;
            this.childBounds = null;

            if (
                background instanceof Image ||
                background instanceof HTMLImageElement
            ) {
                this.displayobject = new createjs.Bitmap(background);
            } else if (
                background instanceof createjs.DisplayObject
            ) {
                if (!background.getBounds()) {
                    throw "Objects to be filled must have bounds set.";
                }

                var bounds = background.getBounds();

                // set child bounds as for some reason a movieclip that is once removed
                // cannot be re-added easily.
                this.childBounds = { width: bounds.width, height: bounds.height };

                this.displayobject = background;
            } else {
                this.color = background;
            }

            this.initialize();
        };

        var p = Background.prototype = new createjs.Container();

        p.Container_initialize = p.initialize;

        p.initialize = function () {
            this.Container_initialize();
        };

        /**
         * @returns {{width, height}}
         */
        p.getChildBounds = function () {
            if (this.childBounds) {
                return this.childBounds;
            }

            if (!this.displayobject.getBounds()) {
                return null;
            }

            return {
                width: this.displayobject.getBounds().width,
                height: this.displayobject.getBounds().height
            };
        };

        /**
         * @returns {boolean}
         */
        p.isVisible = function () {
            return true;
        };

        /**
         * @param width
         * @param height
         */
        p.setLimits = function (width, height) {
            this.limits = {'width': width, 'height': height};
        };

        /**
         * @returns {{width: number, height: number}|*|{width, height}}
         */
        p.getAvailableSpace = function () {
            if (this.limits !== null) {
                return this.limits;
            } else if (this.parent) {
                bounds = this.parent.getBounds();
                if (bounds) {
                    width = bounds.width;
                    height = bounds.height
                }
            } else if (this.getBounds()) {
                width = this.getBounds().width;
                height = this.getBounds().height;
            } else {
                width = 100;
                height = 100;
            }

            return {width: width, height: height};
        };

        p.Container_draw = p.draw;

        p.getLocationHash = function () {
            hash = this.getAvailableSpace();
            return Math.floor(hash.width) + ':' + Math.floor(hash.height);
        };

        /**
         * Determine if the dimensions have changed since last frame.
         * @returns {boolean}
         */
        p.hasChanged = function () {
            hash = this.getLocationHash();

            hasChanged = this.lastHash !== hash;
            this.lastHash = hash;

            return hasChanged;
        };

        // Center a displayobject.
        p.center = function (space) {
            if (!this.displayobject) {
                return;
            }

            var childBounds = this.getChildBounds();
            if (!childBounds) {
                return;
            }

            this.displayobject.x = (space.width - (childBounds.width * this.displayobject.scaleX)) / 2;
            this.displayobject.y = (space.height - (childBounds.height * this.displayobject.scaleY)) / 2;
        };

        /**
         * @param ctx
         * @param ignoreCache
         * @returns {*}
         */
        p.draw = function (ctx, ignoreCache) {
            if (this.initialized && !this.hasChanged()) {
                return this.Container_draw(ctx, ignoreCache);
            }

            this.initialized = true;

            this.removeAllChildren();

            var space = this.getAvailableSpace();

            // Background color!
            if (this.color) {
                var border = new createjs.Shape();

                border.graphics.setStrokeStyle(0);
                border.graphics.beginFill(this.color);
                border.graphics.beginStroke(this.color);
                border.snapToPixel = true;
                border.graphics.drawRect(0, 0, space.width, space.height);

                this.addChild(border);
            } else if (this.displayobject) {

                try {
                    if (!this.getChildBounds()) {
                        this.initialized = false;
                        return;
                    }
                } catch (e) {
                    this.initialized = false;
                    return;
                }

                var childBounds = this.getChildBounds();
                zooms = {
                    x: (space.width / childBounds.width),
                    y: (space.height / childBounds.height)
                };

                var zoomStrategy = this.fillOptions.zoom;

                // Is overridden in a parent container?
                var parentZoomStrategy = this.findAttributeInParents('zoomStrategy', 3);
                if (parentZoomStrategy) {
                    zoomStrategy = parentZoomStrategy;
                }

                switch (zoomStrategy) {

                    case 'minimum':
                        this.displayobject.scaleX = this.displayobject.scaleY = Math.min(zooms.x, zooms.y);
                        this.center(space);
                        break;

                    case 'maximum':
                        this.displayobject.scaleX = this.displayobject.scaleY = Math.max(zooms.x, zooms.y);
                        this.center(space);
                        break;

                    case 'stretch':
                    case 'default':
                        this.displayobject.scaleX = zooms.x;
                        this.displayobject.scaleY = zooms.y;
                        break;
                }

                this.addChild(this.displayobject);
                //console.log(this.displayobject);

            }

            this.applyFilterCacheInParents(5);
            return this.Container_draw(ctx, ignoreCache);
        };

        /**
         * @param attribute
         * @param maxDepth
         * @param object
         * @returns {*|null}
         */
        p.findAttributeInParents = function (attribute, maxDepth, object) {
            if (typeof (object) === 'undefined') {
                object = this;
            }

            if (!object.parent) {
                return null;
            }

            if (object.parent[attribute]) {
                return object.parent[attribute];
            }

            if (maxDepth > 0) {
                return this.findAttributeInParents(attribute, maxDepth, object.parent);
            }
        };

        /**
         * Check if any of our parents have cache that needs to be cleared.
         * @param maxDepth
         * @param object
         * @returns {null|undefined}
         */
        p.applyFilterCacheInParents = function (maxDepth, object) {
            if (typeof (object) === 'undefined') {
                object = this;
            }

            if (!object.parent) {
                return null;
            }

            if (object.parent.filters) {
                var bounds = object.parent.getBounds();
                if (bounds) {
                    object.parent.cache(bounds.x, bounds.y, bounds.width, bounds.height);
                }
            }

            if (maxDepth > 0) {
                return this.applyFilterCacheInParents(maxDepth, object.parent);
            }
        }

        createjs.Background = Background;
        return Background;
    }
);
