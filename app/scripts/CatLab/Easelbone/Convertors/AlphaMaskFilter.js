define (
	[
		'EaselJS'
	],
	function (createjs) {

		// Convert all displayobject.mask shapes with alphafilters
		var AlphaMaskFilter = function () {

			var alphaMaskFilter = this;

			Object.defineProperty (
				createjs.DisplayObject.prototype,
				'mask',
				{
					'get' : function () {
						return null;
					},
					'set' : function (mask) {
						if (mask) {

							var self = this;
							setTimeout (function () {

								var filter = alphaMaskFilter.getFilterFromMask (mask, self);

								// Instead of assigning the mask, assign a filter.
								self.filters = [
									filter
								];

								self.cache (0, 0, 1000, 1000);
							}, 1);


						}
					}
				}
			);

		};

		var p = AlphaMaskFilter.prototype;

		p.getFilterFromMask = function (mask, parent) {

			// Redraw the graphics.
			var instructions = mask.graphics.getInstructions ();

			var g = new createjs.Graphics;
			g.beginFill ('#000000');
			g.beginStroke ('#000000');
			for (var i = 0; i < instructions.length; i ++) {
				g.append (instructions[i]);
			}

			mask.graphics = g;

			// Create a container.
			var subcontainer = new createjs.Container();
			subcontainer.addChild (mask);

			console.log (parent);

			subcontainer.scaleX = 1 / parent.scaleX;
			subcontainer.scaleY = 1 / parent.scaleY;
			subcontainer.y = 0-(parent.y / 2);
			subcontainer.x = 0-(parent.x / 2);

			var container = new createjs.Container ();
			container.addChild (subcontainer);

			// Cache this shit.
			container.cache (parent.x, parent.y, 1000, 1000);

			return new createjs.AlphaMaskFilter(container.cacheCanvas);

		};

		return AlphaMaskFilter;
	}
);