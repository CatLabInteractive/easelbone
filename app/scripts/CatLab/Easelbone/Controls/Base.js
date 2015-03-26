define (
	[
		'underscore',
		'backbone'
	],
	function (_, Backbone)
	{
		var Base = function () {
			this.checked = false;
			this.active = false;
		};

		_.extend (Base, Backbone.Events);

		Base.prototype.activate = function () {
			this.active = true;
			this.update ();
		};

		Base.prototype.deactivate = function () {
			this.active = false;
			this.update ();
		};

		Base.prototype.update = function () {
			if (this.active) {
				if (this.checked) {
					this.element.gotoAndPlay ('Hit');
				}
				else {
					this.element.gotoAndPlay ('Over');
				}
			}
			else {
				if (this.checked) {
					this.element.gotoAndPlay ('Down');
				}
				else {
					this.element.gotoAndPlay ('Up');
				}
			}
		};

		return Base;

	}
);