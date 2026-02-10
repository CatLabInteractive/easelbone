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
			this.floaters = [];
			this.rows = 0;
			this.columns = 0;

			this.paddingX = 0;
			this.paddingY = 0;

			this.forceRatio = null;
			this.cellSize = null;
			this.cellEvents = {};

			this.placeholder.on('bounds:change', function() {
				this.redrawGrid();
			}.bind(this));

			this.placeholder.on('tick', function() {
				this.update();
			}.bind(this));
		};

		var p = GridFill.prototype = new createjs.Container ();

		/**
		 * @param {integer} column
		 * @param {integer} row
		 * @param element
		 * @returns {GridFill}
		 */
		p.set = function (column, row, element) {

			if (typeof(this.grid[row]) === 'undefined') {
				this.grid[row] = [];
			}
			this.grid[row][column] = element;

			this.resetSize();
			return this;
		};

		/**
		 * Floating elements float on top of the grid and can take position,
		 * even decimal numbers.
		 * @param x
		 * @param y
		 * @param element
		 * @param offsetX
		 * @param offsetY
		 */
		p.float = function(x, y, element, offsetX, offsetY) {

			if (typeof(offsetX) === 'undefined'){
				offsetX = 0;
			}

			if (typeof(offsetY) === 'undefined') {
				offsetY = 0;
			}

			element.gx = x;
			element.gy = y;

			var el = {
				ox: offsetX,
				oy: offsetY,
				e: element
			};

			this.floaters.push(el);
			return el;
		};

		p.removeFloat = function(element) {
			var index = this.floaters.findIndex(function(el) {
				return el.e === element;
			});
			if (index > -1) {
				this.floaters.splice(index, 1);
			}
		}

		p.clearFloats = function(x, y)
		{
			for (var i = 0; i < this.floaters.length; i++) {
				var el = this.floaters[i];
				if (el.e.gx === x && el.e.gy === y) {
					this.floaters.splice(i, 1);
					i--;
				}
			}
		}

		/**
		 * If set, make sure each cell has the given ratio (width / height)
		 * The grid will not fill the whole placeholder, but instead
		 * it will use the most space as possible.
		 * @param ratio
		 */
		p.forceCellRatio = function(ratio) {
			this.forceRatio = ratio;
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

		p.getCellSize = function() {
			if (this.cellSize === null) {
				this.recalculateCellSize();
			}

			return this.cellSize;
		};

		p.recalculateCellSize = function() {

			var bounds = this.placeholder.getBounds();
			if (!bounds) {
				return;
			}

			var cellWidth;
			var cellHeight;

			var marginX = 0;
			var marginY = 0;

			cellWidth = bounds.width / this.columns;
			cellHeight = bounds.height / this.rows;

			if (this.forceRatio !== null) {

				var currentRatio = cellWidth / cellHeight;
				if (currentRatio > this.forceRatio) {
					// need to add horizontal padding
					cellWidth = cellHeight * this.forceRatio;
					marginX = (bounds.width - (cellWidth * this.columns)) / 2;
				} else if (currentRatio < this.forceRatio) {
					// need to add vertical padding
					cellHeight = cellWidth * this.forceRatio;
					marginY = (bounds.height - (cellHeight * this.rows)) / 2;
				}

			}

			var paddingX = cellWidth * this.paddingX;
			var paddingY = cellHeight * this.paddingY;

			var cellInnerWidth = cellWidth - (paddingX * 2);
			var cellInnerHeight = cellHeight - (paddingY * 2);

			this.cellSize = {
				width: cellWidth,
				height: cellHeight,
				marginX: marginX,
				marginY: marginY,
				innerWidth: cellInnerWidth,
				innerHeight: cellInnerHeight,
				paddingX: paddingX,
				paddingY: paddingY
			};

		};

		p.getCellPosition = function(col, row)
		{
			var cellSize = this.getCellSize();
			if (!cellSize) {
				return null;
			}

			return {
				x: cellSize.marginX + (col * cellSize.width) + cellSize.paddingX,
				y: cellSize.marginY + (row * cellSize.height) + cellSize.paddingY,
				innerWidth: cellSize.innerWidth,
				innerHeight: cellSize.innerHeight
			};
		};

		p.addCellEventListener = function(col, row, event, callback) {
			if (typeof(this.cellEvents[col + '-' + row]) === 'undefined') {
				this.cellEvents[col + '-' + row] = [];
			}

			this.cellEvents[col + '-' + row].push({
				event: event,
				callback: callback
			});
		}

		/**
		 *
		 */
		p.redrawGrid = function() {

			this.placeholder.removeAllChildren();

			var bounds = this.placeholder.getBounds();

			if (this.rows === 0 || this.columns === 0) {
				return;
			}

			if (!bounds) {
				return;
			}

			this.recalculateCellSize();
			var cellSize = this.getCellSize();


			for (var row = 0; row < this.rows; row ++) {
				for (var col = 0; col < this.columns; col ++) {

					var element = this.get(row, col);
					if (!element) {
						continue;
					}

					var container = new createjs.Container();
					this.placeholder.addChild(container);

					var pos = this.getCellPosition(col, row);

					container.y = pos.y;
					container.x = pos.x;
					container.setBounds(0, 0, pos.innerWidth, pos.innerHeight);

					if (typeof(this.cellEvents[col + '-' + row]) !== 'undefined') {
						this.cellEvents[col + '-' + row].forEach(function(event) {
							container.addEventListener(event.event, event.callback);
						});

						var hit = new createjs.Shape();
						hit.graphics.beginFill("#000").drawRect(
							0, 0,
							pos.innerWidth, pos.innerHeight
						);
						container.hitArea = hit;
					}

					container.addChild(element);

				}
			}

			// Add the floaters
			this.floaters.forEach(function(element) {

				var container = new createjs.Container();
				this.placeholder.addChild(container);

				var pos = this.getCellPosition(
					element.e.gx + element.ox,
					element.e.gy + element.oy
				);

				container.y = pos.y;
				container.x = pos.x;
				container.setBounds(0, 0, pos.innerWidth, pos.innerHeight);

				container.addChild(element.e);

			}.bind(this));

		};

		p.update = function() {

			// Add the floaters
			this.floaters.forEach(function(element) {

				if (!element.e || !element.e.parent) {
					return;
				}

				var pos = this.getCellPosition(
					element.e.gx + element.ox,
					element.e.gy + element.oy
				);

				if (pos) {
					element.e.parent.x = pos.x;
					element.e.parent.y = pos.y;
				}

			}.bind(this));
		};

		return GridFill;
	}
);
