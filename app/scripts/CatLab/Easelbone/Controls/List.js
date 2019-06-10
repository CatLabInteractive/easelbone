define (
	[
		'easeljs',
		'CatLab/Easelbone/Controls/ListElement'
	],
	function (createjs, ListElement)
	{
		var List = function (childElement) {

			this.initialize ();

			this.listItems = [];

			if (typeof (childElement) !== 'undefined') {
				this.setChildElement (childElement);
			}
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
			if (typeof (this.childElement) === 'undefined') {
				throw "No child element set.";
			}
			return this.childElement;
		};

		p.updateBounds = function () {
			this.setBounds (
				0, 0,
				this.boundary.x, (this.boundary.y * (this.listItems.length))
			);
		};

		p.createElement = function () {

			var child = new ListElement (new (this.getChildElement ()) ());
			this.listItems.push (child);

			this.addChild (child.element);
			child.element.y = (this.boundary.y * (this.listItems.length - 1));

			this.updateBounds ();

			return child;
		};

		return List;
	}
);