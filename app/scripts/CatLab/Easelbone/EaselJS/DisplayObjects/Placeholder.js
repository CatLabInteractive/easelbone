define (
	[
		'EaselJS'
	],
	function (createjs)
	{
		var Placeholder = function (element) {

			var innerPlaceholder = this;

			/**
			 * Initialize the element
			 */
			this.initialize ();

			element.original_draw = element.draw;

			// Override the draw method of the original placeholder.
			element.draw = function (ctx, ignoreCache) {

				this.updateBounds ();
				return element.original_draw (ctx, ignoreCache);
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

				/*
				this.scaleX = 1;
				this.scaleY = 1;
				*/
			};

			// Remove everything
			//element.removeAllChildren ();
			for (var i = 0; i < element.children.length; i ++) {
				element.children[i].visible = false;
			}

			//element.visible = false;

			// And add ourselves
			element.addEventListener ('added', function () {
				element.parent.addChild (innerPlaceholder);
			});

		};

		var p = Placeholder.prototype = new createjs.Container ();

		return Placeholder;
	}
);