define(
    [
        'backbone',
        'CatLab/Easelbone/Utilities/GlobalProperties'
    ],
    function (Backbone, GlobalProperties) {
        return Backbone.View.extend({

            el: 'div',

            /**
             *
             * @param root
             */
            setRootView: function (root) {
                this.set('root', root);
            },

            /**
             * Get canvas width.
             */
            getWidth: function () {
                return this.getStage().canvas.width;
            },

            /**
             * Get canvas height.
             */
            getHeight: function () {
                return this.getStage().canvas.height;
            },

            /**
             * Get stage.
             * @returns {*}
             */
            getStage: function () {
                if (typeof(this.el.stage) !== 'undefined') {
                    return this.el.stage;
                } else if (typeof(this.el.getStage) !== 'undefined') {
                    return this.el.getStage();
                }
            },

            /**
             * @param element
             */
            scale: function (element) {
                var scale = this.getScale();

                element.scaleX = scale.x;
                element.scaleY = scale.y;
            },

            /**
             * @param originalwidth
             * @param originalheight
             * @param zoom
             * @returns {{x: number, y: number}}
             */
            getScale: function (originalwidth, originalheight, zoom) {
                if (typeof (originalwidth) === 'undefined' || originalwidth === null) {
                    originalwidth = GlobalProperties.getWidth();
                }

                if (typeof (originalheight) === 'undefined' || originalheight === null) {
                    originalheight = GlobalProperties.getHeight();
                }

                if (typeof (zoom) === 'undefined') {
                    zoom = false;
                }

                var sx = this.getWidth() / originalwidth;
                var sy = this.getHeight() / originalheight;

                var s = zoom ? Math.max(sx, sy) : Math.min(sx, sy);

                return {'x': s, 'y': s};
            },

            /**
             * @param element
             * @param originalwidth
             * @param originalheight
             * @param zoom
             * @param altScale
             */
            addCenter: function (element, originalwidth, originalheight, zoom, altScale) {
                if (typeof (originalwidth) === 'undefined' || originalwidth === null) {
                    originalwidth = GlobalProperties.getWidth();
                }

                if (typeof (originalheight) === 'undefined' || originalheight === null) {
                    originalheight = GlobalProperties.getHeight();
                }

                if (typeof (altScale) === 'undefined' || altScale === null) {
                    altScale = 1;
                }

                var scale = this.getScale(originalwidth, originalheight, zoom);

                scale.x = scale.x * altScale;
                scale.y = scale.y * altScale;

                element.x = ((this.getWidth() - (originalwidth * scale.x)) / 2);
                element.y = ((this.getHeight() - (originalheight * scale.y)) / 2);

                element.scaleX = scale.x;
                element.scaleY = scale.y;

                this.el.addChild(element);

                // Black borders
                var g = new createjs.Graphics();

                if (element.x >= 1) {
                    g.beginFill(this.getBackground()).drawRect(0, 0, Math.ceil(element.x), this.getHeight());
                    g.beginFill(this.getBackground()).drawRect(this.getWidth() - Math.ceil(element.x), 0, Math.ceil(element.x), this.getHeight());
                }

                if (element.y >= 1) {
                    g.beginFill(this.getBackground()).drawRect(0, 0, this.getWidth(), Math.ceil(element.y));
                    g.beginFill(this.getBackground()).drawRect(0, this.getHeight() - Math.ceil(element.y), this.getWidth(), Math.ceil(element.y));
                }

                var s = new createjs.Shape(g);
                this.el.addChild(s);
            },

            /**
             *
             */
            clear: function () {
                this.el.removeAllChildren();

                // Black
                var g = new createjs.Graphics();
                g.beginFill(this.getBackground()).drawRect(0, 0, this.getWidth(), this.getHeight());
                var s = new createjs.Shape(g);

                this.el.addChild(s);
            },

            /**
             * @returns {string}
             */
            getBackground: function () {
                return '#000000';
            },

            /**
             *
             */
            render: function () {
                var container = new createjs.Container();
                container.setBounds(0, 0, this.getWidth(), this.getHeight());

                var text = new createjs.BigText("Please wait, initializing application", "Arial", "#000000");
                container.addChild(text);

                this.el.addChild(container);
            },

            /**
             * Tick and return TRUE if the view should be updated.
             * @returns {boolean}
             */
            tick: function () {
                return true;
            },

            /**
             *
             */
            afterRender: function () {

            },

            /**
             *
             */
            onRemove: function () {

            }

        });
    }
);