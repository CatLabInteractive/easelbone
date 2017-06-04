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

			var self = this;

			this.element = element;
			this.checked = false;

			// Check for text placeholder.
			if (!this.element.text) {
				throw "All buttons should have a text placeholder.";
			}

			this.convertText ();

			// Listen to click event
			this.element.addEventListener ('click', function () {
				self.trigger ('click');
			});

		};

		// Extend base.
		Button.prototype = new Base ();

		Button.prototype.setText = function (text, font, color) {
			var bigtext = new BigText (text, font, color);
			this.text.addChild (bigtext);
		};

		Button.prototype.convertText = function (){

            if (this.element.text instanceof createjs.Text) {

                // Overwrite origal "bigtext" solution.
                var self = this;
                this.setText = function (text) {
                    self.element.text.text = text;
                };
            }
            else {
                this.text = new TextPlaceholder (this.element.text);
            }

		};

		Button.prototype.keyInput = function (input) {
			this.trigger ('click');
		};

		return Button;

	}
);