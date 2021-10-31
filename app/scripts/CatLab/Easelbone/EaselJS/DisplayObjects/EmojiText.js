define(
    [
        'easeljs'
    ],
    function (createjs) {

        var U200D = String.fromCharCode(0x200D);
        var UFE0Fg = /\uFE0F/g;

        var Text = createjs.Text;
        function EmojiText(text, font, color) {
            this.Text_constructor(text, font, color);
        }

        var cTextAlign;

        var p = createjs.extend(EmojiText, Text);

        /**
         * Draws multiline text.
         * @method _drawText
         * @param {CanvasRenderingContext2D} ctx
         * @param {Object} o
         * @param {Array} lines
         * @return {Object}
         * @protected
         **/
        p._drawText = function(ctx, o, lines) {

            var paint = !!ctx;
            if (!paint) {
                ctx = Text._workingContext;
                ctx.save();
                this._prepContext(ctx);
            }
            var lineHeight = this.lineHeight||this.getMeasuredLineHeight();

            var text = this._replaceEmoji(String(this.text));

            var maxW = 0, count = 0;
            var hardLines = text.split(/(?:\r\n|\r|\n)/);
            var charCount = 0;

            for (var i=0, l=hardLines.length; i<l; i++) {
                var str = hardLines[i];
                var w = null;

                if (this.lineWidth != null && (w = ctx.measureText(str).width) > this.lineWidth) {
                    // text wrapping:
                    var words = this._splitWords(str);
                    str = words[0];
                    w = ctx.measureText(str).width;

                    for (var j=1, jl=words.length; j<jl; j+=2) {
                        // Line needs to wrap:
                        var wordW = ctx.measureText(words[j] + words[j+1]).width;
                        if (w + wordW > this.lineWidth) {
                            if (paint) {
                                this._drawLineWithEmoji(ctx, str, count*lineHeight, charCount);
                                charCount += str.length + 1;
                            }
                            if (lines) { lines.push(str); }
                            if (w > maxW) { maxW = w; }
                            str = words[j+1];
                            w = ctx.measureText(str).width;
                            count++;
                        } else {
                            str += words[j] + words[j+1];
                            w += wordW;
                        }
                    }
                }

                if (paint) { this._drawLineWithEmoji(ctx, str, count*lineHeight, charCount); }
                if (lines) { lines.push(str); }
                if (o && w == null) { w = ctx.measureText(str).width; }
                if (w > maxW) { maxW = w; }
                count++;
            }

            if (o) {
                o.width = maxW;
                o.height = count*lineHeight;
            }
            if (!paint) { ctx.restore(); }
            return o;
        };

        /**
         * @param ctx
         * @param str
         * @param y
         * @param charCount
         * @private
         */
        p._drawLineWithEmoji = function(ctx, str, y, charCount) {
            // check if we need to draw any emoji
            this._drawTextLine(ctx, str, y);

            for (var index in this._emoji) {
                index = parseInt(index);
                if (
                    this._emoji.hasOwnProperty(index) &&
                    index >= charCount &&
                    index < (charCount + str.length)
                ) {
                    this._drawEmoji(
                        ctx,
                        this._emoji[index],
                        ctx.measureText(str).width * Text.H_OFFSETS[this.textAlign||"left"]
                            + ctx.measureText(str.substring(0, index - charCount)).width,
                        y
                    );
                }
            }
        }

        /**
         * @param ctx
         * @param emoji
         * @param x
         * @param y
         * @private
         */
        p._drawEmoji = function(ctx, emoji, x, y)
        {


            /*

            var imageSize = ctx.measureText(' ');

            var image = new createjs.Bitmap(emoji);
            image.x = x;
            image.y = y;
            this.parent.addChild(image);

             */

            cTextAlign = ctx.textAlign;
            ctx.textAlign = 'start';
            if (this.outline) {
                ctx.strokeText(emoji.raw, x, y, this.maxWidth||0xFFFF);
            } else {
                ctx.fillText(emoji.raw, x, y, this.maxWidth||0xFFFF);
            }
            ctx.textAlign = cTextAlign;
        }

        /**
         * Split string into words
         * @param {string} str
         * @returns {Array}
         * @private
         */
        p._splitWords = function(str) {
            // originally the string was split on \s, but we don't want to break on non breaking spaces
            // \s is: /(\f\n\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff)/
            // we are removing no-break space u00a0
            return str.split(/([ \f\n\r\t\v\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff])/);
        };

        p._replaceEmoji = function(text) {
            this._emoji = [];

            return twemoji.replace(text, function(emoji, unknown, index, str) {
                var iconId = twemoji.convert.toCodePoint(emoji.indexOf(U200D) < 0 ? emoji.replace(UFE0Fg, '') : emoji);
                var iconSrc = this._getEmojiSource(iconId);

                this._emoji[index] = { raw: emoji, src: iconSrc };
                return ' ';
            }.bind(this));
        };

        p._getEmojiSource = function(icon) {
            return 'https://twemoji.maxcdn.com/v/13.1.0/72x72/' + icon + '.png';
        }

        return createjs.promote(EmojiText, "Text");
    }
);
