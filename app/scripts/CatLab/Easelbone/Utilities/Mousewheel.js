define (
	[],
	function () {

		var MouseWheel = function () {

			var self = this;

			document.body.addEventListener ('mousewheel', function (evt) {
				self.scroll (evt);
			})

		};

		var p = MouseWheel.prototype;

		p.scroll = function (evt) {

			if (this.callback) {
				this.callback ({ 'x' : 0, 'y' : evt.wheelDelta });
			}

		};

		p.listen = function (callback) {

			this.stop ();
			this.callback = callback;

		};

		p.stop = function () {
			this.callback = null;
		};

		return new MouseWheel ();
	}
);