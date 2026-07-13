define(
    [
        'easeljs',
        'CatLab/Easelbone/Utilities/GlobalProperties',
        'CatLab/Easelbone/EaselJS/DisplayObjects/EmojiText',
        'CatLab/Easelbone/Utilities/DirtyFlag'
    ],
    function (createjs, GlobalProperties, EmojiText, DirtyFlag) {
        var width;
        var height;
        var debug = false;
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
			this.minFontSize = 5;

            this.textConstructor = DefaultTextClass;
			this.snapToPixel = true;
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

        var currentInk = null;

        /**
         * @param text
         * @param align horizontal alignment the text will be drawn with
         */
        function updateCurrentSize(text, align) {
            currentBounds = text.getMetrics();

            currentSize.height = currentBounds.height;
            currentSize.width = currentBounds.width;

            // Fonts can put ink outside the heuristic text box (above the
            // em-top anchor, or swashes beyond the advance width). Fit on the
            // larger of both so the drawn glyphs never leave the box.
            currentInk = null;
            if (getRegisteredOffset(text.font) === null) {
                currentInk = measureInkBounds(text, currentBounds, align);
                if (currentInk) {
                    if (currentInk.height > currentSize.height) {
                        currentSize.height = currentInk.height;
                    }
                    if (currentInk.width > currentSize.width) {
                        currentSize.width = currentInk.width;
                    }
                }
            }
        }

        var REFERENCE_FONT_SIZE = 100;

        /**
         * Measured line-height per font family, normalized to font size 1.
         * Measuring once per family (instead of per family+size) keeps the
         * cache bounded and skips measureText calls in later fit-searches.
         */
        function getNormalizedLineHeight(font) {
            if (typeof (fontLineheightCache[font]) === 'undefined') {
                var ctx = createjs.Text._workingContext;
                ctx.save();
                ctx.font = REFERENCE_FONT_SIZE + 'px ' + font;
                fontLineheightCache[font] = Math.max(
                    ctx.measureText('M').width,
                    ctx.measureText('m').width
                ) * 1.2 / REFERENCE_FONT_SIZE;
                ctx.restore();
            }
            return fontLineheightCache[font];
        }

        function getFontLineheight(font, fontSize) {
            return getNormalizedLineHeight(font) * fontSize * BigText.getFontLineHeightFactor(font);
        }

        /**
         * Manually registered offset for a full font string
         * (e.g. "275px sans-serif"), or null when none is set.
         */
        function getRegisteredOffset(font) {
            var fontName = font.split(' ');
            fontName.shift();
            fontName = fontName.join(' ');

            if (typeof (fontOffsets[fontName]) === 'undefined') {
                return null;
            }
            return fontOffsets[fontName];
        }

        var inkMetricsSupported = null;

        /**
         * Automatic baseline compensation needs the extended TextMetrics
         * fields; old embedded browsers (smart TVs) may not have them.
         */
        function supportsInkMetrics() {
            if (inkMetricsSupported === null) {
                var m = createjs.Text._workingContext.measureText('M');
                inkMetricsSupported =
                    typeof m.actualBoundingBoxAscent === 'number' &&
                    typeof m.actualBoundingBoxDescent === 'number' &&
                    typeof m.actualBoundingBoxLeft === 'number' &&
                    typeof m.actualBoundingBoxRight === 'number';
            }
            return inkMetricsSupported;
        }

        /**
         * Bounds of the visible glyph ink relative to the text object's
         * origin (textBaseline 'top', horizontal anchor per `align`).
         * Vertically only the first line can raise the top edge and only the
         * last line can lower the bottom edge; horizontally every line
         * matters. Returns null when the browser lacks extended TextMetrics
         * or there is nothing to measure.
         * @param text
         * @param metrics result of text.getMetrics()
         * @param align 'left', 'center' or 'right'
         * @returns {{top, height, left, right, width}|null} left/right are
         *          the ink extents on either side of the anchor point.
         */
        function measureInkBounds(text, metrics, align) {
            if (!supportsInkMetrics()) {
                return null;
            }

            var lines = metrics.lines;
            if (!lines || !lines.length) {
                return null;
            }

            // Only 'center' changes the element's textAlign; 'left' and
            // 'right' keep a left-anchored element and move the block.
            var anchorFactor = align === 'center' ? 0.5 : 0;

            var ctx = createjs.Text._workingContext;
            ctx.save();
            ctx.font = text.font;
            ctx.textBaseline = 'top';
            ctx.textAlign = 'left';

            var top = 0;
            var bottom = 0;
            var left = 0;
            var right = 0;

            for (var i = 0; i < lines.length; i++) {
                var m = ctx.measureText(lines[i]);

                if (i === 0) {
                    top = -m.actualBoundingBoxAscent;
                }
                if (i === lines.length - 1) {
                    bottom = (i * metrics.lineHeight) + m.actualBoundingBoxDescent;
                }

                // Measured from the line's left edge; shift to where the
                // aligned anchor point will be.
                var anchorShift = m.width * anchorFactor;
                left = Math.max(left, m.actualBoundingBoxLeft + anchorShift);
                right = Math.max(right, m.actualBoundingBoxRight - anchorShift);
            }
            ctx.restore();

            if (bottom <= top || left + right <= 0) {
                return null;
            }
            return {
                'top': top,
                'height': bottom - top,
                'left': left,
                'right': right,
                'width': left + right
            };
        }

        var p = BigText.prototype = new createjs.Container();

        p.Container_initialize = p.initialize;
        p.Container_tick = p._tick;

        /**
         * Manually registered offset for this font, or null when none is set
         * (in which case positioning is calculated from TextMetrics).
         * @param font full font string, e.g. "275px sans-serif"
         */
        p.getRegisteredFontOffset = function (font) {
            return getRegisteredOffset(font);
        };

        p.getFontOffset = function (font) {
            return this.getRegisteredFontOffset(font) || {'x': 0, 'y': 0};
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
            var bounds;

            if (this.limits !== null) {
                return this.limits;
            } else if (this._bounds) {
                width = this._bounds.width;
                height = this._bounds.height;
            } else if (this.parent && (bounds = this.parent.getBounds())) {
                width = bounds.width;
                height = bounds.height;
            } else if ((bounds = this.getBounds())) {
                width = bounds.width;
                height = bounds.height;
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

		p.goBigOrGoHome = function (textstring, availableWidth, availableHeight) {
			//return this.goBigOrGoHomeLinear(textstring, availableWidth, availableHeight);
			return this.goBigOrGoHomeBinary(textstring, availableWidth, availableHeight);
		};

        /**
         * Return an array of createjs.Text elements that should be displayed below eachother.
         * @param textstring
         * @param availableWidth
         * @param availableHeight
         */
        p.goBigOrGoHomeLinear = function (textstring, availableWidth, availableHeight) {
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
                current.lineHeight = getFontLineheight(self._font, fontsize);

                updateCurrentSize(current, self._align);

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

		/**
		 * Find the largest font size that fits the available space using binary search.
		 * Reuses a single measurement text object to avoid creating one per iteration.
		 * @param textstring
		 * @param availableWidth
		 * @param availableHeight
		 */
		p.goBigOrGoHomeBinary = function (textstring, availableWidth, availableHeight) {
			var minFontSize = this.minFontSize;
			var maxFontSize = availableHeight;
			var bestFontSize = minFontSize;

			// Reuse a single text object for measurement instead of creating one per step
			var measureObj = this.createTextObject(textstring, minFontSize, this._font, this._color);
			measureObj.lineWidth = availableWidth;

			while (minFontSize <= maxFontSize) {
				var midFontSize = Math.floor((minFontSize + maxFontSize) / 2);
				measureObj.font = midFontSize + "px " + this._font;
				measureObj.lineHeight = getFontLineheight(this._font, midFontSize);
				updateCurrentSize(measureObj, this._align);

				if (currentSize.height <= availableHeight && currentSize.width <= availableWidth) {
					bestFontSize = midFontSize;
					minFontSize = midFontSize + 1;
				} else {
					maxFontSize = midFontSize - 1;
				}
			}

			// Create the final text object at the best size found
			var bestFit = this.createTextObject(textstring, bestFontSize, this._font, this._color);
			bestFit.lineWidth = availableWidth;
			bestFit.lineHeight = getFontLineheight(this._font, bestFontSize);
			updateCurrentSize(bestFit, this._align);

			this.fontsize = bestFontSize;
			return bestFit;
		};

        p.Container_draw = p.draw;

        /**
         * Determine if the dimensions or content have changed since last frame.
         * Field-by-field comparison — no string allocation per tick.
         * @returns {boolean}
         */
        p.hasChanged = function () {
            if (this.textElement && this.textElement._redrawRequested) {
                this.textElement._redrawRequested = false;
                return true;
            }

            var space = this.getAvailableSpace();
            var spaceWidth = Math.floor(space.width);
            var spaceHeight = Math.floor(space.height);

            if (
                this._lastSpaceWidth === spaceWidth &&
                this._lastSpaceHeight === spaceHeight &&
                this._lastText === this.textstring &&
                this._lastAlign === this._align &&
                this._lastFont === this._font &&
                this._lastColor === this._color
            ) {
                return false;
            }

            this._lastSpaceWidth = spaceWidth;
            this._lastSpaceHeight = spaceHeight;
            this._lastText = this.textstring;
            this._lastAlign = this._align;
            this._lastFont = this._font;
            this._lastColor = this._color;

            return true;
        };

        /**
         * Draw text (for the first time)
         */
        p.drawText = function () {
            DirtyFlag.invalidate();
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

            updateCurrentSize(text, this._align);

            currentHeight = currentSize.height;
            currentWidth = currentSize.width;

            var ink = currentInk;

            if (this._align === 'center') {
                text.textAlign = 'center';
                if (ink) {
                    text.x = ((space.width - ink.width) / 2) + ink.left;
                } else {
                    text.x = ((space.width - currentWidth) / 2) + (currentWidth / 2);
                }
            } else if (this._align === 'left') {
                text.x = ink ? ink.left : 0;
            } else if (this._align === 'right') {
                text.x = ink ? (space.width - ink.right) : (space.width - currentWidth);
            }

            if (ink) {
                // Center the visible glyph ink in the available space.
                text.y = ((space.height - ink.height) / 2) - ink.top;
            } else {
                var offset = this.getFontOffset(text.font);
                text.y = (text.lineHeight * offset.y) + ((space.height - currentHeight) / 2);
            }

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
