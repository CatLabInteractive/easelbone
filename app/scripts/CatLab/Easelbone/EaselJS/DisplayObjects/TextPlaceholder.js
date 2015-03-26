define (
	[
		'EaselJS'
	],
	function (createjs)
	{
		var TextPlaceholder = function (element) {

			/*
			var dimensions = {
				'width': element.scaleX * 100,
				'height': element.scaleY * 100
			};

			this.id = Math.random ();

			this.setBounds (
				0, 0,
				dimensions.width,
				dimensions.height
			);

			element.scaleX = 1;
			element.scaleY = 1;

			element.removeAllChildren ();
			*/
			this.setBounds (
				0, 0,
				150,
				50
			);

			element.addChild (this);
		};

		TextPlaceholder.prototype = new createjs.Container ();

		return TextPlaceholder;
	}
);