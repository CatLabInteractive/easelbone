define(
	[
		'easeljs',
		'CatLab/Easelbone/Utilities/DirtyFlag'
	],
	function (createjs, DirtyFlag) {

		var U200D = String.fromCharCode(0x200D);
		var UFE0Fg = /\uFE0F/g;
		var loadedImages = {};

		var emojiList = {};
		var emojiPlaceholder = '  ';

		var emojiListVersion = 0;
		var sortedGlobalKeys = null;

		function byLengthDesc(a, b) {
			return b.length - a.length;
		}

		function getGlobalSortedKeys() {
			if (sortedGlobalKeys === null) {
				sortedGlobalKeys = Object.keys(emojiList).sort(byLengthDesc);
			}
			return sortedGlobalKeys;
		}

		var Text = createjs.Text;

		function EmojiText(text, font, color) {
			this.Text_constructor(text, font, color);

			this._additionalEmojis = {};
			this._lastReplacedText = null;
			this._lastReplacedResult = null;

			this._sortedKeys = null;
			this._sortedKeysVersion = -1;

			this.snapToPixel = true;
		}

		EmojiText.setEmojis = function (aEmojis) {
			emojiList = aEmojis;
			emojiListVersion++;
			sortedGlobalKeys = null;
		};

		var p = createjs.extend(EmojiText, Text);

		p.setEmojis = function (aEmojis) {
			this._additionalEmojis = aEmojis;
			this._sortedKeys = null;
			this._lastReplacedText = null;
		};

		/**
		 * Sorted (longest first) list of all emoji keys applicable to this
		 * instance. Cached; rebuilt only when the emoji lists change.
		 * @returns {Array}
		 * @private
		 */
		p._getSortedEmojiKeys = function () {
			var hasAdditional = false;
			for (var k in this._additionalEmojis) {
				if (this._additionalEmojis.hasOwnProperty(k)) {
					hasAdditional = true;
					break;
				}
			}

			if (!hasAdditional) {
				return getGlobalSortedKeys();
			}

			if (this._sortedKeys !== null && this._sortedKeysVersion === emojiListVersion) {
				return this._sortedKeys;
			}

			var merged = Object.assign({}, emojiList, this._additionalEmojis);
			this._sortedKeys = Object.keys(merged).sort(byLengthDesc);
			this._sortedKeysVersion = emojiListVersion;
			return this._sortedKeys;
		};

		/**
		 * Draws multiline text.
		 * @method _drawText
		 * @param {CanvasRenderingContext2D} ctx
		 * @param {Object} o
		 * @param {Array} lines
		 * @return {Object}
		 * @protected
		 */
		p._drawText = function (ctx, o, lines) {
			var paint = !!ctx;
			if (!paint) {
				ctx = Text._workingContext;
				ctx.save();
				this._prepContext(ctx);
			}

			var lineHeight = this.lineHeight || this.getMeasuredLineHeight();
			var text = this._replaceEmojis(String(this.text));
			var maxW = 0, count = 0;
			var hardLines = text.split(/(?:\r\n|\r|\n)/);
			var charCount = 0;
			var hasWrap = this.lineWidth != null;
			var wrapLimit = this.lineWidth;

			for (var i = 0, l = hardLines.length; i < l; i++) {
				var str = hardLines[i];
				var w = null;

				if (hasWrap) {
					w = ctx.measureText(str).width;
					if (w > wrapLimit) {
						var words = this._splitWords(str);
						var wordWidths = new Array(words.length);
						for (var wi = 0; wi < words.length; wi++) {
							wordWidths[wi] = ctx.measureText(words[wi]).width;
						}
						str = words[0];
						w = wordWidths[0];

						for (var j = 1, jl = words.length; j < jl; j += 2) {
							var wordW = (wordWidths[j] || 0) + (wordWidths[j + 1] || 0);
							if (w + wordW > wrapLimit) {
								if (paint) {
									this._drawLineWithEmoji(ctx, str, count * lineHeight, charCount, lineHeight);
									charCount += str.length + 1;
								}
								if (lines) lines.push(str);
								if (w > maxW) maxW = w;
								str = words[j + 1] || "";
								w = wordWidths[j + 1] || 0;
								count++;
							} else {
								str += words[j] + (words[j + 1] || "");
								w += wordW;
							}
						}
					}
				}

				var lineW;
				if (paint) {
					lineW = this._drawLineWithEmoji(ctx, str, count * lineHeight, charCount, lineHeight);
					charCount += str.length + 1;
				} else {
					// When not painting, reuse computed width if available, else measure once.
					lineW = (w == null) ? ctx.measureText(str).width : w;
				}

				if (lines) lines.push(str);
				if (lineW > maxW) maxW = lineW;
				count++;
			}

			if (o) {
				o.width = maxW;
				o.height = count * lineHeight;
			}
			if (!paint) ctx.restore();
			return o;
		};

		// Returns measured line width to avoid re-measuring in caller.
		p._drawLineWithEmoji = function (ctx, str, y, charCount, lineHeight) {
			// Draw base text
			this._drawTextLine(ctx, str, y);

			if (this._emoji.length === 0) {
				// Still compute width once for alignment/maxW reuse by caller.
				return ctx.measureText(str).width;
			}

			var strW = ctx.measureText(str).width;
			var alignOffset = Text.H_OFFSETS[this.textAlign || "left"];

			for (var e = 0; e < this._emoji.length; e++) {
				var entry = this._emoji[e];
				if (
					entry.index >= charCount &&
					entry.index < (charCount + str.length)
				) {
					this._drawEmoji(
						ctx,
						entry.data,
						strW * alignOffset + ctx.measureText(str.substring(0, entry.index - charCount)).width,
						y,
						lineHeight
					);
				}
			}

			return strW;
		};

		// JavaScript
		p._drawEmoji = function (ctx, emoji, x, y, lineHeight) {
			// Cache spacer size
			var spacerSize = ctx._emojiSpacerSize || ctx.measureText(emojiPlaceholder);
			ctx._emojiSpacerSize = spacerSize;

			if (emoji.src) {
				// Cache image size
				var imageSize = ctx._emojiImageSize || ctx.measureText('😀');
				ctx._emojiImageSize = imageSize;

				this._getEmojiImage(emoji, imageSize.width, function (img) {
					var targetWidth = imageSize.width;
					var targetHeight = imageSize.width * (img.width / img.height);

					ctx.drawImage(
						img,
						0, 0,
						img.width, img.height,
						x + ((spacerSize.width - imageSize.width) / 2),
						y - (targetHeight - lineHeight),
						targetWidth, targetHeight
					);
				}.bind(this));
			}
		}

		/**
		 * Split string into words
		 * @param {string} str
		 * @returns {Array}
		 * @private
		 */
		p._splitWords = function (str) {
			// originally the string was split on \s, but we don't want to break on non breaking spaces
			// \s is: /(\f\n\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff)/
			// we are removing no-break space u00a0
			// we are also removing \2003 (emspace) as we use that to replace the emojis)
			return str.split(/([ \f\n\r\t\v\u1680\u2000-\u2002\u2004-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff])/);
		};

		// JavaScript
		p._replaceEmojis = function (text) {
			if (this._lastReplacedText === text) {
				return this._lastReplacedResult;
			}

			this._lastReplacedText = text;
			this._emoji = [];

			var emojiKeys = this._getSortedEmojiKeys();

			var replacedText = '';
			var outputIndex = 0;
			var i = 0;

			while (i < text.length) {
				let matched = false;

				for (let k = 0; k < emojiKeys.length; k++) {
					let emoji = emojiKeys[k];
					if (text.substr(i, emoji.length) === emoji) {
						let replaced = this._replaceEmoji(emoji);
						if (replaced) {
							this._emoji.push({ index: outputIndex, data: replaced });
							replacedText += replaced.replacement;
							outputIndex += replaced.replacement.length;
							i += emoji.length;
							matched = true;
							break;
						}
					}
				}

				if (!matched) {
					replacedText += text[i];
					outputIndex++;
					i++;
				}
			}

			this._lastReplacedResult = replacedText;
			return replacedText;
		};

		/**
		 * @param emoji
		 * @returns {string}|false
		 * @private
		 */
		p._replaceEmoji = function (emoji) {

			var name = emoji;
			if (
				typeof (emojiList[name]) === 'undefined' &&
				typeof (this._additionalEmojis[name]) === 'undefined'
			) {
				return false;
			} else if (emojiList[name]) {
				return {
					replacement: emojiPlaceholder,
					src: emojiList[name]
				};
			} else if (this._additionalEmojis[name]) {
				return {
					replacement: emojiPlaceholder,
					src: this._additionalEmojis[name]
				};
			}

			throw "Emoji not found: " + name;
		};

		/**
		 * @param emoji
		 * @param desiredWidth
		 * @param callback
		 * @private
		 */
		p._getEmojiImage = function (emoji, desiredWidth, callback) {

			if (typeof (loadedImages[emoji.src]) !== 'undefined') {
				if (loadedImages[emoji.src].complete && loadedImages[emoji.src].naturalHeight !== 0) {
					callback(loadedImages[emoji.src]);
				} else {
					loadedImages[emoji.src].addEventListener('load', function () {
						this._requestRedraw();
					}.bind(this));
				}

				return;
			}

			var img = new Image();
			img.crossOrigin = 'anonymous';
			loadedImages[emoji.src] = img;

			img.src = emoji.src;

			img.addEventListener('load', function () {
				this._requestRedraw();
			}.bind(this));

			img.addEventListener('error', function () {
				delete loadedImages[emoji.src];
			});
		};

		p._requestRedraw = function () {
			this._redrawRequested = true;
			DirtyFlag.invalidate();
		};

		return createjs.promote(EmojiText, "Text");
	}
);
