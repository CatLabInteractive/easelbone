define (
	[
		'CatLab/Easelbone/Controls/ScrollBar'
	],
	function (ScrollBar) {

		var ScrollArea = function (element) {

			console.log (element);
			this.scrollbar = new ScrollBar (element.scrollbar);

		};



		return ScrollArea;

	}
);