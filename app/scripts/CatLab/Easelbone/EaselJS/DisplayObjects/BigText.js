define (
	[
		'EaselJS',
		'CatLab/Easelbone/Utilities/GlobalProperties'
	],
	function (createjs, GlobalProperties)
	{
		var width;
		var height;
		var debug = false;
		var hash;
		var hasChanged = false;

		var BigText = function (aTextstring, aFont, aColor, align)
		{
			this.textstring = aTextstring;
			this.font = GlobalProperties.ifUndefined (aFont, GlobalProperties.getDefaultFont ());
			this.color = GlobalProperties.ifUndefined (aColor, GlobalProperties.getDefaultTextColor ());
			this.align = typeof (align) == 'undefined' ? 'center' : align;

			this.initialize ();
			this.initialized = false;
			this.limits = null;

			this.debug = debug;
		};

		var p = BigText.prototype = new createjs.Container ();

		p.Container_initialize = p.initialize;

		p.initialize = function() {
			this.Container_initialize ();
		};

		p.isVisible = function ()
		{
			return true;
		};

		p.setText = function (text)
		{
			this.initialized = false;
			this.textstring = text;
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
			else if (this.getBounds ())
			{
				width = this.getBounds ().width;
				height = this.getBounds ().height;
			}
			else if (this.parent)
			{
				width = this.parent.getBounds ().width;
				height = this.parent.getBounds ().height
			}
			else
			{
				width = 100;
				height = 100;
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

			var fontsize = 10;
			var stable = new createjs.Text ("" + String(textstring), fontsize + "px " + this.font, this.color);

			var maxSteps = 500;

			function bigger ()
			{
				maxSteps --;

				if (maxSteps < 0)
				{
					return false;
				}

				//console.log (fontsize + "px " + self.font);

				var text = new createjs.Text (textstring, fontsize + "px " + self.font, self.color);
				text.lineWidth = availableWidth;

				if (text.getBounds ().height < availableHeight && text.getBounds ().width <= availableWidth)
				{
					stable = text;
					fontsize ++;
					return true;
				}
				return false;
			}

			while (bigger ()) {}

			return stable;
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
			//console.log (space);

			// Draw container size
			if (this.debug)
			{
				var border = new createjs.Shape();
				border.graphics.beginStroke("#FFA500");
				border.graphics.setStrokeStyle(1);
				border.snapToPixel = true;
				border.graphics.drawRect(0, 0, space.width, space.height);
				this.addChild (border);
			}

			var text = this.goBigOrGoHome (this.textstring, space.width, space.height);

			//console.log (text);

			//text.textBaseline = 'top';
			text.textAlign = 'center';

			if (this.align == 'center') {
				text.x = ((space.width - text.getBounds ().width) / 2) + text.getBounds ().width / 2;
			}
			else if (this.align == 'left') {
				text.x = text.getBounds ().width / 2;
			}
			else if (this.align == 'right') {
				//text.x = ((space.width - text.getBounds ().width)) + text.getBounds ().width;
				text.x = space.width - text.getBounds ().width;
			}

			text.y = (space.height - text.getBounds ().height) / 2;

			this.addChild (text);

			return this.Container_draw (ctx, ignoreCache);
		};

		createjs.BigText = BigText;
		return BigText;
	}
);