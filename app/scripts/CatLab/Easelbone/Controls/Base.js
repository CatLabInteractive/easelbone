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

			_.extend (this, Backbone.Events);
		};

		Base.prototype.activate = function (animate) {
			this.active = true;
			this.update (animate);
		};

		Base.prototype.deactivate = function (animate) {
			this.active = false;
			this.update (animate);
		};

		Base.prototype.update = function (animate) {

			if (typeof (animate) === 'undefined') {
				animate = true;
			}

			if (this.active) {
				if (this.checked) {
					this.gotoWithAnimate ('Hit', animate);
				}
				else {
					this.gotoWithAnimate ('Over', animate);
				}
			}
			else {
				if (this.checked) {
					this.gotoWithAnimate ('Down', animate);
				}
				else {
					this.gotoWithAnimate ('Up', animate);
				}
			}
		};

		/**
		 * Check if there is a NoAnim framename and use that if animate is set to false.
		 * @param frame
		 * @param animate
		 */
		Base.prototype.gotoWithAnimate = function (frame, animate) {

			if (!animate) {
				if (this.element.timeline.resolve (frame + '-NoAnim')) {
					this.element.gotoAndPlay (frame + '-NoAnim');
					return;
				}
			}

			this.element.gotoAndPlay (frame);
		};

		return Base;

	}
);