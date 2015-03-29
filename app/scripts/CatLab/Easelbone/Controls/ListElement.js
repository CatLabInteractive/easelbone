define (
	[],
	function () {

		var ListElement = function (element) {

			this.element = element;

		};

		var p = ListElement.prototype;

		p.focus = function () {
			this.dispatchEvent ('focus');
		};

		return ListElement;

	}
);