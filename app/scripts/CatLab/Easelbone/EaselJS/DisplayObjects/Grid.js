// namespace:
this.createjs = this.createjs || {};

(function () {

	var i;
	var j;
	var twidth;
	var theight;
	var tborder;

	var Grid = function (aWidth, aHeight)
	{
		this.initialize ();

		this.width = aWidth;
		this.height = aHeight;
		this.data = {};

		for (var i = 0; i < this.width; i ++)
		{
			this.data[i] = {};
			for (var j = 0; j < this.height; j ++)
			{
				this.data[i][j] = new createjs.Container ();
			}
		}
	};

	var p = Grid.prototype = new createjs.Container ();

	p.Container_initialize = p.initialize;

	p.initialize = function() {
		this.Container_initialize ();
	};

	p.isVisible = function ()
	{
		return true;
	};

	p.set = function (row, column, element)
	{
		this.data[row][column].addChild (element);
	};

	p.get = function (row, column)
	{
		return this.data[row][column];
	};

	p.Container_draw = p.draw;

	p.draw = function (ctx, ignoreCache)
	{
		this.removeAllChildren ();

		twidth = this.getBounds ().width / this.width;
		theight = this.getBounds ().height / this.height;

		for (i = 0; i < this.width; i ++)
		{
			for (j = 0; j < this.height; j ++)
			{
				// Square
				/*
				tborder = new createjs.Shape();
				tborder.graphics.beginStroke("#000");
				tborder.graphics.setStrokeStyle(1);
				tborder.snapToPixel = true;

				tborder.graphics.drawRect (twidth * i, theight * j, twidth, theight);
				this.addChild (tborder);
				*/

				// Add container
				this.data[i][j].x = twidth * i;
				this.data[i][j].y = theight * j;
				this.data[i][j].setBounds (0, 0, twidth, theight);

				//var text = new createjs.Text ("test", "20px arial", "#000000");
				this.addChild (this.data[i][j]);
			}
		}

		return this.Container_draw (ctx, ignoreCache);
	};

	createjs.Grid = Grid;

} ());