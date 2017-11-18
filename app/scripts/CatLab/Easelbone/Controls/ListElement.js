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

        /**
         * @returns {{width, height}}
         */
		p.getDimensions = function() {
			return {
                'width' : this.element.boundary.x,
                'height': this.element.boundary.y
            };
		};

		return ListElement;

	}
);