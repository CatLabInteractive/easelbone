define(
    [
        'CatLab/Easelbone/Controls/Base',
        'CatLab/Easelbone/EaselJS/DisplayObjects/BigText',
        'CatLab/Easelbone/EaselJS/DisplayObjects/TextPlaceholder'
    ],
    function (Base,
              BigText,
              TextPlaceholder) {

        var Selectbox = function (element) {

            Base.call(this, element);

            this.repeat = false;
            this.textcontainer = BigText;

            this.selectedIndex = 0;
            this.selectedValue = null;
            this.allValues = [];

            // Check for text placeholder.
            if (!this.element.value) {
                throw "All selectboxes should have a text placeholder.";
            }

            if (!this.element.buttons) {
                throw "All selectboxes must have a buttons object";
            }

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

            this.convertText();

        };

        // Extend base.
        Selectbox.prototype = Object.create(Base.prototype);
        Selectbox.prototype.constructor = Selectbox;

        Selectbox.prototype.setText = function (text, font, color) {
            var bigtext = new this.textcontainer(text, font, color);
            this.textElement.removeAllChildren();
            this.textElement.addChild(bigtext);
        };

        Selectbox.prototype.convertText = function () {
            this.textElement = new TextPlaceholder(this.element.value);
        };

        Selectbox.prototype.setValues = function (values) {

            var tmp = [];
            if (!(values instanceof Array)) {
                // Check if array of objects, or array of strings
                for (var ind in values) {
                    if (values.hasOwnProperty(ind)) {
                        var v = values[ind];
                        if (v instanceof Object) {
                            tmp.push(v);
                        }
                        else {
                            // 't is a map.
                            tmp.push({
                                'text': v,
                                'value': ind
                            });
                        }
                    }
                }
            } else {
                for (var i = 0; i < values.length; i++) {
                    tmp.push({
                        'text': values[i],
                        'value': values[i]
                    });
                }
                values = tmp;
            }

            this.allValues = tmp;
            this.select(0);
        };

        Selectbox.prototype.getValue = function () {
            return this.value;
        };

        Selectbox.prototype.select = function (index) {

            if (index < 0 || index > this.values.length - 1)
                return;

            this.selectedIndex = index;
            this.selectedValue = this.values[this.selectedIndex];

            this.setText(this.selectedValue.text);
        };

        Selectbox.prototype.getIndexFromText = function (value) {
            for (var i = 0; i < this.allValues.length; i++) {
                if (this.allValues[i].text == value) {
                    return i;
                }
            }
            return null;
        };

        Selectbox.prototype.getIndexFromValue = function (value) {
            for (var i = 0; i < this.allValues.length; i++) {
                if (this.allValues[i].value == value) {
                    return i;
                }
            }
            return null;
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

        Object.defineProperty(Selectbox.prototype, "text", {
            get: function () {
                return this.selectedValue.text;
            },
            set: function (value) {
                //alert (value);
                //this.selectedValue = value;
                var index = this.getIndexFromText(value);
                if (index !== null) {
                    this.index = index;
                }
            }
        });

        Object.defineProperty(Selectbox.prototype, "value", {
            get: function () {
                return this.selectedValue.value;
            },

            set: function (value) {
                var index = this.getIndexFromValue(value);
                if (index !== null) {
                    this.index = index;
                }
            }
        });

        Object.defineProperty(Selectbox.prototype, "index", {
            get: function () {
                return this.selectedIndex;
            },

            set: function (value) {
                this.select(value);
            }
        });

        Object.defineProperty(Selectbox.prototype, "values", {
            get: function () {
                return this.allValues;
            },

            set: function (values) {
                this.setValues(values);
            }
        });

        return Selectbox;

    }
);