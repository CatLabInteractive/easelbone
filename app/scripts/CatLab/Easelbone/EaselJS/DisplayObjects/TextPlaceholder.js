define (
	[
		'EaselJS'
	],
	function (createjs)
	{
		var TextPlaceholder = function (element) {

			/**
			 * Initialize the element
			 */
			this.initialize ();

			/**
			 * Turn the scaled dimensions into visible pixel dimensions
			 * @type {{width: number, height: number}}
			 */
			var dimensions = {
				'width': element.scaleX * 100,
				'height': element.scaleY * 100
			};

			// Set the bounds on this local container
			this.setBounds (
				0, 0,
				dimensions.width,
				dimensions.height
			);

			// Scale the original element back to it's original proportions
			element.scaleX = 1;
			element.scaleY = 1;

			element.original_draw = element.draw;
			element.draw = function (ctx, ignoreCache) {
				element.scaleX = 1;
				element.scaleY = 1;
				return element.original_draw (ctx, ignoreCache);
			};

			// Remove everything
			element.removeAllChildren ();

			// And add ourselves
			element.addChild (this);
		};

		var p = TextPlaceholder.prototype = new createjs.Container ();


		return TextPlaceholder;
	}
);