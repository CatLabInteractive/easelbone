define (
	[
		'EaselJS',
		'CatLab/Easelbone/EaselJS/DisplayObjects/Placeholder'
	],
	function (createjs, Placeholder)
	{
		var ScrollArea = function (element) {

			var self = this;

			this.initialize ();

			var parent = new Placeholder (element);

			parent.on ('bounds:change', function () {
				// Also set the mask.
				var maskShape = new createjs.Shape();
				maskShape.graphics.drawRect (0, 0, this.getBounds ().width, this.getBounds ().height);

				self.mask = maskShape;
			});

			parent.addChild (this);

			// Also scroll.
			setTimeout (function () {
				self.setScroll (0);
			}, 1);
		};

		var p = ScrollArea.prototype = new Placeholder ();
		var event;

		p.setScroll = function (y) {

			if (y < 0) {
				this.y = 0;
			}

			else if (this.getBounds ().height - this.parent.getBounds ().height < 0) {
				this.y = 0;
			}

			else if (y > (this.getBounds ().height - this.parent.getBounds ().height)) {
				this.y = 0 - (this.getBounds ().height - this.parent.getBounds ().height);
			}

			else {
				this.y = 0 - y;
			}

			this.onScroll ();
			return this;
		};

		p.getScroll = function () {
			return 0 - this.y;
		};

		p.down = function (amount) {
			return this.setScroll (this.getScroll () + amount);
		};

		p.up = function (amount) {
			return this.setScroll (this.getScroll () - amount);
		};

		p.getPercentage = function () {
			return this.getScroll () / (this.getBounds ().height - this.parent.getBounds ().height);
		};

		p.scrollTo = function (percentage) {
			this.setScroll (percentage * (this.getBounds ().height - this.parent.getBounds ().height));
		};

		p.onScroll = function () {

			event = new createjs.Event ('scroll');
			this.dispatchEvent (event);
		};

		return ScrollArea;
	}
);