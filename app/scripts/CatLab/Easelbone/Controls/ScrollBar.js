define (
	[
		'underscore'
	],
	function (_) {

		var ScrollBar = function (element) {

			var self = this;
			this.element = element;

			this.element.up.on ('click', this.up, this);
			this.element.down.on ('click', this.down, this);

			this.containers = [];

		};

		var p = ScrollBar.prototype;

		p.link = function (container) {
			this.containers.push (container);
		};

		p.up = function () {
			_.each (this.containers, function (v) {
				v.up ();
			});
		};

		p.down = function () {
			_.each (this.containers, function (v) {
				v.down ();
			});
		};

		return ScrollBar;

	}
);