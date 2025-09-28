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

            // Check for text placeholder.
            if (!this.element.text) {
                throw "All buttons should have a text placeholder.";
            }

            this.convertText();

            // Listen to click event
            this.element.addEventListener('click', function () {
                this.trigger('click');
            }.bind(this));
        };

        // Extend base.
        Button.prototype = Object.create(Base.prototype);
        Button.prototype.constructor = Button;

        Button.prototype.setText = function (text, font, color) {
            this.text.addChild(new BigText(text, font, color));
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
