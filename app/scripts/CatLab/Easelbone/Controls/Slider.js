define (
	[
		'CatLab/Easelbone/Controls/Base'
	],
	function (
		Base
	) {

		var Slider = function (element) {

			var self = this;

			this.element = element;
			this.value = 0.7;
			this.initialized = false;

			var listener = element.addEventListener ('tick', function () {
				element.removeEventListener ('tick', listener);
				self.afterFirstFrame ();
			});

		};

		// Extend base.
		Slider.prototype = new Base ();

		Slider.prototype.afterFirstFrame = function () {
			this.initialized = true;
			this.setValue (this.value);
		};

		Slider.prototype.link = function (model, attribute) {

			this.setValue (model.get (attribute));
			return this;

		};

		Slider.prototype.setValue = function (value) {

			this.value = value;
			if (this.initialized)
				this.element.setValue (this.value);

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