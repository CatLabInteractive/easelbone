define(
    [
        'easeljs',
        'CatLab/Easelbone/Utilities/GlobalProperties',
        'CatLab/Easelbone/EaselJS/DisplayObjects/EmojiText'
    ],
    function (createjs, GlobalProperties, EmojiText) {
        var width;
        var height;
        var debug = false;
        var hash;
        var hasChanged = false;
        var cacheAfterDraw = true;

        var currentHeight;
        var currentWidth;

        var currentBounds;
        var currentSize = {
            'width': 0,
            'height': 0
        };

        var fontLineheightCache = {};

        var fontOffsets = {};
        var fontLineHeights = {};

        var fontSize;

        var DefaultTextClass = createjs.Text;
        //var TextClass = EmojiText;

        var BigText = function (aTextstring, aFont, aColor, align) {
            this.setText(aTextstring);
            this._font = GlobalProperties.ifUndefined(aFont, GlobalProperties.getDefaultFont());
            this._color = GlobalProperties.ifUndefined(aColor, GlobalProperties.getDefaultTextColor());
            this._align = typeof (align) === 'undefined' ? 'center' : align;

            this.initialize();
            this.initialized = false;
            this.limits = null;

            this.debug = debug;
            this.fontsize = 0;

            this.textConstructor = DefaultTextClass;
        };

        /**
         * @param font
         * @param x
         * @param y
         */
        BigText.setFontOffset = function (font, x, y) {
            fontOffsets[font] = {
                'x': x,
                'y': y
            };
        };

        BigText.setFontLineHeightFactor = function(font, lineHeightFactor) {
            fontLineHeights[font] = lineHeightFactor;
        };

        /**
         * @param font
         * @returns {number|*}
         */
        BigText.getFontLineHeightFactor = function(font) {
            if (typeof(fontLineHeights[font]) !== 'undefined') {
                return fontLineHeights[font];
            }
            return 1.0;
        }

        /**
         * @param textClass
         */
        BigText.setTextClass = function(textClass) {
            DefaultTextClass = textClass;
        };

        BigText.autoCache = function(autoCache) {
            cacheAfterDraw = autoCache;
        };

        /**
         * @param text
         */
        function updateCurrentSize(text) {
            currentBounds = text.getMetrics();

            currentSize.height = currentBounds.height;
            currentSize.width = currentBounds.width;
        }

        function measureLineHeight(text) {
            return Math.max(
                measureLetter(text, "M").width,
                measureLetter(text, "m").width
            ) * 1.2;
        }

        function measureLetter(text, letter) {
            var ctx = createjs.Text._workingContext;
            ctx.save();
            var size = text._prepContext(ctx).measureText(letter);
            ctx.restore();
            return size;
        }

        function getFontLineheight(text, font) {
            if (typeof (fontLineheightCache[text.font]) === 'undefined') {
                fontLineheightCache[text.font] = measureLineHeight(text);
            }

            return fontLineheightCache[text.font] * BigText.getFontLineHeightFactor(font);
        }

        var p = BigText.prototype = new createjs.Container();

        p.Container_initialize = p.initialize;
        p.Container_tick = p._tick;

        p.getFontOffset = function (font) {
            var fontName = font.split(' ');
            fontName.shift();
            fontName = fontName.join(' ');

            if (typeof (fontOffsets[fontName]) === 'undefined') {
                return {'x': 0, 'y': 0};
            } else {
                return fontOffsets[fontName];
            }
        };

        p.initialize = function () {
            this.Container_initialize();
        };

        p.isVisible = function () {
            return true;
        };

        p.setText = function (text) {
            this.textstring = text;

            if (this.textElement) {
                this.textElement.text = text;
            }
        };

        p.setColor = function (color) {
            this._color = color;
            if (this.textElement) {
                this.textElement.color = color;
            }
        };

        p.setLimits = function (width, height) {
            this.limits = {'width': width, 'height': height};
        };

        p.getAvailableSpace = function () {

            if (this.limits !== null) {
                return this.limits;
            } else if (this._bounds) {
                width = this._bounds.width;
                height = this._bounds.height;
            } else if (this.parent && this.parent.getBounds()) {
                width = this.parent.getBounds().width;
                height = this.parent.getBounds().height
            } else if (this.getBounds()) {
                width = this.getBounds().width;
                height = this.getBounds().height;
            } else {
                width = 0;
                height = 0;
            }

            return {'width': width, 'height': height};
        };

        /**
         * @param text
         * @param fontSize
         * @param font
         * @param color
         * @returns {*}
         */
        p.createTextObject = function(text, fontSize, font, color)
        {
            return new this.textConstructor("" + String(text), fontSize + "px " + font, color);
        };

        /**
         * Return an array of createjs.Text elements that should be displayed below eachother.
         * @param textstring
         * @param availableWidth
         * @param availableHeight
         */
        p.goBigOrGoHome = function (textstring, availableWidth, availableHeight) {
            var self = this;

            var fontsize = 5;
            var fontSizeStep = Math.ceil(availableHeight / 2); // this is how far we want to jump with each try

            var stable = this.createTextObject(textstring, fontsize, this._font, this._color);
            if (!stable.getBounds()) {
                return stable;
            }

            var steps = 0;
            var current;

            function bigger() {
                steps++;
                if (steps > 500) {
                    return false;
                }

                current = self.createTextObject(textstring, fontsize, self._font, self._color)

                current.lineWidth = availableWidth;
                current.lineHeight = getFontLineheight(current, self._font);

                updateCurrentSize(current);

                // Does current size still match the available space?
                if (
                    currentSize.height < availableHeight &&
                    currentSize.width <= availableWidth
                ) {
                    stable = current;
                    fontsize += fontSizeStep;
                    return true;
                } else {
                    // We grew too big :o

                    // Are we increasing with 1 already?
                    if (fontSizeStep === 1) {
                        return false;
                    }

                    // Decimate the font step
                    fontSizeStep = Math.ceil(fontSizeStep / 2);

                    fontsize -= fontSizeStep;
                    return true;
                }
            }

            while (bigger()) {
            }

            this.fontsize = fontsize;
            return stable;
        };

        p.Container_draw = p.draw;

        /**
         * @returns {string|*}
         */
        p.getLocationHash = function () {
            hash = this.getAvailableSpace();
            hash = parseInt(hash.width) + ':' + parseInt(hash.height) + ':' + this.textstring
                + ':' + this._align + ':' + this._font + ':' + this._color

            //location = this.localToGlobal(this.x, this.y);
            //hash = location.x + ':' + location.y + ':' + hash + ':' + this._align;

            return hash;
        };

        /**
         * Determine if the dimensions have changed since last frame.
         * @returns {boolean}
         */
        p.hasChanged = function () {
            if (this.textElement && this.textElement._redrawRequested) {
                this.textElement._redrawRequested = false;
                return true;
            }

            hash = this.getLocationHash();

            hasChanged = this.lastHash !== hash;
            this.lastHash = hash;

            return hasChanged;
        };

        /**
         * Draw text (for the first time)
         */
        p.drawText = function () {
            this.initialized = true;
            this.removeAllChildren();

            if (cacheAfterDraw) {
                this.uncache();
            }

            var space = this.getAvailableSpace();
            if (space.width === 0 || space.height === 0) {
                return;
            }

            if (this.parent) {
                this.adaptToParentProperties(this.parent);
            }

            // Draw container size
            if (this.debug) {
                var border = new createjs.Shape();
                border.graphics.beginStroke("#FFA500");
                border.graphics.setStrokeStyle(1);
                border.snapToPixel = true;
                border.graphics.drawRect(0, 0, space.width, space.height);
                this.addChild(border);
            }

            var text = this.goBigOrGoHome(this.textstring, space.width, space.height);
            this.textElement = text;

            text.textBaseline = 'top';

            updateCurrentSize(text);

            currentHeight = currentSize.height;
            currentWidth = currentSize.width;

            if (this._align === 'center') {
                text.textAlign = 'center';
                text.x = ((space.width - currentWidth) / 2) + (currentWidth / 2);
            } else if (this._align === 'left') {
                text.x = 0;
            } else if (this._align === 'right') {
                //text.x = ((space.width - text.getBounds ().width)) + text.getBounds ().width;
                text.x = space.width - currentWidth;
            }

            currentBounds = text.getMetrics();

            var offset = this.getFontOffset(text.font);
            text.y = (text.lineHeight * offset.y) + ((space.height - currentHeight) / 2);

            this.addChild(text);

            if (cacheAfterDraw) {
                this.cache(-15, -15, space.width + 30, space.height + this.fontsize);
            }
        };

        /**
         * Called when dimensions or content changes.
         */
        p.redrawText = function () {
            this.drawText();
        };

        /**
         * Override the tick method.
         * @param evt
         * @private
         */
        p._tick = function (evt) {
            // container tick
            this.Container_tick(evt);

            if (!this.initialized) {
                this.drawText();
            } else if (this.hasChanged()) {
                this.redrawText();
            }
        };

        /**
         * Check a parent and set properties that we might want to take over.
         * @param parent
         */
        p.adaptToParentProperties = function (parent) {
            if (parent.textColor) {
                this._color = parent.textColor;
            }

            if (parent.textAlign) {
                this._align = parent.textAlign;
            }

            if (parent.textFont) {
                this._font = parent.textFont;
            }
        };

        Object.defineProperty(p, 'color', {
            get: function () {
                return this._color;
            },
            set: function (color) {
                this.setColor(color)
            }
        });

        Object.defineProperty(p, 'font', {
            get: function () {
                return this._font;
            },
            set: function (font) {
                this._font = font;
            }
        });

        Object.defineProperty(p, 'align', {
            get: function () {
                return this._align;
            },
            set: function (align) {
                this._align = align;
            }
        });

        Object.defineProperty(p, 'text', {
            get: function () {
                return this.textstring;
            },
            set: function (text) {
                this.setText(text);
            }
        });

        createjs.BigText = BigText;
        return BigText;
    }
);
