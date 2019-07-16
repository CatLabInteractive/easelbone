define([
        'easeljs'
    ], function (createjs) {


        function ColorSwapFilter(color, replaceColor) {
            this.Filter_constructor();

            p.color = color;
            p.replaceColor = replaceColor;
        }

        var p = createjs.extend(ColorSwapFilter, createjs.Filter);

        function hexToRgb(hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }

        p._applyFilter = function (imageData) {

            // Local references for speed.
            var pixels = imageData.data,
                sourceColor = this.color
            ;

            var colors = [];
            var targetColors = [];

            for (var i = 0; i < sourceColor.length; i++) {
                colors.push(hexToRgb(sourceColor[i]));
            }

            for (i = 0; i < this.replaceColor.length; i++) {
                targetColors.push(hexToRgb(this.replaceColor[i]));
            }

            function isColor(r, g, b) {
                for (j = 0; j < colors.length; j++) {
                    if (colors[j].r == r && colors[j].g == g && colors[j].b == b) {
                        return targetColors[j];
                    }
                }
            }

            var replace = null;
            for (i = 0, l = pixels.length; i < l; i += 4) {

                replace = isColor(pixels[i], pixels[i + 1], pixels[i + 2]);
                if (replace) {
                    pixels[i] = replace.r;
                    pixels[i + 1] = replace.g;
                    pixels[i + 2] = replace.b;
                }
            }
            return true;
        };

        /** docced in super class **/
        p.clone = function () {
            return new ColorSwapFilter(this.color, this.replaceColor);
        };

        /** docced in super class **/
        p.toString = function () {
            return "[ColorSwapFilter]";
        };

        createjs.ColorSwapFilter = createjs.promote(ColorSwapFilter, "Filter");
        return createjs.ColorSwapFilter;

    }
);