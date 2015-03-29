define (
	[
		'CatLab/Easelbone/Controls/Base',

		'CatLab/Easelbone/Controls/ScrollBar',
		'CatLab/Easelbone/EaselJS/DisplayObjects/ScrollArea'
	],
	function (Base, ScrollBar, ScrollAreaDisplayObject) {

		var ScrollArea = function (element) {

			this.scrollbar = new ScrollBar (element.scrollbar);
			this.scrollbar.link (this);

			this.content = new ScrollAreaDisplayObject (element.content);
			this.content.on ('scroll', this.onScroll, this);
		};

		var p = ScrollArea.prototype = new Base ();

		p.onScroll = function (evt) {
			this.trigger ('scroll', 				{
				'percentage' : this.content.getPercentage (),
				'contentHeight' : this.content.getBounds ().height,
				'containerHeight' : this.content.parent.getBounds ().height
			});
		};

		p.scrollTo = function (percentage) {
			this.content.scrollTo (percentage);
		};

		p.up = function () {
			this.content.up (25);
		};

		p.down = function () {
			this.content.down (25);
		};

		return ScrollArea;

	}
);