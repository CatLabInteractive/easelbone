define (
	[
		'easeljs'
	],
	function (createjs)
	{
		var GridFill = function (placeholder) {


			this.initialize ();

			this.placeholder = placeholder;
			this.grid = [];
			this.rows = 0;
			this.columns = 0;

			this.paddingX = 0;
			this.paddingY = 0;

			this.placeholder.on('bounds:change', function() {

				this.redrawGrid();

			}.bind(this));
		};

		var p = GridFill.prototype = new createjs.Container ();

		/**
		 * @param row
		 * @param column
		 * @param element
		 * @returns {GridFill}
		 */
		p.set = function (row, column, element) {

			if (typeof(this.grid[row]) === 'undefined') {
				this.grid[row] = [];
			}
			this.grid[row][column] = element;

			this.resetSize();
			return this;
		};

		p.resetSize = function() {
			this.rows = this.grid.length;
			this.columns = 0;
			this.grid.forEach(function(row) {
				if (this.columns < row.length) {
					this.columns = row.length;
				}
			}.bind(this));

			this.redrawGrid();
		};

		p.clear = function(row, column) {
			if (typeof(this.grid[row]) === 'undefined') {
				this.grid[row] = [];
			}
			delete this.grid[row][column];
			if (this.grid[row].length === 0) {
				delete this.grid[row];
			}
			this.resetSize();
		};

		/**
		 * @param row
		 * @param column
		 * @returns {null|*}
		 */
		p.get = function (row, column) {
			if (typeof(this.grid[row]) === 'undefined') {
				return null;
			}

			if (typeof(this.grid[row][column]) === 'undefined') {
				return null;
			}

			return this.grid[row][column];
		};

		p.setPadding = function(paddingFactorX, paddingFactorY)
		{
			this.paddingX = paddingFactorX;
			this.paddingY = paddingFactorY;
		};

		p.redrawGrid = function() {

			this.placeholder.removeAllChildren();
			var bounds = this.placeholder.getBounds();

			if (this.rows === 0 || this.columns === 0) {
				return;
			}

			if (!bounds) {
				return;
			}

			var cellWidth = bounds.width / this.columns;
			var cellHeight = bounds.height / this.rows;

			var paddingX = cellWidth * this.paddingX;
			var paddingY = cellHeight * this.paddingY;

			var cellInnerWidth = cellWidth - (paddingX * 2);
			var cellInnerHeight = cellHeight - (paddingY * 2);

			for (var row = 0; row < this.rows; row ++) {
				for (var col = 0; col < this.columns; col ++) {

					var element = this.get(row, col);
					if (!element) {
						continue;
					}

					var container = new createjs.Container();
					this.placeholder.addChild(container);

					container.y = (row * cellHeight) + paddingY;
					container.x = (col * cellWidth) + paddingX;
					container.setBounds(0, 0, cellInnerWidth, cellInnerHeight);

					container.addChild(element);

				}
			}

		};

		return GridFill;
	}
);