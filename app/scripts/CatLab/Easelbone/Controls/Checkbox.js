define(
    [
        'CatLab/Easelbone/Controls/Base'
    ],
    function (Base) {

        var Checkbox = function (element) {

            Base.call(this, element);

            this.element = element;

            // Listen to click event
            this.element.addEventListener('click', function () {
                this.toggle();
            }.bind(this));

        };

        // Extend base.
        Checkbox.prototype = Object.create(Base.prototype);
        Checkbox.prototype.constructor = Checkbox;

        Checkbox.prototype.toggle = function () {
            this.checked = !this.checked;
            this.update();

            this.trigger('update', this.checked);
        };

        Checkbox.prototype.check = function () {
            this.checked = true;
            this.update();

            this.trigger('update', this.checked);
        };

        Checkbox.prototype.uncheck = function () {
            this.checked = false;
            this.update();

            this.trigger('update', this.checked);
        };

        Checkbox.prototype.keyInput = function (input) {
            switch (input) {
                case 'a':
                case 'start':

                    this.toggle();

                    break;
            }
        };

        return Checkbox;

    }
);
