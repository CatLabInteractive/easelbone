define (
	[
		'underscore',

		'CatLab/Easelbone/Utilities/Path'
	],
	function (_, Path) {

		var ScrollBar = function (element) {

			var self = this;

			this.element = element;

			this.element.up.on ('click', this.up, this);
			this.element.down.on ('click', this.down, this);

			this.path = new Path (this.element.minimum, this.element.maximum);

			this.containers = [];

			// Set scroller
			this.element.on ('pressmove', function (evt) {
				position = self.element.globalToLocal (evt.stageX, evt.stageY);
				self.scrollTo (self.path.getValue (position.x, position.y));
			});

		};

		var p = ScrollBar.prototype;

		var heightPercentage;
		var position;

		p.link = function (container) {
			this.containers.push (container);

			container.on ('scroll', this.onScroll, this);
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

		p.getIndicatorSize = function () {

			if (this.element.indicator.bottom && this.element.indicator.top) {
				position = {
					'x' : (this.element.indicator.bottom.x - this.element.indicator.top.x) * this.element.indicator.scaleX,
					'y' : (this.element.indicator.bottom.y - this.element.indicator.top.y) * this.element.indicator.scaleY
				};
			}
			else {
				position = { 'x' : 0, 'y' : 0 };
			}

			return position;
		};

		p.scrollTo = function (percentage) {
			_.each (this.containers, function (v) {
				v.scrollTo (percentage);
			});
		};

		p.onScroll = function (percentage) {

			heightPercentage = Math.min (1, percentage.containerHeight / percentage.contentHeight);

			position = this.getIndicatorSize ();
			this.path.setIndicatorSize (position.x, position.y);
			this.path.position (this.element.indicator, percentage.percentage);

		};

		return ScrollBar;

	}
);