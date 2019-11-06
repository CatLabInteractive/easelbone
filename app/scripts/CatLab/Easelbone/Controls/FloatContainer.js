define(
    [
        'easeljs',

        'CatLab/Easelbone/Controls/ListElement'
    ],
    function (createjs, ListElement) {
        var List = function (childElement, columns) {

            this.initialize();
            this.listItems = [];

            if (typeof (childElement) !== 'undefined') {
                this.setChildElement(childElement);
            }

            this.rows = 0;
            this.columns = columns;
            this.currentColumn = 0;

            this.curX = 0;
            this.curY = 0;
            this.rowHeight = 0;
        };

        var p = List.prototype = new createjs.Container();

        p.setChildElement = function (element) {
            this.childElement = element;

            var tmpElement = this.getChildElement(null, this.listItems.length);
            this.boundary = {
                'x': tmpElement.boundary.x,
                'y': tmpElement.boundary.y
            };

            this.rowHeight = this.boundary.y;
        };

        p.getChildElement = function (options, index) {
            if (typeof (this.childElement) === 'undefined') {
                throw "No child element set.";
            }

            if (this.childElement.prototype instanceof createjs.DisplayObject) {
                return new this.childElement();
            }

            return this.childElement(options);
        };

        p.updateBounds = function () {
            this.setBounds(
                0, 0,
                this.boundary.x * this.columns, this.curY + this.rowHeight
            );
        };

        p.nextRow = function () {
            this.currentColumn = 1;
            this.rows++;

            this.curY += this.rowHeight;
            this.rowHeight = 0;
        };

        p.getNextPosition = function () {

            var out = {};

            this.currentColumn++;
            if (this.currentColumn > this.columns) {
                this.nextRow();
            }

            out.x = this.boundary.x * (this.currentColumn - 1);
            out.y = this.curY;

            return out;
        };

        p.createElement = function (options) {

            var child = new ListElement(this.getChildElement(options));
            this.listItems.push(child);

            this.addChild(child.element);

            // Check if there is space getPleft on the current row.
            var pos = this.getNextPosition();
            this.rowHeight = Math.max(this.rowHeight, child.getDimensions().height);

            child.element.x = pos.x;
            child.element.y = pos.y;

            this.updateBounds();

            return child;
        };

        p.removeAllChildren_container = p.removeAllChildren;

        p.removeAllChildren = function () {

            this.currentColumn = 0;
            this.rows = 0;
            this.curY = 0;

            this.removeAllChildren_container.apply(this, arguments);

        };

        return List;
    }
);