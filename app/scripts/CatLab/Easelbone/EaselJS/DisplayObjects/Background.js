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

		var Background = function (background)
		{
			if (
				background instanceof Image ||
				background instanceof HTMLImageElement
			) {
				this.bitmap = new createjs.Bitmap (background);
			}
			else if (background instanceof createjs.Bitmap) {
				this.bitmap = background;
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

		p.initialize = function() {
			this.Container_initialize ();
		};

		p.isVisible = function () {
			return true;
		};

		p.setLimits = function (width, height) {
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

		p.getLocationHash = function () {
			hash = this.getAvailableSpace ();
			return hash.width + ':' + hash.height;
		};

		/**
		 * Determine if the dimensions have changed since last frame.
		 * @returns {boolean}
		 */
		p.hasChanged = function () {
			hash = this.getLocationHash ();
			hasChanged = this.lastHash != hash;
			this.lastHash = hash;

			return hasChanged;
		};

		p.draw = function (ctx, ignoreCache)
		{
			if (this.initialized && !this.hasChanged ())
			{
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
			else if (this.bitmap) {

				console.log (this.bitmap.getBounds ());
				this.bitmap.scaleX = (space.width / this.bitmap.getBounds ().width);
				this.bitmap.scaleY = (space.height / this.bitmap.getBounds ().height);

				this.addChild (this.bitmap);

			}
	
			return this.Container_draw (ctx, ignoreCache);
		};

		createjs.Background = Background;
		return Background;
	}
);