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
		};

		var p = ScrollArea.prototype = new Placeholder ();

		p.setScroll = function (y) {

			if (y < 0) {
				return;
			}

			if (y > (this.getBounds ().height - this.parent.getBounds ().height)) {
				return;
			}

			this.y = 0 - y;
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

		return ScrollArea;
	}
);