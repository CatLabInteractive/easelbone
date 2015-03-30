define (
	[
		'EaselJS',

		'CatLab/Easelbone/Controls/ListElement'
	],
	function (createjs, ListElement)
	{
		var List = function (childElement, columns) {

			this.initialize ();

			this.listItems = [];

			if (typeof (childElement) != 'undefined') {
				this.setChildElement (childElement);
			}

			this.rows = 0;
			this.columns = columns;
			this.currentColumn = 0;
		};

		var p = List.prototype = new createjs.Container ();

		p.setChildElement = function (element) {
			this.childElement = element;

			var tmpElement = new element ();
			this.boundary = {
				'x' : tmpElement.boundary.x,
				'y' : tmpElement.boundary.y
			};
		};

		p.getChildElement = function () {
			if (typeof (this.childElement) == 'undefined') {
				throw "No child element set.";
			}
			return this.childElement;
		};

		p.updateBounds = function () {
			this.setBounds (
				0, 0,
				this.boundary.x * this.columns, (this.boundary.y * this.rows)
			);
		};

		p.nextRow = function () {
			this.currentColumn = 1;
			this.rows ++;
		};

		p.getNextPosition = function () {

			var out = {};

			this.currentColumn ++;
			if (this.currentColumn > this.columns) {
				this.nextRow ();
			}

			out.x = this.boundary.x * (this.currentColumn - 1);
			out.y = this.boundary.y * (this.rows);

			return out;
		};

		p.createElement = function () {

			var child = new ListElement (new (this.getChildElement ()) ());
			this.listItems.push (child);

			this.addChild (child.element);

			// Check if there is space getPleft on the current row.
			var pos = this.getNextPosition ();

			child.element.x = pos.x;
			child.element.y = pos.y;

			this.updateBounds ();

			return child;
		};

		return List;
	}
);