define(
    [
        'backbone',
        'easeljs',

        'CatLab/Easelbone/Views/Layer',
        'CatLab/Easelbone/Utilities/DirtyFlag',
        'CatLab/Easelbone/EaselJS/Pinner'
    ],
    function (Backbone, createjs, Layer, DirtyFlag, Pinner) {
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

                this.dirtyRendering = typeof(options.dirtyRendering) !== 'undefined' ? !!options.dirtyRendering : false;
                this.heartbeatInterval = 1000;
                this._lastPaintTime = 0;

                if (this.dirtyRendering) {
                    // Split EaselJS's combined tick-and-paint: we tick the
                    // stage every frame ourselves and paint only when dirty.
                    this.stage.tickOnUpdate = false;

                    DirtyFlag.installMovieClipHook(createjs);

                    // Mouse interaction changes hover/press visuals.
                    var invalidate = this.invalidate.bind(this);
                    this.stage.on('stagemousedown', invalidate);
                    this.stage.on('stagemouseup', invalidate);
                    this.stage.on('stagemousemove', invalidate);
                }

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
             * Designate the container that pinToTop reparents objects into.
             * Lets the host control z-order (e.g. above the smiley layer but
             * below a blackout overlay).
             * @param container
             */
            setPinContainer: function (container) {
                Pinner.setContainer(this.stage, container);
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
             * Force a repaint on the next frame (dirty rendering mode).
             */
            invalidate: function () {
                DirtyFlag.invalidate();
            },

            /**
             *
             * @param event
             */
            tick: function (event) {
                this.trigger('tick:before', event);
                this.dirty = false;

                for (i = 0; i < this.layers.length; i++) {
                    layer = this.layers[i];
                    if (layer.tick(event)) {
                        this.dirty = true;
                    }
                }

                if (this.dirtyRendering) {
                    // Advance the display list (MovieClips, BigText change
                    // detection) without painting; paint only when dirty.
                    this.stage.tick(event);

                    if (DirtyFlag.consume()) {
                        this.dirty = true;
                    }

                    if (
                        typeof (createjs.Tween) !== 'undefined' &&
                        createjs.Tween.hasActiveTweens &&
                        createjs.Tween.hasActiveTweens()
                    ) {
                        this.dirty = true;
                    }

                    // Self-healing safety net: never go longer than the
                    // heartbeat interval without a paint.
                    if (event.time - this._lastPaintTime >= this.heartbeatInterval) {
                        this.dirty = true;
                    }

                    if (this.dirty) {
                        this._lastPaintTime = event.time;
                        this.update();
                    }
                } else if (this.dirty) {
                    this.update();
                }

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
                if (this.dirtyRendering) {
                    // Direct paints (render/resize) also reset the heartbeat.
                    this._lastPaintTime = createjs.Ticker.getTime();
                }
                Pinner.sync(this.stage);
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
