define (
	[
		'CatLab/Easelbone/Controls/Base',

		'CatLab/Easelbone/Controls/ScrollBar',
		'CatLab/Easelbone/EaselJS/DisplayObjects/ScrollArea',

		'CatLab/Easelbone/Utilities/Mousewheel'
	],
	function (Base, ScrollBar, ScrollAreaDisplayObject, Mousewheel) {

		var ScrollArea = function (element) {

			var self = this;
			this.element = element;

			this.scrollbar = new ScrollBar (element.scrollbar);
			this.scrollbar.link (this);

			this.content = new ScrollAreaDisplayObject (element.content);
			this.content.on ('scroll', this.onScroll, this);

			// If mouseover events are available, listen to those
			this.element.on ('mouseover', this.enableScrollMouse, this);
			this.element.on ('mouseout', this.disableScrollMouse, this);
			this.element.on ('removed', this.disableScrollMouse, this);

			//this.scrollTo (0);
			this.element.on ('added', this.onAdd, this);
		};

		var p = ScrollArea.prototype = new Base ();

		p.enableScrollMouse = function () {
			var self = this;
			Mousewheel.listen (function (iv) {
				self.scroll (iv.y > 0 ? 50 : - 50);
			});
		};

		p.onAdd = function () {
			this.scrollTo (0);
		};

		p.disableScrollMouse = function () {
			Mousewheel.stop ();
		};

		p.onScroll = function (evt) {

			var perc = {
				'percentage' : this.content.getPercentage (),
				'contentHeight' : this.content.getBounds ().height,
				'containerHeight' : this.content.parent.getBounds ().height
			};

			this.trigger ('scroll', perc);
		};

		p.scrollTo = function (percentage) {
			this.content.scrollTo (percentage);
		};

		p.scroll = function (pixels) {
			this.content.up (pixels);
		};

		p.up = function () {
			this.content.up (25);
		};

		p.down = function () {
			this.content.down (25);
		};

		p.focus = function (element, delay, ease) {
			return this.content.focus (element, delay, ease);
		};

		return ScrollArea;

	}
);