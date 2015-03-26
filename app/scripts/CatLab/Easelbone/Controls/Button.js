define (
	[
		'CatLab/Easelbone/Controls/Base'
	],
	function (
		Base
	) {

		var Button = function (element) {

			this.element = element;
			this.checked = false;

		};

		// Extend base.
		Button.prototype = new Base ();

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