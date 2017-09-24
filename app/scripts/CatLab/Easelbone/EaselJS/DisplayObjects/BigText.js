define (
    [
        'EaselJS',
        'CatLab/Easelbone/Utilities/GlobalProperties'
    ],
    function (createjs, GlobalProperties)
    {
        var width;
        var height;
        var debug = false;
        var hash;
        var hasChanged = false;

        var currentHeight;
        var currentWidth;

        var currentBounds;
        var currentSize = {
            'width' : 0,
            'height' : 0
        };

        var fontLineheightCache = {};

        var fontOffsets = {};

        var fontSize;

        var BigText = function (aTextstring, aFont, aColor, align)
        {
            this.textstring = aTextstring;
            this.font = GlobalProperties.ifUndefined (aFont, GlobalProperties.getDefaultFont ());
            this.color = GlobalProperties.ifUndefined (aColor, GlobalProperties.getDefaultTextColor ());
            this.align = typeof (align) == 'undefined' ? 'center' : align;

            this.initialize ();
            this.initialized = false;
            this.limits = null;

            this.debug = debug;
        };

        BigText.setFontOffset = function(font, x, y)
        {
            fontOffsets[font] = {
                'x' : x,
                'y' : y
            };
        };

        function updateCurrentSize(text)
        {
            currentBounds = text.getMetrics();

            currentSize.height = currentBounds.height;
            currentSize.width = currentBounds.width;
        }

        function measureLineHeight(text)
        {
            return Math.max(
                measureLetter(text, "M").width,
                measureLetter(text, "m").width
            ) * 1.2;
        }

        function measureLetter(text, letter)
        {
            var ctx = createjs.Text._workingContext;
            ctx.save();
            var size = text._prepContext(ctx).measureText(letter);
            ctx.restore();
            return size;
        }

        function getFontLineheight(text)
        {
            if (typeof(fontLineheightCache[text.font]) == 'undefined') {
                fontLineheightCache[text.font] = measureLineHeight(text);
            }

            return fontLineheightCache[text.font];
        }

        var p = BigText.prototype = new createjs.Container ();

        p.Container_initialize = p.initialize;

        p.getFontOffset = function(font)
        {
            var fontName = font.split(' ');
            fontName.shift();
            fontName = fontName.join(' ');

            if (typeof(fontOffsets[fontName]) == 'undefined') {
                return { 'x' : 0, 'y' : 0 };
            } else {
                return fontOffsets[fontName];
            }
        };

        p.initialize = function() {
            this.Container_initialize ();
        };

        p.isVisible = function ()
        {
            return true;
        };

        p.setText = function (text)
        {
            this.initialized = false;
            this.textstring = text;

            if (this.textElement) {
                this.textElement.text = text;
            }
        };

        p.setLimits = function (width, height)
        {
            this.limits = { 'width' : width, 'height' : height };
        };

        p.getAvailableSpace = function ()
        {
            if (this.limits !== null) {
                return this.limits;
            } else if (this.getBounds ()) {
                width = this.getBounds ().width;
                height = this.getBounds ().height;
            } else if (this.parent && this.parent.getBounds ()) {
                width = this.parent.getBounds ().width;
                height = this.parent.getBounds ().height
            } else {
                width = 0;
                height = 0;
            }

            return { 'width' : width, 'height' : height };
        };

        /**
         * Return an array of createjs.Text elements that should be displayed below eachother.
         * @param textstring
         * @param availableWidth
         * @param availableHeight
         */
        p.goBigOrGoHome = function (textstring, availableWidth, availableHeight)
        {
            var self = this;

            var fontsize = 5;
            var stable = new createjs.Text(
                "" + String(textstring),
                fontsize + "px " + this.font,
                this.color
            );

            if (!stable.getBounds()) {
                return stable;
            }

            var maxSteps = 500;

            function bigger ()
            {
                maxSteps --;

                if (maxSteps < 0) {
                    return false;
                }

                var text = new createjs.Text (textstring, fontsize + "px " + self.font, self.color);
                text.lineWidth = availableWidth;
                text.lineHeight = getFontLineheight(text);

                updateCurrentSize(text);

                if (
                    currentSize.height < availableHeight &&
                    currentSize.width <= availableWidth
                ) {
                    stable = text;
                    fontsize ++;
                    return true;
                }
                return false;
            }

            while (bigger ()) {}

            return stable;
        };

        p.Container_draw = p.draw;

        p.getLocationHash = function ()
        {
            hash = this.getAvailableSpace();
            return hash.width + ':' + hash.height;
        };

        /**
         * Determine if the dimensions have changed since last frame.
         * @returns {boolean}
         */
        p.hasChanged = function ()
        {
            hash = this.getLocationHash ();
            hasChanged = this.lastHash != hash;
            this.lastHash = hash;

            return hasChanged;
        };

        p.draw = function (ctx, ignoreCache)
        {
            if (this.initialized && !this.hasChanged ()) {
                return this.Container_draw (ctx, ignoreCache);
            }

            this.initialized = true;

            this.removeAllChildren ();

            var space = this.getAvailableSpace ();
            if (space.width === 0 || space.height === 0) {
                return;
            }
            //console.log (space);

            // Draw container size
            if (this.debug) {
                var border = new createjs.Shape();
                border.graphics.beginStroke("#FFA500");
                border.graphics.setStrokeStyle(1);
                border.snapToPixel = true;
                border.graphics.drawRect(0, 0, space.width, space.height);
                this.addChild (border);
            }

            var text = this.goBigOrGoHome (this.textstring, space.width, space.height);
            this.textElement = text;

            //console.log (text);

            text.textBaseline = 'top';
            text.textAlign = 'center';

            updateCurrentSize(text);

            currentHeight = currentSize.height;
            currentWidth = currentSize.width;

            if (this.align == 'center') {
                text.x = ((space.width - currentWidth) / 2) + (currentWidth / 2);
            }
            else if (this.align == 'left') {
                text.x = currentWidth / 2;
            }
            else if (this.align == 'right') {
                //text.x = ((space.width - text.getBounds ().width)) + text.getBounds ().width;
                text.x = space.width - currentWidth;
            }

            currentBounds = text.getMetrics();

            var offset = this.getFontOffset(text.font);
            text.y = (text.lineHeight * offset.y) + ((space.height - currentHeight) / 2);

            this.addChild (text);
            return this.Container_draw (ctx, ignoreCache);
        };

        createjs.BigText = BigText;
        return BigText;
    }
);