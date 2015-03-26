define (
	[
		'CatLab/Easelbone/Controls/Base',
		'CatLab/Easelbone/EaselJS/DisplayObjects/BigText',
		'CatLab/Easelbone/EaselJS/DisplayObjects/TextPlaceholder'
	],
	function (
		Base,
		BigText,
		TextPlaceholder
	) {

		var Button = function (element) {

			this.element = element;
			this.checked = false;

			// Check for text placeholder.
			if (!this.element.text) {
				throw "All buttons should have a text placeholder.";
			}

			this.text = new TextPlaceholder (this.element.text);

		};

		// Extend base.
		Button.prototype = new Base ();

		Button.prototype.setText = function (text, font, color) {
			var bigtext = new BigText (text, font, color);
			this.text.addChild (bigtext);
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