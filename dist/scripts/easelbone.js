define (
	'CatLab/Easelbone/Utilities/Loader',[
		'PreloadJS'
	],
	function (PreloadJS) {

		var Loader = function () {

			this.loader = new createjs.LoadQueue (false);

		};

		Loader.prototype.loadAssets = function (assets, path) {
			this.loader.loadManifest (assets.properties.manifest, true, path);
		};

		Loader.prototype.load = function (callback) {
			callback ();
		};

		return Loader;

	}
);
define(
    'CatLab/Easelbone/Views/Layer',[
        'EaselJS',
        'underscore',
        'backbone'
    ],
    function (createjs, _, Backbone) {

        var Layer = function (options) {

            _.extend(this, Backbone.Events);

            if (typeof (options) === 'undefined') {
                options = {};
            }

            if (typeof (options.container) !== 'undefined') {
                this.container = options.container;
            }
            else {
                this.container = new createjs.Container();
            }

            this.view = null;
        };

        Layer.prototype.setView = function (view) {
            if (this.view !== null) {
                this.view.trigger('stage:removed');
            }

            this.view = view;

            // Clear the container
            this.container.removeAllChildren();

            // Create a container for the view
            var container = new createjs.Container();

            // Set the view correctly
            this.view.setElement(container);

            // Add the container to the stage
            this.container.addChild(container);

            // Listen to all events and pass them trough.
            this.view.on('all', function (event) {
                this.trigger("view:" + event);
            }.bind(this));

            this.view.trigger('stage:added');
        };

        Layer.prototype.render = function () {

            if (!this.view)
                return;

            // Clear the element, so that render can recreate it
            this.view.el.removeAllChildren();

            // Before render
            this.view.trigger('render:before');

            // Render the subview
            this.view.render();

            // Post render
            this.view.trigger('render');

            // Also post render
            this.view.trigger('render:after');

        };

        Layer.prototype.tick = function (event) {
            if (this.view) {
                return this.view.tick(event);
            }
            return false;
        };

        return Layer;

    }
);
define(
    'CatLab/Easelbone/Views/Root',[
        'backbone',
        'EaselJS',

        'CatLab/Easelbone/Views/Layer'
    ],
    function (Backbone, createjs, Layer) {
        var i;
        var layer;

        var dirty = false;

        return Backbone.View.extend({

            stage: null,
            container: null,
            hudcontainer: null,

            view: null,
            hud: null,

            maxCanvasSize: null,

            /**
             * @param options
             */
            initialize: function (options) {

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

                this.stage = this.createStage();

                // Create the main layer.
                this.layers = [];
                this.layerMap = {};

                this.mainLayer = this.nextLayer('main');

                // Ticker
                //createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
                createjs.Ticker.addEventListener('tick', function (e) {
                    this.tick(e)
                }.bind(this));

                //createjs.Ticker.addEventListener('tick', this.stage);

                //this.stage.enableMouseOver(assets.properties.fps);
                this.resize();
            },

            createStage : function() {
                return new createjs.StageGL(this.canvas)
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
                dirty = false;

                for (i = 0; i < this.layers.length; i++) {
                    layer = this.layers[i];
                    if (layer.tick(event)) {
                        dirty = true;
                    }
                }

                if (dirty) {
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
                if (typeof (this.container) !== 'undefined') {
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
            }
        });
    }
);
define (
	'CatLab/Easelbone/Utilities/GlobalProperties',[
		'backbone'
	],
	function (backbone)
	{

		var model = backbone.Model.extend ({

			'initialize' : function () {

				this.set ({
					'width': 800,
					'height' : 600,
					'font' : 'sans-serif',
					'textColor' : 'white'
				});

			},

			'getWidth' : function () {
				return this.get ('width');
			},

			'getHeight' : function () {
				return this.get ('height');
			},

			'getDefaultFont' : function () {
				return this.get ('font');
			},

			'getDefaultTextColor' : function () {
				return this.get ('textColor');
			},

			'ifUndefined' : function (value, defaultValue) {
				if (typeof (value) !== 'undefined' && value !== null) {
					return value;
				}
				return defaultValue;
			}


		});

		// Return an instance, not a prototype!
		return new model ();

	}
);
define(
    'CatLab/Easelbone/Views/Base',[
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
define (
    'CatLab/Easelbone/Views/Navigatable',[
        'underscore',
        'CatLab/Easelbone/Views/Base'
    ],
    function (
        _,
        BaseView
    ) {
        return BaseView.extend ({

            ORIENTATION : {
                VERTICAL : 'vertical',
                HORIZONTAL : 'horizontal'
            },

            DefaultControls : {

                navigation : [ 'left' , 'right' ],
                toggle : [ 'start', 'a' ],
                manipulation : [ 'down', 'up' ],
                back : [ 'b', 'back' ]

            },

            initialize : function (options)
            {
                this.initializeNavigatable (options);
            },

            initializeNavigatable : function (options)
            {
                options = options || {};

                this._users = [];
                this._currentIndex = -1;
                this._current = null;
                this._options = [];
                this._backCallback = null;

                this._controls = _.extend(this.DefaultControls, {});

                if (typeof (options.orientation) !== 'undefined') {
                    // Is orientation vertical?
                    if (options.orientation === this.ORIENTATION.VERTICAL) {
                        this._controls.navigation = [ 'up', 'down' ];
                        this._controls.manipulation = [ 'left' , 'right' ];
                    } else {
                        this._controls.navigation = [ 'left' , 'right' ];
                        this._controls.manipulation = [ 'up', 'down' ];
                    }
                }

                // Reset the options for Navigatable
                this.resetOptions ();
            },

            /**
             * To control the navigatable with keyboard, gamepad or smartphone,
             * set a user collection here.
             * @param users
             */
            setUsers : function (users)
            {
                this._users = users;

                // Set the events for this controller.
                for (var i = 0; i < this._users.length; i ++) {
                    this.setWebremoteControls(this._users[i]);
                }
            },

            setWebremoteControls : function(user)
            {
                user.setView ("catlab-nes");
                user.clearEvents ();

                // Focus next and previous
                user.control(this._controls.navigation[0]).click(function () { this.previous(); }.bind(this));
                user.control(this._controls.navigation[1]).click(function () { this.next(); }.bind(this));

                // Toggle
                for (var i = 0; i < this._controls.toggle.length; i ++ ) {
                    (function(i) {
                        user.control(this._controls.toggle[i]).click (function () {
                            this.keyInput(this._controls.toggle[i]);
                        }.bind(this));
                    }.bind(this))(i);
                }

                // Back
                for (i = 0; i < this._controls.back.length; i ++ ) {
                    (function(i) {
                        user.control(this._controls.back[i]).click (function () {
                            this.triggerBack();
                        }.bind(this));
                    }.bind(this))(i);
                }

                // Increase or decreate
                user.control(this._controls.manipulation[0]).click(function () { this.keyInput('down'); }.bind(this));
                user.control(this._controls.manipulation[1]).click(function () { this.keyInput('up'); }.bind(this));
            },

            /**
             * @param backCallback
             */
            setBack : function(backCallback)
            {
                this._backCallback = backCallback;
            },

            /**
             *
             */
            triggerBack : function()
            {
                if (this._backCallback !== null) {
                    this._backCallback.apply();
                }
            },

            next : function ()
            {
                this.activate ((this._currentIndex + 1) % this._options.length);
            },

            previous : function ()
            {
                var previous = this._currentIndex - 1;
                if (previous < 0) {
                    previous = this._options.length - 1;
                }
                this.activate (previous);
            },

            keyInput : function (button)
            {
                if (this._current) {
                    this._current.keyInput(button);
                }
            },

            resetOptions : function ()
            {
                this._options = [];
            },

            addControl : function (control)
            {
                this._options.push (control);

                if (this._options.length === 1) {
                    // First control added? Activate that one.
                    setTimeout (function () {
                        this.activate(0, false);
                    }.bind(this), 1);
                } else {
                    control.deactivate (false);
                }
            },

            /**
             * Active control with given index.
             * @param controlIndex
             * @param animate
             */
            activate : function (controlIndex, animate)
            {
                if (typeof(animate) === 'undefined') {
                    animate = true;
                }

                if (this._currentIndex !== -1 && this._currentIndex !== null) {
                    this._options[this._currentIndex].deactivate(animate);
                }

                this._currentIndex = controlIndex;
                this._options[controlIndex].activate(animate);
                this._current = this._options[controlIndex];
            }

        });
    }
);
define(
    'CatLab/Easelbone/Controls/Base',[
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
define (
	'CatLab/Easelbone/Utilities/Path',[],
	function ()
	{
		var dp, value;

		var Path = function (minimum, maximum) {

			this.start = { 'x' : minimum.x, 'y' : minimum.y };
			this.end = { 'x' : maximum.x, 'y' : maximum.y };

			this.distance = {
				'x' : (maximum.x - minimum.x),
				'y' : (maximum.y - minimum.y)
			};

			this.orientation = (this.distance.x > this.distance.y) ? 'horizontal' : 'vertical';
			this.indicatorSize = { 'x' : 0, 'y' : 0 };
		};

		Path.prototype.getPosition = function (progress) {

			if (isNaN (progress)) {
				progress = 0;
			}

			return {
				'x' : this.start.x + ((this.distance.x - this.indicatorSize.x) * progress),
				'y' : this.start.y + ((this.distance.y - this.indicatorSize.y) * progress)
			}

		};

		/**
		 * Return an estimated value from x and y values.
		 * @param x
		 * @param y
		 */
		Path.prototype.getValue = function (x, y) {

			if (this.orientation === 'horizontal') {
				dp = (x - this.start.x) / this.distance.x;
			}
			else {
				dp = (y - this.start.y) / this.distance.y;
			}

			value = Math.max (0, Math.min (1, dp));
			return value;
		};

		Path.prototype.position = function (element, progress) {

			var location = this.getPosition (progress);

			element.x = location.x;
			element.y = location.y;

		};

		/**
		 * If set, indicator size will be withdraw
		 * @param width
		 * @param height
		 */
		Path.prototype.setIndicatorSize = function (width, height) {
			this.indicatorSize = { 'x' : width, 'y' : height };
		};

		return Path;
	}
);
define(
    'CatLab/Easelbone/Controls/Slider',[
        'CatLab/Easelbone/Controls/Base',
        'CatLab/Easelbone/Utilities/Path'
    ],
    function (Base,
              Path) {

        var Slider = function (element)
        {
            var position;

            this.element = element;
            this.step = 0.1;

            this.path = new Path(this.element.minimum, this.element.maximum);
            this.setValue(0.5);

            // Mouse events
            this.element.pointer.on('pressmove', function (evt) {
                position = this.element.globalToLocal(evt.stageX, evt.stageY);
                this.setValue(this.path.getValue(position.x, position.y));
            }.bind(this));

            this.element.pointer.on('click', function (evt) {
                evt.stopPropagation();
            });

            this.element.on('click', function (evt) {
                position = this.element.globalToLocal(evt.stageX, evt.stageY);
                this.setValue(this.path.getValue(position.x, position.y));
            }.bind(this));

        };

        // Extend base.
        Slider.prototype = Object.create(Base.prototype);
        Slider.prototype.constructor = Slider;

        Slider.prototype.link = function (model, attribute) {

            this.setValue(model.get(attribute));
            return this;

        };

        Slider.prototype.setValue = function (value) {

            this.value = value;
            this.path.position(this.element.pointer, this.value);
        };

        Slider.prototype.keyInput = function (input) {

            console.log(input);

            switch (input) {
                case 'up':
                    this.value = Math.min(1, this.value + this.step);
                    break;

                case 'down':
                    this.value = Math.max(0, this.value - this.step);
                    break;
            }

            this.setValue(this.value);

        };

        return Slider;

    }
);
define(
    'CatLab/Easelbone/Controls/Checkbox',[
        'CatLab/Easelbone/Controls/Base'
    ],
    function (Base) {

        var Checkbox = function (element) {

            Base.call(this, element);

            this.element = element;

            // Listen to click event
            this.element.addEventListener('click', function () {
                this.toggle();
            }.bind(this));

        };

        // Extend base.
        Checkbox.prototype = Object.create(Base.prototype);
        Checkbox.prototype.constructor = Checkbox;

        Checkbox.prototype.toggle = function () {
            this.checked = !this.checked;
            this.update();
        };

        Checkbox.prototype.check = function () {
            this.checked = true;
            this.update();
        };

        Checkbox.prototype.uncheck = function () {
            this.checked = false;
            this.update();
        };

        Checkbox.prototype.keyInput = function (input) {
            switch (input) {
                case 'a':
                case 'start':

                    this.toggle();

                    break;
            }
        };

        return Checkbox;

    }
);
define (
    'CatLab/Easelbone/EaselJS/DisplayObjects/BigText',[
        'EaselJS',
        'CatLab/Easelbone/Utilities/GlobalProperties'
    ],
    function (createjs, GlobalProperties)
    {
        var width;
        var height;
        var debug = false;
        var hash;
        var location;
        var hasChanged = false;

        var currentHeight;
        var currentWidth;

        var currentBounds;
        var currentSize = {
            'width' : 0,
            'height' : 0
        };

        var fontLineheightCache = {};

        var fontOffsets = {};

        var fontSize;

        var BigText = function (aTextstring, aFont, aColor, align)
        {
            this.textstring = aTextstring;
            this.font = GlobalProperties.ifUndefined (aFont, GlobalProperties.getDefaultFont ());
            this.color = GlobalProperties.ifUndefined (aColor, GlobalProperties.getDefaultTextColor ());
            this.align = typeof (align) === 'undefined' ? 'center' : align;

            this.initialize ();
            this.initialized = false;
            this.limits = null;

            this.debug = debug;
            this.fontsize = 0;
        };

        BigText.setFontOffset = function(font, x, y)
        {
            fontOffsets[font] = {
                'x' : x,
                'y' : y
            };
        };

        function updateCurrentSize(text)
        {
            currentBounds = text.getMetrics();

            currentSize.height = currentBounds.height;
            currentSize.width = currentBounds.width;
        }

        function measureLineHeight(text)
        {
            return Math.max(
                measureLetter(text, "M").width,
                measureLetter(text, "m").width
            ) * 1.2;
        }

        function measureLetter(text, letter)
        {
            var ctx = createjs.Text._workingContext;
            ctx.save();
            var size = text._prepContext(ctx).measureText(letter);
            ctx.restore();
            return size;
        }

        function getFontLineheight(text)
        {
            if (typeof(fontLineheightCache[text.font]) === 'undefined') {
                fontLineheightCache[text.font] = measureLineHeight(text);
            }

            return fontLineheightCache[text.font];
        }

        var p = BigText.prototype = new createjs.Container ();

        p.Container_initialize = p.initialize;
        p.Container_tick = p._tick;

        p.getFontOffset = function(font)
        {
            var fontName = font.split(' ');
            fontName.shift();
            fontName = fontName.join(' ');

            if (typeof(fontOffsets[fontName]) === 'undefined') {
                return { 'x' : 0, 'y' : 0 };
            } else {
                return fontOffsets[fontName];
            }
        };

        p.initialize = function() {
            this.Container_initialize ();
        };

        p.isVisible = function ()
        {
            return true;
        };

        p.setText = function (text)
        {
            this.textstring = text;

            if (this.textElement) {
                this.textElement.text = text;
            }
        };

        p.setLimits = function (width, height)
        {
            this.limits = { 'width' : width, 'height' : height };
        };

        p.getAvailableSpace = function ()
        {
            if (this.limits !== null) {
                return this.limits;
            } else if (this.getBounds ()) {
                width = this.getBounds ().width;
                height = this.getBounds ().height;
            } else if (this.parent && this.parent.getBounds ()) {
                width = this.parent.getBounds ().width;
                height = this.parent.getBounds ().height
            } else {
                width = 0;
                height = 0;
            }

            return { 'width' : width, 'height' : height };
        };

        /**
         * Return an array of createjs.Text elements that should be displayed below eachother.
         * @param textstring
         * @param availableWidth
         * @param availableHeight
         */
        p.goBigOrGoHome = function (textstring, availableWidth, availableHeight)
        {
            var self = this;

            var fontsize = 5;
            var stable = new createjs.Text(
                "" + String(textstring),
                fontsize + "px " + this.font,
                this.color
            );

            if (!stable.getBounds()) {
                return stable;
            }

            var maxSteps = 500;

            function bigger ()
            {
                maxSteps --;

                if (maxSteps < 0) {
                    return false;
                }

                var text = new createjs.Text (textstring, fontsize + "px " + self.font, self.color);
                text.lineWidth = availableWidth;
                text.lineHeight = getFontLineheight(text);

                updateCurrentSize(text);

                if (
                    currentSize.height < availableHeight &&
                    currentSize.width <= availableWidth
                ) {
                    stable = text;
                    fontsize ++;
                    return true;
                }
                return false;
            }

            while (bigger ()) {}

            this.fontsize = fontsize;
            return stable;
        };

        p.Container_draw = p.draw;

        /**
         * @returns {string|*}
         */
        p.getLocationHash = function ()
        {
            hash = this.getAvailableSpace();
            hash = hash.width + ':' + hash.height + ':' + this.textstring;

            location = this.localToGlobal(this.x, this.y);
            hash = location.x + ':' + location.y + ':' + hash + ':' + this.align;

            return hash;
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

        /**
         * Draw text (for the first time)
         */
        p.drawText = function()
        {
            this.initialized = true;
            this.removeAllChildren ();

            this.uncache();

            var space = this.getAvailableSpace ();
            if (space.width === 0 || space.height === 0) {
                return;
            }

            // Draw container size
            if (this.debug) {
                var border = new createjs.Shape();
                border.graphics.beginStroke("#FFA500");
                border.graphics.setStrokeStyle(1);
                border.snapToPixel = true;
                border.graphics.drawRect(0, 0, space.width, space.height);
                this.addChild (border);
            }

            var text = this.goBigOrGoHome (this.textstring, space.width, space.height);
            this.textElement = text;

            text.textBaseline = 'top';
            text.textAlign = 'center';

            updateCurrentSize(text);

            currentHeight = currentSize.height;
            currentWidth = currentSize.width;

            if (this.align === 'center') {
                text.x = ((space.width - currentWidth) / 2) + (currentWidth / 2);
            }
            else if (this.align === 'left') {
                text.x = currentWidth / 2;
            }
            else if (this.align === 'right') {
                //text.x = ((space.width - text.getBounds ().width)) + text.getBounds ().width;
                text.x = space.width - currentWidth;
            }

            currentBounds = text.getMetrics();

            var offset = this.getFontOffset(text.font);
            text.y = (text.lineHeight * offset.y) + ((space.height - currentHeight) / 2);

            this.addChild (text);
            //this.cache(-15, -15, space.width + 30, space.height + this.fontsize);
        };

        /**
         * Called when dimensions or content changes.
         */
        p.redrawText = function() {
            this.drawText();
        };

        /**
         * Override the tick method.
         * @param evt
         * @private
         */
        p._tick = function(evt) {
            // container tick
            this.Container_tick(evt);

            if (!this.initialized) {
                this.drawText();
            } else if (this.hasChanged()) {
                this.redrawText();
            }
        };

        createjs.BigText = BigText;
        return BigText;
    }
);
define (
	'CatLab/Easelbone/EaselJS/DisplayObjects/Placeholder',[
		'EaselJS'
	],
	function (createjs)
	{
		var Placeholder = function (element) {

			if (typeof (element) !== 'undefined') {

				this.initialize ();
				this.initializePlaceholder (element);
			}

		};

		var p = Placeholder.prototype = new createjs.Container ();

		p.initializePlaceholder = function (element) {

			var innerPlaceholder = this;
			var boundHash = '0:0';
			var oldBoundHash = '0:0';
			var event;

			element.original_draw = element.draw;

			// Override the draw method of the original placeholder.
			element.draw = function (ctx, ignoreCache) {

				this.updateBounds ();
				return element.original_draw (ctx, ignoreCache);
			};

			this.getBoundsHash = function () {

				if (this.getBounds ()) {
					boundHash = this.getBounds ().width + ':' + this.getBounds ().height;

					return boundHash;
				}
				return null;
			};

			this.hasBoundsChanged = function () {

				if (this.getBoundsHash () !== oldBoundHash) {
					oldBoundHash = boundHash;
					return true;
				}
			};

			element.updateBounds = function () {

				// Set the bounds on this local container
				innerPlaceholder.setBounds (
					0, 0,
					Math.ceil (this.scaleX * 100),
					Math.ceil (this.scaleY * 100)
				);

				innerPlaceholder.x = this.x;
				innerPlaceholder.y = this.y;

				innerPlaceholder.rotation = this.rotation;

				if (innerPlaceholder.hasBoundsChanged ()) {

					if (this.mask) {
						innerPlaceholder.mask = this.mask;
					}

					else if (this.originalMask) {
						innerPlaceholder.mask = this.originalMask;
					}

					this.mask = false;

					event = new createjs.Event ('bounds:change');
					innerPlaceholder.dispatchEvent (event);
				}
			};

			// Remove everything
			//element.removeAllChildren ();
			if (element.children) {
                for (var i = 0; i < element.children.length; i++) {
                    element.children[i].visible = false;
                }
            }

			// Override shape
			if (element.shape) {
				element.shape = new createjs.Shape();
			}

			// Override timeline
			if (element.timeline) {
                element.timeline = new createjs.Timeline(null, [], {paused:true, position:0, useTicks:true});
			}

			//element.visible = false;

			// And add ourselves
			if (element.parent) {
				var index = element.parent.getChildIndex (element);

				element.parent.addChildAt (innerPlaceholder, index + 1);
				innerPlaceholder.dispatchEvent ('initialized');
			}
			else {
				element.addEventListener ('added', function () {

					var index = element.parent.getChildIndex (element);
					element.parent.addChildAt (innerPlaceholder, index + 1);
					innerPlaceholder.dispatchEvent ('initialized');
				});
			}

			/*
			// And add ourselves
			if (element.parent != null) {
				element.parent.addChild (innerPlaceholder);
				innerPlaceholder.dispatchEvent ('initialized');
			}
			else {
				element.addEventListener ('added', function () {
					element.parent.addChild (innerPlaceholder);
					innerPlaceholder.dispatchEvent ('initialized');
				});
			}
			*/
		};


		return Placeholder;
	}
);
define (
	'CatLab/Easelbone/EaselJS/DisplayObjects/TextPlaceholder',[
		'CatLab/Easelbone/EaselJS/DisplayObjects/Placeholder'
	],
	function (Placeholder)
	{
		return Placeholder;
	}
);
define(
    'CatLab/Easelbone/Controls/Button',[
        'CatLab/Easelbone/Controls/Base',
        'CatLab/Easelbone/EaselJS/DisplayObjects/BigText',
        'CatLab/Easelbone/EaselJS/DisplayObjects/TextPlaceholder'
    ],
    function (Base,
              BigText,
              TextPlaceholder) {

        var Button = function (element)
        {
            Base.call(this, element);

            // Check for text placeholder.
            if (!this.element.text) {
                throw "All buttons should have a text placeholder.";
            }

            this.convertText();

            // Listen to click event
            this.element.addEventListener('click', function () {
                this.trigger('click');
            }.bind(this));
        };

        // Extend base.
        Button.prototype = Object.create(Base.prototype);
        Button.prototype.constructor = Button;

        Button.prototype.setText = function (text, font, color)
        {
            var bigtext = new BigText(text, font, color);
            this.text.addChild(bigtext);
        };

        Button.prototype.convertText = function ()
        {

            if (this.element.text instanceof createjs.Text) {

                // Overwrite origal "bigtext" solution.
                var self = this;
                this.setText = function (text) {
                    self.element.text.text = text;
                };
            }
            else {
                this.text = new TextPlaceholder(this.element.text);
            }

        };

        Button.prototype.keyInput = function (input) {
            switch (input) {
                case 'a':
                case 'start':

                    this.trigger('click');

                    break;
            }
        };

        return Button;

    }
);
define(
    'CatLab/Easelbone/Controls/Selectbox',[
        'CatLab/Easelbone/Controls/Base',
        'CatLab/Easelbone/EaselJS/DisplayObjects/BigText',
        'CatLab/Easelbone/EaselJS/DisplayObjects/TextPlaceholder'
    ],
    function (Base,
              BigText,
              TextPlaceholder) {

        var Selectbox = function (element) {

            Base.call(this, element);

            this.repeat = false;
            this.textcontainer = BigText;

            this.selectedIndex = 0;
            this.selectedValue = null;
            this.allValues = [];

            // Check for text placeholder.
            if (!this.element.value) {
                throw "All selectboxes should have a text placeholder.";
            }

            if (!this.element.buttons) {
                throw "All selectboxes must have a buttons object";
            }

            this.element.buttons.on('click', function (evt) {

                // @TODO fix this, I don't know what's going on here...
                var local = this.element.buttons.globalToLocal(evt.stageX, evt.stageY);
                if (local.y > 40) {
                    this.previous();
                }
                else {
                    this.next();
                }

            }.bind(this));

            this.convertText();

        };

        // Extend base.
        Selectbox.prototype = Object.create(Base.prototype);
        Selectbox.prototype.constructor = Selectbox;

        Selectbox.prototype.setText = function (text, font, color) {
            var bigtext = new this.textcontainer(text, font, color);
            this.textElement.removeAllChildren();
            this.textElement.addChild(bigtext);
        };

        Selectbox.prototype.convertText = function () {
            this.textElement = new TextPlaceholder(this.element.value);
        };

        Selectbox.prototype.setValues = function (values) {

            var tmp = [];
            if (!(values instanceof Array)) {
                // Check if array of objects, or array of strings
                for (var ind in values) {
                    if (values.hasOwnProperty(ind)) {
                        var v = values[ind];
                        if (v instanceof Object) {
                            tmp.push(v);
                        }
                        else {
                            // 't is a map.
                            tmp.push({
                                'text': v,
                                'value': ind
                            });
                        }
                    }
                }
            } else {
                for (var i = 0; i < values.length; i++) {
                    tmp.push({
                        'text': values[i],
                        'value': values[i]
                    });
                }
                values = tmp;
            }

            this.allValues = tmp;
            this.select(0);
        };

        Selectbox.prototype.getValue = function () {
            return this.value;
        };

        Selectbox.prototype.select = function (index) {

            if (index < 0 || index > this.values.length - 1)
                return;

            this.selectedIndex = index;
            this.selectedValue = this.values[this.selectedIndex];

            this.setText(this.selectedValue.text);
        };

        Selectbox.prototype.getIndexFromText = function (value) {
            for (var i = 0; i < this.allValues.length; i++) {
                if (this.allValues[i].text == value) {
                    return i;
                }
            }
            return null;
        };

        Selectbox.prototype.getIndexFromValue = function (value) {
            for (var i = 0; i < this.allValues.length; i++) {
                if (this.allValues[i].value == value) {
                    return i;
                }
            }
            return null;
        };

        Selectbox.prototype.next = function () {
            if (this.selectedIndex < this.allValues.length - 1) {
                this.select(this.selectedIndex + 1);
            }
            else if (this.repeat) {
                this.select(0);
            }
        };

        Selectbox.prototype.previous = function () {
            if (this.selectedIndex > 0) {
                this.select(this.selectedIndex - 1);
            }
            else if (this.repeat) {
                this.select(this.allValues.length - 1);
            }
        };

        Selectbox.prototype.keyInput = function (input) {

            switch (input) {
                case 'up':
                    this.next();
                    break;

                case 'down':
                    this.previous();
                    break;
            }

        };

        Object.defineProperty(Selectbox.prototype, "text", {
            get: function () {
                return this.selectedValue.text;
            },
            set: function (value) {
                //alert (value);
                //this.selectedValue = value;
                var index = this.getIndexFromText(value);
                if (index !== null) {
                    this.index = index;
                }
            }
        });

        Object.defineProperty(Selectbox.prototype, "value", {
            get: function () {
                return this.selectedValue.value;
            },

            set: function (value) {
                var index = this.getIndexFromValue(value);
                if (index !== null) {
                    this.index = index;
                }
            }
        });

        Object.defineProperty(Selectbox.prototype, "index", {
            get: function () {
                return this.selectedIndex;
            },

            set: function (value) {
                this.select(value);
            }
        });

        Object.defineProperty(Selectbox.prototype, "values", {
            get: function () {
                return this.allValues;
            },

            set: function (values) {
                this.setValues(values);
            }
        });

        return Selectbox;

    }
);
define (
	'CatLab/Easelbone/Controls/ScrollBar',[
		'underscore',

		'CatLab/Easelbone/Utilities/Path'
	],
	function (_, Path) {

		var ScrollBar = function (element) {

			var self = this;

			this.element = element;

			this.element.up.on ('click', this.up, this);
			this.element.down.on ('click', this.down, this);

			this.path = new Path (this.element.minimum, this.element.maximum);

			this.containers = [];

			// Set scroller
			this.element.on ('pressmove', function (evt) {
				position = self.element.globalToLocal (evt.stageX, evt.stageY);
				self.scrollTo (self.path.getValue (position.x, position.y));
			});

		};

		var p = ScrollBar.prototype;

		var heightPercentage;
		var position;

		p.link = function (container) {
			this.containers.push (container);

			container.on ('scroll', this.onScroll, this);
		};

		p.up = function () {
			_.each (this.containers, function (v) {
				v.up ();
			});
		};

		p.down = function () {
			_.each (this.containers, function (v) {
				v.down ();
			});
		};

		p.getIndicatorSize = function () {

			if (this.element.indicator.bottom && this.element.indicator.top) {
				position = {
					'x' : (this.element.indicator.bottom.x - this.element.indicator.top.x) * this.element.indicator.scaleX,
					'y' : (this.element.indicator.bottom.y - this.element.indicator.top.y) * this.element.indicator.scaleY
				};
			}
			else {
				position = { 'x' : 0, 'y' : 0 };
			}

			return position;
		};

		p.scrollTo = function (percentage) {
			_.each (this.containers, function (v) {
				v.scrollTo (percentage);
			});
		};

		p.onScroll = function (percentage) {

			heightPercentage = Math.min (1, percentage.containerHeight / percentage.contentHeight);

			position = this.getIndicatorSize ();
			this.path.setIndicatorSize (position.x, position.y);
			this.path.position (this.element.indicator, percentage.percentage);

		};

		return ScrollBar;

	}
);
define(
    'CatLab/Easelbone/EaselJS/DisplayObjects/ScrollArea',[
        'EaselJS',
        'CatLab/Easelbone/EaselJS/DisplayObjects/Placeholder',
        'jquery'
    ],
    function (createjs, Placeholder) {
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

            var deffered = new jQuery.Deferred();

            if (!this.parent.getBounds()) {
                deffered.resolve();
                return deffered;
            }

            if (typeof (delay) === 'undefined')
                delay = 0;

            var y = element.y;
            //this.setScroll (y);

            // Center around this y position.
            var height = 0;
            if (element.getBounds()) {
                height = element.getBounds().height;
            }

            // y should be in the middle of the screen, so...
            if (height < this.parent.getBounds().height)
                y -= (this.parent.getBounds().height / 2) - (height / 2);

            if (this.getDistance() === 0.0001) {
                // Do nothing.
                deffered.resolve();
            }

            else if (delay > 0) {
                createjs.Tween.get(this).to({'scroll': y}, delay, ease).call(deffered.resolve);
            }
            else {
                this.scroll = y;
                deffered.resolve();
            }

            return deffered;
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
define (
	'CatLab/Easelbone/Utilities/Mousewheel',[],
	function () {

		var MouseWheel = function () {

			var self = this;

			document.body.addEventListener ('mousewheel', function (evt) {
				self.scroll (evt);
			})

		};

		var p = MouseWheel.prototype;

		p.scroll = function (evt) {

			if (this.callback) {
				this.callback ({ 'x' : 0, 'y' : evt.wheelDelta });
			}

		};

		p.listen = function (callback) {

			this.stop ();
			this.callback = callback;

		};

		p.stop = function () {
			this.callback = null;
		};

		return new MouseWheel ();
	}
);
define (
	'CatLab/Easelbone/Controls/ScrollArea',[
	    'backbone',

		'CatLab/Easelbone/Controls/ScrollBar',
		'CatLab/Easelbone/EaselJS/DisplayObjects/ScrollArea',

		'CatLab/Easelbone/Utilities/Mousewheel'
	],
	function (Backbone, ScrollBar, ScrollAreaDisplayObject, Mousewheel) {

		var ScrollArea = function (element) {

            _.extend(this, Backbone.Events);

			this.element = element;

			this.scrollbar = new ScrollBar (element.scrollbar);
			this.scrollbar.link (this);

			this.content = new ScrollAreaDisplayObject (element.content);
			this.content.on ('scroll', this.onScroll, this);

			// If mouseover events are available, listen to those
			this.element.on ('mouseover', this.enableScrollMouse, this);
			this.element.on ('mouseout', this.disableScrollMouse, this);
			this.element.on ('removed', this.disableScrollMouse, this);

			//this.scrollTo (0);
			this.element.on ('added', this.onAdd, this);
		};

		var p = ScrollArea.prototype;

		p.enableScrollMouse = function () {
			var self = this;
			Mousewheel.listen (function (iv) {
				self.scroll (iv.y > 0 ? 50 : - 50);
			});
		};

		p.onAdd = function () {
			this.scrollTo (0);
		};

		p.disableScrollMouse = function () {
			Mousewheel.stop ();
		};

		p.onScroll = function (evt) {

			var perc = {
				'percentage' : this.content.getPercentage (),
				'contentHeight' : this.content.getBounds ().height,
				'containerHeight' : this.content.parent.getBounds ().height
			};

			this.trigger ('scroll', perc);
		};

		p.scrollTo = function (percentage) {
			this.content.scrollTo (percentage);
		};

		p.scroll = function (pixels) {
			this.content.up (pixels);
		};

		p.up = function () {
			this.content.up (25);
		};

		p.down = function () {
			this.content.down (25);
		};

		p.focus = function (element, delay, ease) {
			return this.content.focus (element, delay, ease);
		};

		return ScrollArea;

	}
);
define (
	'CatLab/Easelbone/Controls/ListElement',[],
	function () {

		var ListElement = function (element) {

			this.element = element;

		};

		var p = ListElement.prototype;

		p.focus = function () {
			this.dispatchEvent ('focus');
		};

        /**
         * @returns {{width, height}}
         */
		p.getDimensions = function() {
			return {
                'width' : this.element.boundary.x,
                'height': this.element.boundary.y
            };
		};

		return ListElement;

	}
);
define (
	'CatLab/Easelbone/Controls/List',[
		'EaselJS',

		'CatLab/Easelbone/Controls/ListElement'
	],
	function (createjs, ListElement)
	{
		var List = function (childElement) {

			this.initialize ();

			this.listItems = [];

			if (typeof (childElement) !== 'undefined') {
				this.setChildElement (childElement);
			}
		};

		var p = List.prototype = new createjs.Container ();

		p.setChildElement = function (element) {
			this.childElement = element;

			var tmpElement = new element ();
			this.boundary = {
				'x' : tmpElement.boundary.x,
				'y' : tmpElement.boundary.y
			};
		};

		p.getChildElement = function () {
			if (typeof (this.childElement) === 'undefined') {
				throw "No child element set.";
			}
			return this.childElement;
		};

		p.updateBounds = function () {
			this.setBounds (
				0, 0,
				this.boundary.x, (this.boundary.y * (this.listItems.length))
			);
		};

		p.createElement = function () {

			var child = new ListElement (new (this.getChildElement ()) ());
			this.listItems.push (child);

			this.addChild (child.element);
			child.element.y = (this.boundary.y * (this.listItems.length - 1));

			this.updateBounds ();

			return child;
		};

		return List;
	}
);
define(
    'CatLab/Easelbone/Controls/FloatContainer',[
        'EaselJS',

        'CatLab/Easelbone/Controls/ListElement'
    ],
    function (createjs, ListElement) {
        var List = function (childElement, columns) {

            this.initialize();

            this.listItems = [];

            if (typeof (childElement) !== 'undefined') {
                this.setChildElement(childElement);
            }

            this.rows = 0;
            this.columns = columns;
            this.currentColumn = 0;

            this.curX = 0;
            this.curY = 0;
            this.rowHeight = 0;
        };

        var p = List.prototype = new createjs.Container();

        p.setChildElement = function (element) {
            this.childElement = element;

            var tmpElement = this.getChildElement();
            this.boundary = {
                'x': tmpElement.boundary.x,
                'y': tmpElement.boundary.y
            };

            this.rowHeight = this.boundary.y;
        };

        p.getChildElement = function (options) {
            if (typeof (this.childElement) === 'undefined') {
                throw "No child element set.";
            }

            if (this.childElement.prototype instanceof createjs.DisplayObject) {
                return new this.childElement();
            }

            return this.childElement(options);
        };

        p.updateBounds = function () {
            this.setBounds(
                0, 0,
                this.boundary.x * this.columns, this.curY + this.rowHeight
            );
        };

        p.nextRow = function () {
            this.currentColumn = 1;
            this.rows++;

            this.curY += this.rowHeight;
            this.rowHeight = 0;
        };

        p.getNextPosition = function () {

            var out = {};

            this.currentColumn++;
            if (this.currentColumn > this.columns) {
                this.nextRow();
            }

            out.x = this.boundary.x * (this.currentColumn - 1);
            out.y = this.curY;

            return out;
        };

        p.createElement = function (options) {

            var child = new ListElement(this.getChildElement(options));
            this.listItems.push(child);

            this.addChild(child.element);

            // Check if there is space getPleft on the current row.
            var pos = this.getNextPosition();
            this.rowHeight = Math.max(this.rowHeight, child.getDimensions().height);

            child.element.x = pos.x;
            child.element.y = pos.y;

            this.updateBounds();

            return child;
        };

        p.removeAllChildren_container = p.removeAllChildren;

        p.removeAllChildren = function () {

            this.currentColumn = 0;
            this.rows = 0;

            this.removeAllChildren_container.apply(this, arguments);

        };

        return List;
    }
);
define (
    'CatLab/Easelbone/EaselJS/DisplayObjects/Background',[
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
/*
 * ButtonHelper
 * Visit http://createjs.com/ for documentation, updates and examples.
 *
 * Copyright (c) 2010 gskinner.com, inc.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * @module EaselJS
 */

// namespace:
//this.createjs = this.createjs||{};

define ('CatLab/Easelbone/EaselJS/DisabledButtonHelper',['EaselJS'], function (createjs)
{

	/**
	 * The ButtonHelper is a helper class to create interactive buttons from {{#crossLink "MovieClip"}}{{/crossLink}} or
	 * {{#crossLink "Sprite"}}{{/crossLink}} instances. This class will intercept mouse events from an object, and
	 * automatically call {{#crossLink "Sprite/gotoAndStop"}}{{/crossLink}} or {{#crossLink "Sprite/gotoAndPlay"}}{{/crossLink}},
	 * to the respective animation labels, add a pointer cursor, and allows the user to define a hit state frame.
	 *
	 * The ButtonHelper instance does not need to be added to the stage, but a reference should be maintained to prevent
	 * garbage collection.
	 *
	 * Note that over states will not work unless you call {{#crossLink "Stage/enableMouseOver"}}{{/crossLink}}.
	 *
	 * <h4>Example</h4>
	 *
	 *      var helper = new createjs.ButtonHelper(myInstance, "out", "over", "down", false, myInstance, "hit");
	 *      myInstance.addEventListener("click", handleClick);
	 *      function handleClick(event) {
 *          // Click Happened.
 *      }
	 *
	 * @class ButtonHelper
	 * @param {Sprite|MovieClip} target The instance to manage.
	 * @param {String} [outLabel="out"] The label or animation to go to when the user rolls out of the button.
	 * @param {String} [overLabel="over"] The label or animation to go to when the user rolls over the button.
	 * @param {String} [downLabel="down"] The label or animation to go to when the user presses the button.
	 * @param {Boolean} [play=false] If the helper should call "gotoAndPlay" or "gotoAndStop" on the button when changing
	 * states.
	 * @param {DisplayObject} [hitArea] An optional item to use as the hit state for the button. If this is not defined,
	 * then the button's visible states will be used instead. Note that the same instance as the "target" argument can be
	 * used for the hitState.
	 * @param {String} [hitLabel] The label or animation on the hitArea instance that defines the hitArea bounds. If this is
	 * null, then the default state of the hitArea will be used. *
	 * @constructor
	 */
	var DisabledButtonHelper = function(target, outLabel, overLabel, downLabel, play, hitArea, hitLabel) {
		this.initialize(target, outLabel, overLabel, downLabel, play, hitArea, hitLabel);
	};
	var p = DisabledButtonHelper.prototype;

// public properties:
	/**
	 * The target for this button helper.
	 * @property target
	 * @type MovieClip | Sprite
	 * @readonly
	 **/
	p.target = null;

	/**
	 * The label name or frame number to display when the user mouses out of the target. Defaults to "over".
	 * @property overLabel
	 * @type String | Number
	 **/
	p.overLabel = null;

	/**
	 * The label name or frame number to display when the user mouses over the target. Defaults to "out".
	 * @property outLabel
	 * @type String | Number
	 **/
	p.outLabel = null;

	/**
	 * The label name or frame number to display when the user presses on the target. Defaults to "down".
	 * @property downLabel
	 * @type String | Number
	 **/
	p.downLabel = null;

	/**
	 * If true, then ButtonHelper will call gotoAndPlay, if false, it will use gotoAndStop. Default is false.
	 * @property play
	 * @default false
	 * @type Boolean
	 **/
	p.play = false;

// getter / setters:

	/**
	 * Enables or disables the button functionality on the target.
	 * @property enabled
	 * @type {Boolean}
	 **/
	/**
	 * Enables or disables the button functionality on the target.
	 * @deprecated in favour of the enabled property.
	 * @method setEnabled
	 * @param {Boolean} value
	 **/
	p.setEnabled = function(value) { // TODO: deprecated.

		/*
		 var o = this.target;
		 this._enabled = value;
		 if (value) {
		 o.cursor = "pointer";
		 o.addEventListener("rollover", this);
		 o.addEventListener("rollout", this);
		 o.addEventListener("mousedown", this);
		 o.addEventListener("pressup", this);
		 } else {
		 o.cursor = null;
		 o.removeEventListener("rollover", this);
		 o.removeEventListener("rollout", this);
		 o.removeEventListener("mousedown", this);
		 o.removeEventListener("pressup", this);
		 }
		 */
	};
	/**
	 * Returns enabled state of this instance.
	 * @deprecated in favour of the enabled property.
	 * @method getEnabled
	 * @return {Boolean} The last value passed to setEnabled().
	 **/
	p.getEnabled = function() {
		return this._enabled;
	};

	try {
		Object.defineProperties(p, {
			enabled: { get: p.getEnabled, set: p.setEnabled }
		});
	} catch (e) {} // TODO: use Log

//  private properties
	/**
	 * @property _isPressed
	 * @type Boolean
	 * @protected
	 **/
	p._isPressed = false;

	/**
	 * @property _isOver
	 * @type Boolean
	 * @protected
	 **/
	p._isOver = false;

	/**
	 * @property _enabled
	 * @type Boolean
	 * @protected
	 **/
	p._enabled = false;

// constructor:
	/**
	 * Initialization method.
	 * @method initialize
	 * @param {Sprite|MovieClip} target The instance to manage.
	 * @param {String} [outLabel="out"] The label or animation to go to when the user rolls out of the button.
	 * @param {String} [overLabel="over"] The label or animation to go to when the user rolls over the button.
	 * @param {String} [downLabel="down"] The label or animation to go to when the user presses the button.
	 * @param {Boolean} [play=false] If the helper should call "gotoAndPlay" or "gotoAndStop" on the button when changing
	 * states.
	 * @param {DisplayObject} [hitArea] An optional item to use as the hit state for the button. If this is not defined,
	 * then the button's visible states will be used instead. Note that the same instance as the "target" argument can be
	 * used for the hitState.
	 * @param {String} [hitLabel] The label or animation on the hitArea instance that defines the hitArea bounds. If this is
	 * null, then the default state of the hitArea will be used.
	 * @protected
	 **/
	p.initialize = function(target, outLabel, overLabel, downLabel, play, hitArea, hitLabel) {
		if (!target.addEventListener) { return; }
		this.target = target;
		target.mouseChildren = false; // prevents issues when children are removed from the display list when state changes.
		this.overLabel = overLabel == null ? "over" : overLabel;
		this.outLabel = outLabel == null ? "out" : outLabel;
		this.downLabel = downLabel == null ? "down" : downLabel;
		this.play = play;
		this.setEnabled(true);
		this.handleEvent({});
		if (hitArea) {
			if (hitLabel) {
				hitArea.actionsEnabled = false;
				hitArea.gotoAndStop&&hitArea.gotoAndStop(hitLabel);
			}
			target.hitArea = hitArea;
		}
	};

// public methods:

	/**
	 * Returns a string representation of this object.
	 * @method toString
	 * @return {String} a string representation of the instance.
	 **/
	p.toString = function() {
		return "[DisabledButtonHelper]";
	};


// protected methods:
	/**
	 * @method handleEvent
	 * @param {Object} evt The mouse event to handle.
	 * @protected
	 **/
	p.handleEvent = function(evt) {
		var label, t = this.target, type = evt.type;
		if (type == "mousedown") {
			this._isPressed = true;
			label = this.downLabel;
		} else if (type == "pressup") {
			this._isPressed = false;
			label = this._isOver ? this.overLabel : this.outLabel;
		} else if (type == "rollover") {
			this._isOver = true;
			label = this._isPressed ? this.downLabel : this.overLabel;
		} else { // rollout and default
			this._isOver = false;
			label = this._isPressed ? this.overLabel : this.outLabel;
		}
		if (this.play) {
			t.gotoAndPlay&&t.gotoAndPlay(label);
		} else {
			t.gotoAndStop&&t.gotoAndStop(label);
		}
	};

	return DisabledButtonHelper;
});
define (
	'CatLab/FakeWebremote/Models/User',[],
	function ()
	{
		return function (aAccessToken)
		{
			var accessToken = aAccessToken;
			var name;
			var avatar;
			var id;

			this.getAccessToken = function ()
			{
				return accessToken;
			};

			this.setId = function (aId)
			{
				id = aId;
			};

			this.getId = function ()
			{
				return id;
			};

			this.setName = function (aName)
			{
				name = aName;
			};

			this.getName = function ()
			{
				return name;
			};

			this.setAvatar = function (aAvatar)
			{
				avatar = aAvatar;
			};

			this.getAvatar = function ()
			{
				return avatar;
			};
		};
	}
);
define (
	'CatLab/FakeWebremote/Models/Control',[],
	function () {
		return function (id, user)
		{
			var value = 0;
			var listeners = {};
			var i;
			var m_label = id;
			var m_label_type;
			var domwatchers = [];

			this.id = id;

			this.pushed = function ()
			{
				return value === 0;
			};

			this.scale = function ()
			{
				return value;
			};

			this.update = function (newvalue)
			{
				if (value > 0 && newvalue == 0)
				{
					this.trigger ('click');
				}
				value = newvalue;
			};

			this.getLabel = function ()
			{
				return '<span class="control-label ' + m_label_type + '">' + m_label + '</span>';
			};

			this.setStaticLabel = function (label, type)
			{
				m_label = label;
				m_label_type = type;
				return this;
			}

			this.setLabel = function (label, force)
			{
				// Networky stuff to set the label
				user.emit ('button:label', { 'id' : id, 'label' : label });
				return this;
			};

			/**
			 * Event will be called any time specific button is clicked (= released)
			 */
			this.click = function (callback)
			{
				this.on ('click', callback);
				return this;
			};

			this.on = function (event, callback)
			{
				//this.log ('Setting trigger ' + event);
				if (typeof (listeners[event]) == 'undefined')
				{
					listeners[event] = [];
				}
				listeners[event].push (callback);
				return this;
			};

			this.trigger = function (event)
			{
				//this.log ("Triggering " + event);

				var todo = [];

				if (typeof (listeners[event]) != 'undefined')
				{
					//this.log ("Found " + listeners[event].length + " events");

					for (i = 0; i < listeners[event].length; i ++)
					{
						todo.push (listeners[event][i]);
					}
				}

				for (i = 0; i < todo.length; i ++)
				{
					try {
						todo[i] ();
					}
					catch (e)
					{
						console.log (e);
					}
				}
				return this;
			};

			this.off = function (event)
			{
				listeners[event] = [];
				return this;
			};

			this.clearEvents = function ()
			{
				//this.log ('Clearing events');

				listeners = {};
				return this;
			};

			this.addDomElement = function (element)
			{
				var self = this;
				var listeners = [];

				listeners.push (element.addEventListener ('click', function ()
				{
					self.trigger ('click');
				}));

				domwatchers.push ({ 'element' : element, 'listeners' : listeners });

				return this;
			};

			this.clearDomElements = function ()
			{
				for (var i = 0; i < domwatchers.length; i ++)
				{
					for (var j = 0; j < domwatchers[i].listeners.length; j ++)
					{
						domwatchers[i].element.removeEventListener ('click', domwatchers[i].listeners[j]);
					}
				}

				domwatchers = [];

				return this;
			};

			this.isLocalAuthentication = function ()
			{
				return false;
			};

			this.log = function (msg)
			{
				user.log ('[' + this.id + '] ' + msg);
			};
		};
	}
);
define (
	'CatLab/FakeWebremote/Models/ControlUser',[
		'CatLab/FakeWebremote/Models/User',
		'CatLab/FakeWebremote/Models/Control'
	],
	function (User, WebcontrolControl) {

		var WebcontrolUser = function (data) {
			this.initialize (data);
		};

		WebcontrolUser.prototype = User;

		WebcontrolUser.prototype.setWebcontrol = function (Webcontrol) {
			this.Webcontrol = Webcontrol;
		};

		WebcontrolUser.prototype.initialize = function (data)
		{
			this.controls = {};
			this.currentView = null;
			this.color = 'orange';
			this.colorName = 'orange';
			this.tmpid = null;
			this.active = false;

			this.userdata = data;
			this.profiledata = {};

			this.access_token = null;
		};

		WebcontrolUser.prototype.clearControls = function ()
		{
			if (this.currentView != null)
			{
				var labels = this.Webcontrol.getViewLabels (this.currentView);
				for (var i = 0; i < labels.length; i ++)
				{
					this.control(labels[i].id).setStaticLabel (labels[i].label, 'mobile');
				}
			}
		};

		WebcontrolUser.prototype.clearEvents = function ()
		{
			//this.log ('Clearing events');
			for (this.tmpid in this.controls)
			{
				if (this.controls.hasOwnProperty (this.tmpid))
				{
					this.controls[this.tmpid].clearEvents ();
				}
			}
		};

		WebcontrolUser.prototype.trigger = function (method, data)
		{
			if (method == 'button:down')
			{
				this.control (data.id).update (1);
			}

			else if (method == 'button:up')
			{
				this.control (data.id).update (0);
			}

			else if (method == 'user:login')
			{
				this.login (data);
			}

			else if (method == 'user:logout')
			{
				this.logout (data);
			}
		};

		WebcontrolUser.prototype.emit = function (method, data)
		{
			this.Webcontrol._playerEmit (this, method, data);
			return true;
		};

		WebcontrolUser.prototype.control = function (id)
		{
			var self = this;
			if (typeof (this.controls[id]) == 'undefined')
			{
				this.controls[id] = new WebcontrolControl (id, self);
			}
			return this.controls[id];
		};

		WebcontrolUser.prototype.getId = function ()
		{
			return this.userdata.id;
		};

		WebcontrolUser.prototype.getName = function ()
		{
			return 'User ' + this.getId ();
		};

		WebcontrolUser.prototype.getType = function ()
		{
			return 'mobile';
		};

		WebcontrolUser.prototype.getIcon = function ()
		{
			return 'fa fa-mobile-phone';
		};

		WebcontrolUser.prototype.login = function (data)
		{
			var self = this;

			this.access_token = data.access_token;

			this.Webcontrol.getOAuthClient (function (client)
			{
				client.profile  (self.access_token, function (data)
				{
					self.profiledata = data.user;
				});
			});
		};

		WebcontrolUser.prototype.getData = function ()
		{
			return this.profiledata;
		};

		WebcontrolUser.prototype.logout = function (data)
		{
			this.profiledata = null;
			this.access_token = null;
		};

		WebcontrolUser.prototype.setColor = function (aColor, colorName)
		{
			this.color = aColor;
			this.colorName = colorName;
			this.emit ('color:set', { 'color' : aColor, 'name' : colorName });
		};

		WebcontrolUser.prototype.getColor = function ()
		{
			return this.color;
		};

		WebcontrolUser.prototype.getColorName = function ()
		{
			return this.colorName;
		};

		WebcontrolUser.prototype.isActive = function ()
		{
			return this.active;
		};

		WebcontrolUser.prototype.toggleActive = function ()
		{
			this.active = !this.active;
			this.setLabel();
		};

		WebcontrolUser.prototype.setActive = function (bool)
		{
			this.active = bool;
			this.setLabel();
		};

		WebcontrolUser.prototype.setLabel = function ()
		{
			if (this.active==true){
				this.control ('join-game').setLabel ('LEAVE');
			}else{
				this.control ('join-game').setLabel ('JOIN');
			}
		};

		WebcontrolUser.prototype.setView = function (id)
		{
			this.currentView = id;

			// Clear controls
			this.clearControls ();

			// Set view
			this.emit ('view:set', { 'id' : id });
		};

		WebcontrolUser.prototype.setUserData = function (access_key, userdata)
		{
			console.log ('Setting user data: ', access_key, userdata);
		};

		WebcontrolUser.prototype.isLocalAuthentication = function ()
		{
			return true;
		};

		WebcontrolUser.prototype.log = function (string)
		{
			console.log ("[u:" + this.getId () + "] " + string);
		};

		return WebcontrolUser;
	}
);
define (
	'CatLab/FakeWebremote/Models/KeyboardUser',[
		'CatLab/FakeWebremote/Models/ControlUser'
	],
	function (User)
	{

		var KeyboardUser = function (keys) {
			if (typeof (keys) == 'undefined') {
				keys = [
					{
						'id': 'up',
						'label': '↑',
						'key': 38
					},

					{
						'id': 'down',
						'label': '↓',
						'key': 40
					},

					{
						'id': 'right',
						'label': '→',
						'key': 39
					},

					{
						'id': 'left',
						'label': '←',
						'key': 37
					},

					{
						'id': 'a',
						'label': 'A',
						'key': 65
					},

					{
						'id': 'b',
						'label': 'B',
						'key': 66
					},

					{
						'id': 'x',
						'label': 'X',
						'key': 88
					},

					{
						'id': 'y',
						'label': 'Y',
						'key': 89
					},

					{
						'id': 'join-game',
						'label': 'SPACE',
						'key': 32
					},

					{
						'id': 'start-game',
						'label': 'ENTER',
						'key': 13
					}
				];
			}

			this.keys = keys;

			this.initialize ({ 'id' : 'keyboard' });

			var controls = {};
			var self = this;

			var control;
			var i = 0;

			// Attach the events
			document.addEventListener('keydown', function (e) {
				control = getControlFromKey(e.keyCode);
				if (control) {
					control.update(1);
				}
			});

			document.addEventListener('keyup', function (e) {
				control = getControlFromKey(e.keyCode);
				if (control) {
					control.update(0);
				}
			});

			function getControlFromKey(keycode) {
				for (i = 0; i < keys.length; i++) {
					if (keys[i].key == keycode) {
						control = self.control (keys[i].id);
						return control;
					}
				}
				return null;
			}

			this.clearControls = function () {
				for (var i = 0; i < keys.length; i++) {
					this.control (keys[i].id).setStaticLabel(keys[i].label, 'keyboard');
				}
			};

			this.getType = function () {
				return 'keyboard';
			};

			this.getIcon = function () {
				return 'fa fa-keyboard-o';
			};

			this.setView = function (id) {
				// Clear controls
				this.clearControls();
			};

			this.emit = function (method, data) {
				// Keyboard. Do nothing.
				return false;
			};

			this.isLocalAuthentication = function ()
			{
				return false;
			};

			// Set labels
			this.clearControls();
		};

		KeyboardUser.prototype = new User ();
		KeyboardUser.prototype.constructor = KeyboardUser;

		return KeyboardUser;

	}
);
define(
    'CatLab/Easelbone/FrontController',[
        'CatLab/Easelbone/Utilities/Loader',

        'CatLab/Easelbone/Views/Root',
        'CatLab/Easelbone/Views/Base',
        'CatLab/Easelbone/Views/Layer',
        'CatLab/Easelbone/Views/Navigatable',

        'CatLab/Easelbone/Controls/Slider',
        'CatLab/Easelbone/Controls/Checkbox',
        'CatLab/Easelbone/Controls/Button',
        'CatLab/Easelbone/Controls/Selectbox',

        'CatLab/Easelbone/Controls/ScrollBar',
        'CatLab/Easelbone/Controls/ScrollArea',
        'CatLab/Easelbone/Controls/List',
        'CatLab/Easelbone/Controls/FloatContainer',

        'CatLab/Easelbone/EaselJS/DisplayObjects/BigText',
        'CatLab/Easelbone/EaselJS/DisplayObjects/Placeholder',
        'CatLab/Easelbone/EaselJS/DisplayObjects/Background',

        'CatLab/Easelbone/EaselJS/DisabledButtonHelper',

        'CatLab/Easelbone/Utilities/GlobalProperties',

        'CatLab/FakeWebremote/Models/KeyboardUser'
    ],
    function (
        Loader,
        RootView,
        BaseView,
        LayerView,
        NavigatableView,
        SliderControl,
        CheckboxControl,
        ButtonControl,
        SelectboxControl,
        ScrollBar,
        ScrollArea,
        ListControl,
        FloatContainer,
        BigText,
        Placeholder,
        Background,
        DisabledButtonHelper,
        GlobalProperties,
        KeyboardUser
    ) {

        return {

            'initialize': function () {


            },

            'setProperties': function (properties) {
                GlobalProperties.set(properties);
            },

            'Views': {
                'Root': RootView,
                'Base': BaseView,
                'Layer': LayerView,
                'Navigatable': NavigatableView
            },

            'Controls': {
                'Slider': SliderControl,
                'Checkbox': CheckboxControl,
                'Button': ButtonControl,
                'Selectbox': SelectboxControl,
                'ScrollBar': ScrollBar,
                'ScrollArea': ScrollArea,
                'List': ListControl,
                'FloatContainer': FloatContainer
            },

            'EaselJS': {
                'BigText': BigText,
                'Placeholder': Placeholder,
                'Fill': Background,

                'DisabledButtonHelper': DisabledButtonHelper
            },

            'FakeWebremote': {
                'KeyboardUser': KeyboardUser
            },

            'Loader': new Loader()

        };

    }
);
define (
	'easelbone',
	[
		'CatLab/Easelbone/FrontController'
	],
	function (easelbone) {
		return easelbone;
	}
);
