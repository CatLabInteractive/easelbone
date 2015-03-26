define (
	[
		'CatLab/Easelbone/Controls/Base'
	],
	function (
		Base
	) {

		var Checkbox = function (element) {

			this.element = element;

		};

		// Extend base.
		Checkbox.prototype = new Base ();

		Checkbox.prototype.keyInput = function (input) {

			switch (input) {
				case 'a':

					this.checked = !this.checked;
					this.update ();

				break;
			}

		};

		return Checkbox;

	}
);