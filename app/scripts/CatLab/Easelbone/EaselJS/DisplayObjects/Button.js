define (
	[
		'EaselJS'
	],
	function (createjs)
	{
		var i;

		var Button = function ()
		{
			this.initialize ();
		};

		var p = Button.prototype = new createjs.Container ();

		p.Container_initialize = p.initialize;
		p.Container_addChild = p.addChild;

		p.initialize = function () {
			this.Container_initialize ();

			this.states = {};
			this.state = null;
		};

		p.isVisible = function ()
		{
			return true;
		};

		p.setState = function (state)
		{
			this.state = state;
		};

		p.addChild = function (state, element)
		{
			if (typeof (this.states[state]) == 'undefined') {
				this.states[state] = [];
			}
			this.states[state].push (element);
		};

		p.getBounds = function ()
		{
			return this.parent.getBounds ();
		};

		p.Container_draw = p.draw;

		p.drawButtonState = function ()
		{
			this.removeAllChildren ();

			if (typeof (this.state) == 'undefined') {
				return;
			}

			if (typeof (this.states[this.state]) != 'undefined') {
				for (i = 0; i < this.states[this.state].length; i++) {
					this.Container_addChild (this.states[this.state][i]);
				}
			}
		};

		p.draw = function (ctx, ignoreCache)
		{
			this.drawButtonState ();
			return this.Container_draw (ctx, ignoreCache);
		};

		createjs.Button = Button;
		return Button;
	}
);