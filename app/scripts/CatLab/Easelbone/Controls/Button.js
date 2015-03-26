define (
	[
		'CatLab/Easelbone/Controls/Base',
		'CatLab/Easelbone/EaselJS/DisplayObjects/BigText'
	],
	function (
		Base,
		BigText
	) {

		var Button = function (element) {

			this.element = element;
			this.checked = false;

		};

		// Extend base.
		Button.prototype = new Base ();

		Button.prototype.setText = function (text, font, color) {
			var bigtext = new BigText (text, font, color);
			bigtext.setLimits (160, 50);

			this.element.text.addChild (bigtext);
		};

		Button.prototype.keyInput = function (input) {

			switch (input) {
				case 'a':

					this.trigger ('button:clicked');

				break;
			}

		};

		return Button;

	}
);