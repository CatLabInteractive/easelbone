define (
	[
		'backbone',
		'EaselJS',

		'CatLab/Easelbone/Views/Layer'
	],
	function (Backbone, createjs, Layer)
	{
		var i;
		var layer;

		var dirty = false;

		return Backbone.View.extend({

			'stage' : null,
			'container' : null,
			'hudcontainer' : null,

			'view' : null,
			'hud' : null,

			'initialize' : function (options)
			{
				var self = this;

				if (typeof (options.canvas) !== 'undefined')
				{
					this.canvas = options.canvas;
					this.container = this.canvas.parentNode;
				}
				else {
					if (typeof (options.container) == 'undefined')
					{
						throw new Error ("Container must be defined for root view.");
					}

					this.canvas = document.createElement('canvas');
					this.container = options.container;
					this.container.appendChild (this.canvas);

				}

				this.stage = new createjs.Stage (this.canvas);

				// Create the main layer.
				this.layers = [];
				this.layerMap = {};

				this.mainLayer = this.nextLayer ('main');

				// Ticker
				//createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
				createjs.Ticker.addEventListener ('tick', function (e) { self.tick (e) });
				createjs.Ticker.addEventListener ('tick', this.stage);

				//this.stage.enableMouseOver(assets.properties.fps);
				this.resize ();
			},

			/**
			 * Create a new layer that will be put on top of the previous one.
			 * @param name
			 * @returns {Layer}
			 */
			'nextLayer' : function (name) {

				if (typeof (name) === 'undefined') {
					name = 'Layer' + this.layers.length;
				}

				var layer = new Layer ();
				this.stage.addChild (layer.container);

				this.layers.push (layer);
				this.layerMap[name] = layer;

				return layer;
			},

			/**
			 * Return a previously created layer.
			 * @param name
			 * @returns {*}
			 */
			'getLayer' : function (name) {
				return this.layerMap[name];
			},

			/**
			 * Set a view on the main layer.
			 * @param view
			 */
			'setView' : function (view)
			{
				this.mainLayer.setView (view);

				// And render!
				this.render ();
			},

			'tick' : function (event)
			{
				// Listen to the voice
				//Speech.onRenderFrame ();
				this.trigger ('tick:before', event);

				dirty = false;

				for (i = 0; i < this.layers.length; i ++ ) {

					layer = this.layers[i];

					if (layer.tick (event)) {
						dirty = true;
					}
				}

				if (dirty)
					this.update ();

				// Update the stage.
				//this.stage.handleEvent ("tick", event);

				this.trigger ('tick:after');
			},

			'render' : function ()
			{
				for (i = 0; i < this.layers.length; i ++ ) {
					this.layers[i].render ();
				}

				// And update the stage.
				this.update ();

				return this;
			},

			'update' : function ()
			{
				this.stage.update ();
			},

			'fullscreen' : function () {

				this.resizeFullscreen ();

			},

			'resize' : function () {
				if (typeof (this.container) !== 'undefined') {

					this.canvas.width = this.container.offsetWidth;
					this.canvas.height = this.container.offsetHeight;
				}
				else {
					this.canvas.width = window.innerWidth;
					this.canvas.height = window.innerHeight;
				}

				this.render ();
			}
		});
	}
);