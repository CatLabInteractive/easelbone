define(
    [
        'backbone',
        'easeljs',

        'CatLab/Easelbone/Views/Layer',
        'CatLab/Easelbone/Utilities/DirtyFlag',
        'CatLab/Easelbone/Utilities/DirtyRendering',
        'CatLab/Easelbone/EaselJS/Pinner'
    ],
    function (Backbone, createjs, Layer, DirtyFlag, DirtyRendering, Pinner) {
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

                // Longest time without a paint in dirty mode (ms): a change
                // nothing noticed shows this late instead of not at all.
                this.heartbeatInterval = 500;
                this._lastPaintTime = 0;

                // Every stage paint, in either mode. A host can show paints
                // per second next to the ticker's FPS.
                this.paintCount = 0;

                this.dirtyRendering = false;
                this.dirtyTracker = null;
                this._invalidated = false;
                this._flagGeneration = 0;
                this._invalidateListener = this.invalidate.bind(this);

                // Dirty rendering: the stage still ticks every frame, but is
                // only painted when what it would paint has changed (see
                // Utilities/DirtyRendering for what counts and what does not).
                this.setDirtyRendering(!!options.dirtyRendering);

                // Ticker
                //createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
                this._tickListener = function (e) {
                    if (createjs.Ticker.paused) {
                        return;
                    }

                    this.tick(e)
                }.bind(this);
                createjs.Ticker.addEventListener('tick', this._tickListener);

                //createjs.Ticker.addEventListener('tick', this.stage);

                //this.stage.enableMouseOver(assets.properties.fps);
                this.resize();
            },

            /**
             * Turn dirty rendering on or off. Off stops the tracker and
             * hands painting back to the views' tick(), as without the
             * option.
             * @param {boolean} enabled
             */
            setDirtyRendering: function (enabled) {
                enabled = !!enabled;
                if (enabled === this.dirtyRendering) {
                    return;
                }
                this.dirtyRendering = enabled;

                var invalidate = this._invalidateListener;
                var names = ['stagemousedown', 'stagemouseup', 'stagemousemove'];
                var hasDocument = typeof (document) !== 'undefined' && document.addEventListener;
                var n;

                if (enabled) {
                    // Split EaselJS's combined tick-and-paint: we tick the
                    // stage every frame ourselves and paint only when dirty.
                    this.stage.tickOnUpdate = false;

                    this.dirtyTracker = DirtyRendering.track(this.stage, createjs);
                    this._flagGeneration = DirtyFlag.generation();
                    this._invalidated = false;

                    // Mouse interaction changes hover/press visuals.
                    for (n = 0; n < names.length; n++) {
                        this.stage.addEventListener(names[n], invalidate);
                    }

                    // A browser may drop the canvas of a page in the
                    // background: paint as soon as it is looked at again.
                    if (hasDocument) {
                        document.addEventListener('visibilitychange', invalidate);
                    }
                } else {
                    this.stage.tickOnUpdate = true;

                    if (this.dirtyTracker) {
                        this.dirtyTracker.stop();
                        this.dirtyTracker = null;
                    }

                    for (n = 0; n < names.length; n++) {
                        this.stage.removeEventListener(names[n], invalidate);
                    }

                    if (hasDocument) {
                        document.removeEventListener('visibilitychange', invalidate);
                    }
                }
            },

            /**
             * Let go of the ticker, the page and the tracker. The root view
             * does not tick or paint after this. Safe to call twice.
             */
            destroy: function () {
                if (this._destroyed) {
                    return;
                }
                this._destroyed = true;

                this.setDirtyRendering(false);
                createjs.Ticker.removeEventListener('tick', this._tickListener);
            },

            /**
             * Backbone's remove(), after destroy().
             */
            remove: function () {
                this.destroy();
                return Backbone.View.prototype.remove.apply(this, arguments);
            },

            createStage : function(options) {
				var stage;
                if (typeof(options.webgl) !== 'undefined' && options.webgl) {
                    stage = new createjs.StageGL(this.canvas)
                } else {
                    stage = new createjs.Stage(this.canvas)
                }

				stage.snapToPixelEnabled = this.snapToPixel;

				// Touch. Without this EaselJS only ever sees the mouse events a
				// browser synthesises from a tap (a click), never mousedown /
				// pressmove / pressup / mouseover from a finger: buttons worked
				// on a phone but nothing could be dragged (a scroll area, a
				// scrollbar thumb, a slider). Single-touch keeps the one-pointer
				// click semantics; preventDefault (allowDefault false) keeps the
				// page from scrolling or zooming under the canvas and stops the
				// browser's own synthetic click after the touch one. Pass
				// `touch: false` to opt out.
				if (
					options.touch !== false &&
					typeof (createjs.Touch) !== 'undefined' &&
					createjs.Touch.isSupported()
				) {
					createjs.Touch.enable(stage, true, false);
				}

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
             * Force a repaint on the next frame (dirty rendering mode). Only
             * needed for what the display list does not show: pixels drawn
             * into a canvas that a Bitmap displays, a custom draw(), a
             * Graphics command edited after it was appended. A changed
             * display object is found without it.
             */
            invalidate: function () {
                this._invalidated = true;
            },

            /**
             *
             * @param event
             */
            tick: function (event) {
                this.trigger('tick:before', event);
                this.dirty = false;

                // Views/Base.tick() asks DirtyRendering whether its root view
                // is a dirty one: tell it, for the length of this loop.
                var previous = DirtyRendering.setTicking(this.dirtyTracker);
                try {
                    for (i = 0; i < this.layers.length; i++) {
                        layer = this.layers[i];
                        if (layer.tick(event)) {
                            this.dirty = true;
                        }
                    }
                } finally {
                    DirtyRendering.setTicking(previous);
                }

                if (this.dirtyRendering) {
                    // Advance the display list (MovieClips, BigText change
                    // detection) without painting; paint only when dirty.
                    this.stage.tick(event);

                    // What the stage would paint now differs from the last
                    // frame (or did one of the last few frames). Asked on
                    // every tick, also when something else already decided
                    // to paint: the tracker has to see every frame.
                    if (this.dirtyTracker.afterTick()) {
                        this.dirty = true;
                    }

                    // invalidate() on this root view, or an easelbone object
                    // that changed something the display list does not show
                    // (DirtyFlag: page-wide, every root view sees it once).
                    if (this._invalidated) {
                        this._invalidated = false;
                        this.dirty = true;
                    }
                    var generation = DirtyFlag.generation();
                    if (generation !== this._flagGeneration) {
                        this._flagGeneration = generation;
                        this.dirty = true;
                    }

                    // Self-healing safety net: never go longer than the
                    // heartbeat interval without a paint.
                    if (createjs.Ticker.getTime() - this._lastPaintTime >= this.heartbeatInterval) {
                        this.dirty = true;
                    }

                    if (this.dirty) {
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

                // A direct render (setView, resize, a host that renders
                // while the ticker is paused) has always ticked the stage as
                // well: that is what stage.update() does. Dirty rendering
                // switches that off on the stage (tickOnUpdate = false), so
                // the tick is done here. Without it what was just rendered
                // would be painted before its texts were laid out (BigText
                // draws from its tick).
                if (this.dirtyRendering) {
                    this.stage.tick();
                }

                // And update the stage.
                this.update();
                return this;
            },

            /**
             * Paint the stage now. In dirty mode this does not tick the
             * stage (tick() and render() have done that).
             */
            update: function () {
                this.paintCount++;
                if (this.dirtyRendering) {
                    // Every paint restarts the heartbeat.
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
