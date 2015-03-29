define (
	[
		'CatLab/Easelbone/Controls/ScrollBar',
		'CatLab/Easelbone/EaselJS/DisplayObjects/ScrollArea'
	],
	function (ScrollBar, ScrollAreaDisplayObject) {

		var ScrollArea = function (element) {

			this.scrollbar = new ScrollBar (element.scrollbar);
			this.scrollbar.link (this);

			this.content = new ScrollAreaDisplayObject (element.content);
		};

		var p = ScrollArea.prototype;

		p.up = function () {
			alert ('up');
		};

		p.down = function () {
			alert ('down');
		};

		return ScrollArea;

	}
);