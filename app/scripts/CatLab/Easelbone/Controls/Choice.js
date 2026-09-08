define(
    [
        'CatLab/Easelbone/Controls/Base',
        'CatLab/Easelbone/EaselJS/DisplayObjects/BigText',
        'CatLab/Easelbone/EaselJS/DisplayObjects/TextPlaceholder'
    ],
    function (Base,
              BigText,
              TextPlaceholder) {

        /**
         * Abstract base for every control that presents a list of choices and
         * shows the selected one in a `value` text placeholder: the Selectbox
         * (a spinner with next/previous buttons) and the Dropdown (a popover
         * list). It owns the value model - the value list, the selected index,
         * the lookups and the accessors - and nothing else. How the choice is
         * MADE is the subclass' business.
         *
         * A subclass that wants its own error message for a missing `value`
         * placeholder checks `element.value` itself BEFORE calling this
         * constructor (both current subclasses do).
         */
        var Choice = function (element) {

            Base.call(this, element);

            // Check for text placeholder.
            if (!this.element.value) {
                throw "All choice controls should have a value text placeholder.";
            }

            this.textcontainer = BigText;

            this.selectedIndex = 0;
            this.selectedValue = null;
            this.allValues = [];

            this.textElement = new TextPlaceholder(this.element.value);

        };

        // Extend base.
        Choice.prototype = Object.create(Base.prototype);
        Choice.prototype.constructor = Choice;

        /**
         * Accepts an array of strings, an array of objects ({ text: , value: })
         * or a map of value => text. Selects the first entry.
         */
        Choice.prototype.setValues = function (values) {

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
            }

            this.allValues = tmp;
            this.select(0);
        };

        /**
         * Select the index'th value, if there is one. Returns true when the
         * selection actually moved there, so a subclass' override can act on
         * the same bounds check without repeating it.
         */
        Choice.prototype.select = function (index) {

            if (index < 0 || index > this.allValues.length - 1) {
                return false;
            }

            this.selectedIndex = index;
            this.selectedValue = this.allValues[this.selectedIndex];

            this._syncText();

            return true;
        };

        /**
         * Paint the selected value in the placeholder. Subclasses override this
         * to pass their own font / colour.
         */
        Choice.prototype._syncText = function () {
            this.setText(this.selectedValue.text);
        };

        Choice.prototype.setText = function (text, font, color) {
            var bigtext = new this.textcontainer(text, font, color);
            this.textElement.removeAllChildren();
            this.textElement.addChild(bigtext);
        };

        Choice.prototype.getValue = function () {
            return this.selectedValue ? this.selectedValue.value : null;
        };

        Choice.prototype.getIndexFromText = function (value) {
            for (var i = 0; i < this.allValues.length; i++) {
                if (this.allValues[i].text == value) {
                    return i;
                }
            }
            return null;
        };

        Choice.prototype.getIndexFromValue = function (value) {
            for (var i = 0; i < this.allValues.length; i++) {
                if (this.allValues[i].value == value) {
                    return i;
                }
            }
            return null;
        };

        Object.defineProperty(Choice.prototype, "text", {
            get: function () {
                return this.selectedValue ? this.selectedValue.text : null;
            },

            set: function (value) {
                var index = this.getIndexFromText(value);
                if (index !== null) {
                    this.index = index;
                }
            }
        });

        Object.defineProperty(Choice.prototype, "value", {
            get: function () {
                return this.getValue();
            },

            set: function (value) {
                var index = this.getIndexFromValue(value);
                if (index !== null) {
                    this.index = index;
                }
            }
        });

        Object.defineProperty(Choice.prototype, "index", {
            get: function () {
                return this.selectedIndex;
            },

            set: function (value) {
                this.select(value);
            }
        });

        Object.defineProperty(Choice.prototype, "values", {
            get: function () {
                return this.allValues;
            },

            set: function (values) {
                this.setValues(values);
            }
        });

        return Choice;

    }
);
