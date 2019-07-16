define(
    [
        'backbone',
        'easeljs',
        'CatLab/Easelbone/Utilities/GlobalProperties',
        'CatLab/Easelbone/Utilities/MovieClipHelper'
    ],
    function (
        Backbone,
        createjs,
        GlobalProperties,
        MovieClipHelper
    ) {
        "use strict";

        return Backbone.View.extend({

            el: 'div',
            easelScreen: null,

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
                if (typeof (this.el.stage) !== 'undefined') {
                    return this.el.stage;
                } else if (typeof (this.el.getStage) !== 'undefined') {
                    return this.el.getStage();
                }
            },

            /**
             * Set the screen that will be used when rendering the frame.
             * @param screen
             */
            setScreen: function(screen) {
                this.easelScreen = screen;
                return this;
            },

            getScreen: function() {
                return this.easelScreen;
            },

            /**
             * @param container
             * @param label
             * @returns {boolean}
             */
            hasLabeledFrame : function(label, container) {

                if (typeof(container) === 'undefined') {
                    container = this.easelScreen;
                }

                if (!container) {
                    throw new Error('hasLabeledFrame requires a screen to be set or a container to be provided.');
                }

                if (typeof(container.timeline) === 'undefined') {
                    return false;
                }

                var labels = container.timeline.getLabels();
                for (var i = 0; i < labels.length; i ++) {
                    if (labels[i].label === label) {
                        return true;
                    }
                }

                // Also take a look in the children
                var result = false;

                this.forEachNamedChild(container, function(child) {
                    if (this.hasLabeledFrame(label, child)) {
                        result = true;
                        return false; // return false will stop the loop.
                    }
                }.bind(this));

                return result;

            },

            jumpToFrame: function(label, container) {
                if (typeof(container) === 'undefined') {
                    container = this.easelScreen;
                }

                if (!container) {
                    throw new Error('hasLabeledFrame requires a screen to be set or a container to be provided.');
                }

                if (!container.timeline) {
                    return;
                }

                var labels = container.timeline.getLabels();
                for (var i = 0; i < labels.length; i ++) {
                    if (labels[i].label === label) {
                        container.gotoAndPlay(label);
                    }
                }

                this.forEachNamedChild(container, function(child) {
                    this.jumpToFrame(label, child);
                }.bind(this));
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
                if (this.easelScreen) {
                    this.addCenter(this.easelScreen);
                    return this;
                }

                var container = new createjs.Container();
                container.setBounds(0, 0, this.getWidth(), this.getHeight());

                var text = new createjs.BigText("easelbone view: no screen set and render function was not overridden...", "Arial", "#000000");
                container.addChild(text);

                this.el.addChild(container);
            },


            /**
             * Find elements by name and turn them into placeholders.
             * Returns an array with all placeholders.
             * @param {string|array} name
             * @param container
             * @returns {Array}
             */
            findPlaceholders: function (name, container) {
                if (typeof(container) === 'undefined') {
                    container = [];
                    if (this.easelScreen) {
                        container.push(this.easelScreen);
                    }
                }

                return MovieClipHelper.findPlaceholders(name, container);
            },

            /**
             * Find all named elements (generated by adobe animate) in the container
             * or its children (for named elements), with dot notation support and fallback
             * to deprecated/alternative names when providing an array.
             * @param {string|Array} names
             * @param containers
             * @returns {Array}
             */
            findFromNames: function (names, containers) {

                if (typeof(containers) === 'undefined') {
                    containers = [];
                    if (this.easelScreen) {
                        containers.push(this.easelScreen);
                    }
                }

                return MovieClipHelper.findFromNames(names, containers);
            },

            /**
             * Find all named elements (generated by adobe animate) in the container
             * and all child named elements and return them.
             * @param container
             * @param name
             * @param results
             * @returns {Array}
             */
            findFromNameInContainer: function (container, name, results) {
                return MovieClipHelper.findFromNameInContainer(container, name, results);
            },

            /**
             * Loop through all named children
             * @param container
             * @param callback
             */
            forEachNamedChild: function(container, callback) {
                return MovieClipHelper.forEachNamedChild(container, callback);
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