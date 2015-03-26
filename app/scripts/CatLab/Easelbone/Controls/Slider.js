define (
	[

	],
	function () {

		var Slider = function (element) {

			var self = this;

			this.element = element;
			this.value = 0.5;
			this.initialized = false;

			var listener = element.addEventListener ('tick', function () {
				element.removeEventListener ('tick', listener);
				self.afterFirstFrame ();
			});

		};

		Slider.prototype.afterFirstFrame = function () {
			this.initialized = true;
			this.setValue (this.value);

			//this.element.gotoAndPlay ('Over');
		};

		Slider.prototype.link = function (model, attribute) {

			this.setValue (model.get (attribute));
			return this;

		};

		Slider.prototype.setValue = function(value) {

			console.log (value);

			this.value = value;
			if (this.initialized)
				this.element.setValue (this.value);

		};

		return Slider;

	}
);