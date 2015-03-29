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



		return ScrollArea;
	}
);