define (
	[
		'CatLab/Easelbone/Controls/Base',
		'CatLab/Easelbone/EaselJS/DisplayObjects/BigText',
		'CatLab/Easelbone/EaselJS/DisplayObjects/TextPlaceholder'
	],
	function (
		Base,
		BigText,
		TextPlaceholder
	) {

		var Selectbox = function (element) {

			var self = this;

			this.element = element;
			this.checked = false;

			this.repeat = false;
			this.textcontainer = BigText;

			this.index = 0;
			this.value = null;
			this.values = [];

			// Check for text placeholder.
			if (!this.element.value) {
				throw "All selectboxes should have a text placeholder.";
			}

			if (!this.element.buttons) {
				throw "All selectboxes must have a buttons object";
			}

			this.element.buttons.on ('click', function (evt) {

				// @TODO fix this, I don't know what's going on here...
				var local = self.element.buttons.globalToLocal (evt.stageX, evt.stageY);
				if (local.y > 40) {
					self.previous ();
				}
				else {
					self.next ();
				}

			});

			this.convertText ();

		};

		// Extend base.
		Selectbox.prototype = new Base ();

		Selectbox.prototype.setText = function (text, font, color) {
			var bigtext = new this.textcontainer (text, font, color);
			this.text.removeAllChildren ();
			this.text.addChild (bigtext);
		};

		Selectbox.prototype.convertText = function (){
			this.text = new TextPlaceholder (this.element.value);
		};

		Selectbox.prototype.setValues = function (values) {

			if (values instanceof Array) {
				var tmp = [];
				for (var i = 0; i < values.length; i ++) {
					tmp.push ({
						'text' : values[i],
						'value' : values[i]
					});
				}
				values = tmp;
			}

			this.values = values;
			this.select (0);
		};

		Selectbox.prototype.getValue = function () {
			return this.value;
		};

		Selectbox.prototype.select = function (index) {

			if (index < 0 || index > this.values.length - 1)
				return;

			this.index = index;
			this.value = this.values[this.index];

			this.setText (this.value.text);
		};

		Selectbox.prototype.next = function () {
			if (this.index < this.values.length - 1) {
				this.select (this.index + 1);
			}
			else if (this.repeat) {
				this.select (0);
			}
		};

		Selectbox.prototype.previous = function () {
			if (this.index > 0) {
				this.select (this.index - 1);
			}
			else if (this.repeat) {
				this.select (this.values.length - 1);
			}
		};

		Selectbox.prototype.keyInput = function (input) {

			switch (input) {
				case 'up':
					this.next ();
				break;

				case 'down':
					this.previous ();
				break;
			}

		};

		return Selectbox;

	}
);