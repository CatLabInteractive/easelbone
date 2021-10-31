define(
    [
        'easeljs',
        'CatLab/Easelbone/Utilities/EmojiRegex'
    ],
    function (createjs, EmojiRegex) {

        var U200D = String.fromCharCode(0x200D);
        var UFE0Fg = /\uFE0F/g;
        var loadedImages = {};

        var emojiList = {};
        var emojiPlaceholder = ' ';

        var Text = createjs.Text;
        function EmojiText(text, font, color) {
            this.Text_constructor(text, font, color);
        }

        EmojiText.setEmojis = function(aEmojis) {
            emojiList = aEmojis;
        };

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

            var text = this._replaceEmojis(String(this.text));

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
                                this._drawLineWithEmoji(ctx, str, count*lineHeight, charCount, lineHeight);
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

                if (paint) { this._drawLineWithEmoji(ctx, str, count*lineHeight, charCount, lineHeight); }
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
         * @param lineHeight
         * @private
         */
        p._drawLineWithEmoji = function(ctx, str, y, charCount, lineHeight) {
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
                        y,
                        lineHeight
                    );
                }
            }
        }

        /**
         * @param ctx
         * @param emoji
         * @param x
         * @param y
         * @param lineHeight
         * @private
         */
        p._drawEmoji = function(ctx, emoji, x, y, lineHeight)
        {
            var imageSize = ctx.measureText(' ');
            this._getEmojiImage(emoji, imageSize.width, function(img) {

                var targetWidth = imageSize.width
                var targetHeight = imageSize.width * (img.width / img.height);

                ctx.drawImage(
                    img,
                    0, 0,
                    img.width, img.height,
                    x, y - (lineHeight - targetHeight),
                    targetWidth, targetHeight
                );

            }.bind(this));
        }

        /**
         * Split string into words
         * @param {string} str
         * @returns {Array}
         * @private
         */
        p._splitWords = function(str)
        {
            // originally the string was split on \s, but we don't want to break on non breaking spaces
            // \s is: /(\f\n\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff)/
            // we are removing no-break space u00a0
            // we are also removing \2003 (emspace) as we use that to replace the emojis)
            return str.split(/([ \f\n\r\t\v\u1680\u2000-\u2002\u2004-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff])/);
        };

        p._replaceEmojis = function(text)
        {
            this._emoji = [];

            var emojis = text.matchAll(EmojiRegex);
            var charOffset = 0;
            for (var match of emojis) {
                var emoji = match[0];
                var emojiLength = emoji.length;

                var replaced = this._replaceEmoji(emoji);

                // no replacement found / no emoji set? Ignore and fall back to the browser emoji rendering.
                if (!replaced) {
                    continue;
                }

                this._emoji[match.index - charOffset] = replaced;

                var replacement = replaced.replacement;
                text = text.slice(0, match.index - charOffset) +
                    replacement +
                    text.slice(match.index + emojiLength - charOffset);

                charOffset += emojiLength - replacement.length;
            }

            return text;
        };

        /**
         * @param emoji
         * @returns {string}
         * @private
         */
        p._replaceEmoji = function(emoji) {

            var name = getEmoticonName(emoji);
            if (typeof(emojiList[name]) === 'undefined') {
                return false;
            }

            return {
                replacement: emojiPlaceholder,
                src: emojiList[name]
            };
        };

        /**
         * @param emoji
         * @param desiredWidth
         * @param callback
         * @private
         */
        p._getEmojiImage = function(emoji, desiredWidth, callback) {

            if (typeof(loadedImages[emoji]) !== 'undefined') {
                if (loadedImages[emoji].complete && loadedImages[emoji].naturalHeight !== 0) {
                    callback(loadedImages[emoji]);
                } else {
                    loadedImages[emoji].addEventListener('load', function() {
                        this._requestRedraw();
                    }.bind(this));
                }

                return;
            }

            var img = new Image();
            loadedImages[emoji] = img;

            img.src = emoji.src;

            img.addEventListener('load', function() {
                this._requestRedraw();
            }.bind(this));

            img.addEventListener('error', function() {
                delete loadedImages[emoji];
            });
        };

        p._requestRedraw = function() {
            this._redrawRequested = true;
        };

        /**
         * @param emoticon
         * @returns {string}
         */
        function getEmoticonName(emoticon) {
            return toCodePoint(emoticon.indexOf(U200D) < 0 ?
                emoticon.replace(UFE0Fg, '') :
                emoticon
            );
        }

        /**
         * @param unicodeSurrogates
         * @param sep
         * @returns {string}
         */
        function toCodePoint(unicodeSurrogates, sep) {
            var
                r = [],
                c = 0,
                p = 0,
                i = 0;
            while (i < unicodeSurrogates.length) {
                c = unicodeSurrogates.charCodeAt(i++);
                if (p) {
                    r.push((0x10000 + ((p - 0xD800) << 10) + (c - 0xDC00)).toString(16));
                    p = 0;
                } else if (0xD800 <= c && c <= 0xDBFF) {
                    p = c;
                } else {
                    r.push(c.toString(16));
                }
            }
            return r.join(sep || '-');
        }

        return createjs.promote(EmojiText, "Text");
    }
);
