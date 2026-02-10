define(
    [
        'backbone',
        'easeljs',

        'CatLab/Easelbone/Views/Layer'
    ],
    function (Backbone, createjs, Layer) {
        var i;
        var layer;

        return Backbone.View.extend({

            stage: null,
            container: null,
            hudcontainer: null,

            view: null,
            hud: null,

            maxCanvasSize: null,

            width: null,
            height: null,

			initialize: function (options) {
				this.initializeRootView(options);
			},

            /**
             * @param options
             */
            initializeRootView: function (options) {

                if (typeof (options.canvas) !== 'undefined') {
                    this.canvas = options.canvas;
                    this.container = this.canvas.parentNode;
                }
                else {
                    if (typeof (options.container) === 'undefined') {
                        throw new Error("Container must be defined for root view.");
                    }

                    this.canvas = document.createElement('canvas');
                    this.container = options.container;
                    this.container.appendChild(this.canvas);

                }

                if (
                    typeof(options.width) !== 'undefined' &&
                    typeof(options.height) !== 'undefined'
                ) {
                    this.width = options.width;
                    this.height = options.height;
                }

                this.stage = this.createStage(options);

                // Create the main layer.
                this.layers = [];
                this.layerMap = {};

                this.dirty = false;
                this.mainLayer = this.nextLayer('main');

				this.snapToPixel = typeof(options.snapToPixel) !== 'undefined' ? options.snapToPixel : false;

                // Ticker
                //createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
                createjs.Ticker.addEventListener('tick', function (e) {
                    if (createjs.Ticker.paused) {
                        return;
                    }

                    this.tick(e)
                }.bind(this));

                //createjs.Ticker.addEventListener('tick', this.stage);

                //this.stage.enableMouseOver(assets.properties.fps);
                this.resize();
            },

            createStage : function(options) {
				var stage;
                if (typeof(options.webgl) !== 'undefined' && options.webgl) {
                    stage = new createjs.StageGL(this.canvas)
                } else {
                    stage = new createjs.Stage(this.canvas)
                }

				stage.snapToPixelEnabled = this.snapToPixel;

				return stage;
            },

            setMaxCanvasSize: function(width, height)
            {
                this.maxCanvasSize = [ width, height ];
            },

            /**
             * Create a new layer that will be put on top of the previous one.
             * @param name
             * @returns {Layer}
             */
            nextLayer: function (name) {

                if (typeof (name) === 'undefined') {
                    name = 'Layer' + this.layers.length;
                }

                var layer = new Layer();
				layer.container.snapToPixel = this.snapToPixel;

				this.stage.addChild(layer.container);

                this.layers.push(layer);
                this.layerMap[name] = layer;

                return layer;
            },

            /**
             * Return a previously created layer.
             * @param name
             * @returns {*}
             */
            getLayer: function (name) {
                return this.layerMap[name];
            },

            /**
             * Set a view on the main layer.
             * @param view
             */
            setView: function (view) {
                this.mainLayer.setView(view);

                // And render!
                this.render();
            },

            /**
             *
             * @param event
             */
            tick: function (event) {
                // Listen to the voice
                //Speech.onRenderFrame ();
                this.trigger('tick:before', event);
                this.dirty = false;

                for (i = 0; i < this.layers.length; i++) {
                    layer = this.layers[i];
                    if (layer.tick(event)) {
                        this.dirty = true;
                    }
                }

                if (this.dirty) {
                    this.update();
                }

                // Update the stage.
                //this.stage.handleEvent ("tick", event);

                this.trigger('tick:after');
            },

            /**
             *
             * @returns {exports}
             */
            render: function () {
                for (i = 0; i < this.layers.length; i++) {
                    this.layers[i].render();
                }

                // And update the stage.
                this.update();
                return this;
            },

            /**
             *
             */
            update: function () {
                this.stage.update();
            },

            /**
             *
             */
            fullscreen: function () {



            },

            /**
             *
             */
            resize: function () {

                if (
                    this.width &&
                    this.height
                ) {
                    this.canvas.width = this.width;
                    this.canvas.height = this.height;
                } else if (typeof (this.container) !== 'undefined') {
                    this.canvas.width = this.container.offsetWidth;
                    this.canvas.height = this.container.offsetHeight;
                } else {
                    this.canvas.width = window.innerWidth;
                    this.canvas.height = window.innerHeight;
                }

                if (this.maxCanvasSize !== null) {
                    this.canvas.width = Math.min(this.canvas.width, this.maxCanvasSize[0]);
                    this.canvas.height = Math.min(this.canvas.height, this.maxCanvasSize[1]);
                }

                this.render();
            },

            /**
             * Show an alert message
             */
            alert: function(message, callback) {
                alert(message);
                callback();
            },

            /**
             * Show a confirmation message
             * @param message
             * @param callback
             */
            confirm: function(message, callback) {
                callback(confirm(message));
            }
        });
    }
);
