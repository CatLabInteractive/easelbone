define(
    [
        'CatLab/Easelbone/Controls/Choice',
        'CatLab/Easelbone/EaselJS/DisplayObjects/TextPlaceholder'
    ],
    function (Choice,
              TextPlaceholder) {

        /**
         * A spinner: the selected value in a `value` text placeholder, with a
         * `buttons` symbol whose top half selects the next value and whose
         * bottom half the previous one. The value model itself lives in Choice.
         */
        var Selectbox = function (element) {

            // Checked before Choice so the selectbox' own messages survive.
            if (!element.value) {
                throw "All selectboxes should have a text placeholder.";
            }

            if (!element.buttons) {
                throw "All selectboxes must have a buttons object";
            }

            Choice.call(this, element);

            this.repeat = false;

            this.element.buttons.on('click', function (evt) {

                // @TODO fix this, I don't know what's going on here...
                var local = this.element.buttons.globalToLocal(evt.stageX, evt.stageY);
                if (local.y > 40) {
                    this.previous();
                }
                else {
                    this.next();
                }

            }.bind(this));

        };

        // Extend choice.
        Selectbox.prototype = Object.create(Choice.prototype);
        Selectbox.prototype.constructor = Selectbox;

        /**
         * Kept for compatibility: Choice' constructor already built the text
         * element, this rebuilds it.
         */
        Selectbox.prototype.convertText = function () {
            this.textElement = new TextPlaceholder(this.element.value);
        };

        Selectbox.prototype.next = function () {
            if (this.selectedIndex < this.allValues.length - 1) {
                this.select(this.selectedIndex + 1);
            }
            else if (this.repeat) {
                this.select(0);
            }
        };

        Selectbox.prototype.previous = function () {
            if (this.selectedIndex > 0) {
                this.select(this.selectedIndex - 1);
            }
            else if (this.repeat) {
                this.select(this.allValues.length - 1);
            }
        };

        Selectbox.prototype.keyInput = function (input) {

            switch (input) {
                case 'up':
                    this.next();
                    break;

                case 'down':
                    this.previous();
                    break;
            }

        };

        return Selectbox;

    }
);
