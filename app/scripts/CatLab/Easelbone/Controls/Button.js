define(
    [
        'CatLab/Easelbone/Controls/Base',
        'CatLab/Easelbone/EaselJS/DisplayObjects/BigText',
        'CatLab/Easelbone/EaselJS/DisplayObjects/TextPlaceholder'
    ],
    function (Base,
              BigText,
              TextPlaceholder) {

        var Button = function (element)
        {
            Base.call(this, element);

            // The text placeholder is optional: a button may be an icon-only
            // symbol with no text child at all. When present it is converted
            // to a BigText/TextPlaceholder as before; when absent, setText()
            // becomes a no-op. Either way the element still has to be a
            // MovieClip with the usual Up/Over/Down/Hit frames, since
            // Base#update drives the symbol through those via gotoWithAnimate.
            if (this.element.text) {
                this.convertText();
            }

            // Listen to click event
            this.element.addEventListener('click', function () {
                this.trigger('click');
            }.bind(this));
        };

        // Extend base.
        Button.prototype = Object.create(Base.prototype);
        Button.prototype.constructor = Button;

        // Does nothing when the button has no text placeholder.
        Button.prototype.setText = function (text, font, color) {
            if (!this.text) {
                return;
            }
            this.text.addChild(new BigText(text, font, color));
        };

		Button.prototype.click = function(callback) {
			this.on('click', callback);
		};

        Button.prototype.convertText = function ()
        {

            if (this.element.text instanceof createjs.Text) {

                // Overwrite origal "bigtext" solution.
                var self = this;
                this.setText = function (text) {
                    self.element.text.text = text;
                };
            }
            else {
                this.text = new TextPlaceholder(this.element.text);
            }

        };

        Button.prototype.keyInput = function (input, actor) {
            switch (input) {
                case 'a':
                case 'start':

                    this.trigger('click', actor);

                    break;
            }
        };

        return Button;

    }
);
