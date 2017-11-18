define (
    [
        'EaselJS'
    ],
    function (createjs)
    {
        var width;
        var height;
        var debug = false;
        var hash;
        var hasChanged = false;
        var zooms = {};

        var Background = function (background, options)
        {
            if (typeof (options) === 'undefined') {
                options = {
                    'zoom' : 'stretch'
                };
            }

            this.fillOptions = options;

            if (
                background instanceof Image ||
                background instanceof HTMLImageElement
            ) {
                this.displayobject = new createjs.Bitmap (background);
            }
            else if (background instanceof createjs.DisplayObject) {

                if (!background.getBounds ()) {
                    throw "Objects to be filled must have bounds set.";
                }

                this.displayobject = background;
            }
            else {
                this.color = background;
            }

            this.initialize ();
            this.initialized = false;
            this.limits = null;

            this.debug = debug;
        };

        var p = Background.prototype = new createjs.Container ();

        p.Container_initialize = p.initialize;

        p.initialize = function()
        {
            this.Container_initialize ();
        };

        p.isVisible = function ()
        {
            return true;
        };

        p.setLimits = function (width, height)
        {
            this.limits = { 'width' : width, 'height' : height };
        };

        p.getAvailableSpace = function ()
        {
            if (this.limits !== null)
            {
                return this.limits;
            }

            else if (this.parent)
            {
                width = this.parent.getBounds ().width;
                height = this.parent.getBounds ().height
            }
            else if (this.getBounds ())
            {
                width = this.getBounds ().width;
                height = this.getBounds ().height;
            }
            else
            {
                width = 100;
                height = 100;
            }

            return { 'width' : width, 'height' : height };
        };

        p.Container_draw = p.draw;

        p.getLocationHash = function ()
        {
            hash = this.getAvailableSpace ();
            return hash.width + ':' + hash.height;
        };

        /**
         * Determine if the dimensions have changed since last frame.
         * @returns {boolean}
         */
        p.hasChanged = function ()
        {
            hash = this.getLocationHash ();
            hasChanged = this.lastHash !== hash;
            this.lastHash = hash;

            return hasChanged;
        };

        // Center a displayobject.
        p.center = function (space)
        {
            if (!this.displayobject) {
                return;
            }

            this.displayobject.x = (space.width - (this.displayobject.getBounds ().width * this.displayobject.scaleX)) / 2;
            this.displayobject.y = (space.height - (this.displayobject.getBounds ().height * this.displayobject.scaleY)) / 2;
        };

        p.draw = function (ctx, ignoreCache)
        {
            if (this.initialized && !this.hasChanged ()) {
                return this.Container_draw (ctx, ignoreCache);
            }

            this.initialized = true;

            this.removeAllChildren ();

            var space = this.getAvailableSpace ();

            // Background color!
            if (this.color) {
                var border = new createjs.Shape();

                border.graphics.setStrokeStyle(0);
                border.graphics.beginFill(this.color);
                border.graphics.beginStroke(this.color);
                border.snapToPixel = true;
                border.graphics.drawRect(0, 0, space.width, space.height);

                this.addChild(border);
            }
            else if (this.displayobject) {

            	try {
                    if (!this.displayobject.getBounds()) {
                        this.initialized = false;
                        return;
                    }
                } catch (e) {
            		this.initialized = false;
            		return;
				}

                zooms = {
                    'x' : (space.width / this.displayobject.getBounds ().width),
                    'y' : (space.height / this.displayobject.getBounds ().height)
                };

                switch (this.fillOptions.zoom) {

                    case 'minimum':
                        this.displayobject.scaleX = this.displayobject.scaleY = Math.min (zooms.x, zooms.y);
                        this.center (space);
                    break;

                    case 'maximum':
                        this.displayobject.scaleX = this.displayobject.scaleY = Math.max (zooms.x, zooms.y);
                        this.center (space);
                    break;

                    case 'stretch':
                    case 'default':
                        this.displayobject.scaleX = zooms.x;
                        this.displayobject.scaleY = zooms.y;
                    break;
                }

                this.addChild (this.displayobject);
                console.log(this.displayobject);

            }

            return this.Container_draw (ctx, ignoreCache);
        };

        createjs.Background = Background;
        return Background;
    }
);