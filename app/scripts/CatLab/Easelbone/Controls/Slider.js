define (
	[
		'CatLab/Easelbone/Controls/Base',
		'CatLab/Easelbone/Utilities/Path'
	],
	function (
		Base,
		Path
	) {

		var Slider = function (element) {

			this.element = element;

			this.path = new Path (this.element.minimum, this.element.maximum);
			this.setValue (0.5);

		};

		// Extend base.
		Slider.prototype = new Base ();

		Slider.prototype.link = function (model, attribute) {

			this.setValue (model.get (attribute));
			return this;

		};

		Slider.prototype.setValue = function (value) {

			this.value = value;
			this.path.position (this.element.pointer, this.value);
		};

		Slider.prototype.keyInput = function (input) {

			console.log (input);

			switch (input) {
				case 'up':
					this.value = Math.min (1, this.value + 0.1);
				break;

				case 'down':
					this.value = Math.max (0, this.value - 0.1);
				break;
			}

			this.setValue (this.value);

		};

		return Slider;

	}
);