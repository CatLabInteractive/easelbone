define(
    [
        'easeljs',
        'CatLab/Easelbone/Controls/Base',
        'CatLab/Easelbone/EaselJS/DisplayObjects/BigText',
        'CatLab/Easelbone/EaselJS/DisplayObjects/TextPlaceholder',
        'CatLab/Easelbone/Utilities/DirtyFlag'
    ],
    function (createjs, Base, BigText, TextPlaceholder, DirtyFlag) {

        /**
         * A select control with a popover list. Binds to any symbol that has
         * a `value` text placeholder (the symbol's `buttons` child, if any, is
         * ignored). The popover is drawn by the control itself on the stage,
         * above every layer, so no theme symbol is needed for it.
         *
         * Input: 'a'/'start' opens or commits; 'down'/'up' move the highlight
         * while open; onBack() cancels an open list and reports the press as
         * consumed; deactivate() cancels. Mouse: click the symbol to open,
         * click a row to commit, click outside to cancel, wheel to scroll.
         *
         * The wheel is handled by a DOM listener the control owns on the
         * stage's canvas for as long as the list is open, and it only acts
         * while the pointer is over the panel. The Utilities/Mousewheel
         * singleton is deliberately NOT used: a ScrollArea host re-arms it on
         * every mouseover/mouseout, and the popover is a stage child outside
         * that subtree, so the singleton's callback would be wiped the moment
         * the cursor moved onto the list.
         *
         * Events: 'change' (committed value), 'open', 'close'.
         *
         * All style metrics (rowHeight, padding, the border and the corner
         * radius) are given in the SYMBOL's own coordinates and are scaled by
         * the ancestor transform when the popover is drawn, so the list matches
         * the symbol on every canvas size. The single exception is `width`,
         * which - when given - is an absolute stage-pixel width.
         *
         * The popover opens below the symbol, but its position is clamped to
         * the canvas so the whole visible list stays on screen (it slides up /
         * left rather than flipping).
         */
        var DEFAULTS = {
            background: '#1e1e1e',
            border: '#888888',
            highlight: '#555555',
            text: '#ffffff',
            textHighlight: '#ffffff',
            font: null,
            rowHeight: 48,
            width: null,
            maxRows: 8,
            padding: 8
        };

        var Dropdown = function (element, options) {
            Base.call(this, element);

            if (!this.element.value) {
                throw "All dropdowns should have a value text placeholder.";
            }

            this.style = {};
            var key;
            for (key in DEFAULTS) {
                if (DEFAULTS.hasOwnProperty(key)) {
                    this.style[key] = (options && typeof (options[key]) !== 'undefined') ? options[key] : DEFAULTS[key];
                }
            }

            this.allValues = [];
            this.selectedIndex = 0;
            this.selectedValue = null;
            this.textElement = new TextPlaceholder(this.element.value);

            this._open = false;
            this._highlight = 0;
            this._scrollTop = 0;
            this._panel = null;
            this._panelWidth = 0;
            this._scale = 1;
            this._rowPx = this.style.rowHeight;
            this._stage = null;
            this._onStageDown = null;
            this._onRemoved = null;
            this._removalListeners = null;
            this._wheelCanvas = null;
            this._wheelEventName = null;
            this._onWheel = null;

            this.element.addEventListener('click', function () {
                if (this._open) {
                    return;
                }
                this.open();
            }.bind(this));
        };

        Dropdown.prototype = Object.create(Base.prototype);
        Dropdown.prototype.constructor = Dropdown;

        /* ---- values (same shapes as Selectbox.setValues) ---- */

        Dropdown.prototype.setValues = function (values) {
            var tmp = [];
            if (!(values instanceof Array)) {
                for (var ind in values) {
                    if (values.hasOwnProperty(ind)) {
                        var v = values[ind];
                        if (v instanceof Object) {
                            tmp.push(v);
                        } else {
                            tmp.push({ 'text': v, 'value': ind });
                        }
                    }
                }
            } else {
                for (var i = 0; i < values.length; i++) {
                    tmp.push({ 'text': values[i], 'value': values[i] });
                }
            }
            this.allValues = tmp;
            this.select(0);
        };

        Dropdown.prototype.select = function (index) {
            if (index < 0 || index > this.allValues.length - 1) {
                return;
            }
            this.selectedIndex = index;
            this.selectedValue = this.allValues[index];
            this._highlight = index;
            this.setText(this.selectedValue.text);
        };

        Dropdown.prototype.getValue = function () {
            return this.selectedValue ? this.selectedValue.value : null;
        };

        Dropdown.prototype.setText = function (text, font, color) {
            var bigtext = new BigText(text, font || this.style.font || undefined, color || undefined);
            this.textElement.removeAllChildren();
            this.textElement.addChild(bigtext);
            DirtyFlag.invalidate();
        };

        Dropdown.prototype.getIndexFromValue = function (value) {
            for (var i = 0; i < this.allValues.length; i++) {
                if (this.allValues[i].value == value) {
                    return i;
                }
            }
            return null;
        };

        Object.defineProperty(Dropdown.prototype, 'value', {
            get: function () { return this.getValue(); },
            set: function (value) {
                var index = this.getIndexFromValue(value);
                if (index !== null) { this.select(index); }
            }
        });
        Object.defineProperty(Dropdown.prototype, 'index', {
            get: function () { return this.selectedIndex; },
            set: function (value) { this.select(value); }
        });
        Object.defineProperty(Dropdown.prototype, 'values', {
            get: function () { return this.allValues; },
            set: function (values) { this.setValues(values); }
        });

        /* ---- popover ---- */

        Dropdown.prototype.isOpen = function () {
            return this._open;
        };

        /**
         * Local (untransformed) bounds of the symbol we are attached to.
         */
        Dropdown.prototype._elementBounds = function () {
            var bounds = this.element.nominalBounds || this.element.getBounds();
            if (!bounds) {
                bounds = new createjs.Rectangle(0, 0, 200, this.style.rowHeight);
            }
            return bounds;
        };

        Dropdown.prototype.open = function () {
            if (this._open || this.allValues.length === 0) {
                return;
            }

            var stage = this.element.stage;
            if (!stage) {
                return;
            }

            this._stage = stage;
            this._open = true;
            this._highlight = this.selectedIndex;
            this._scrollTop = 0;
            this._scrollHighlightIntoView();

            this._panel = new createjs.Container();

            // The popover lives on the stage, the symbol somewhere in a scaled
            // view: localToGlobal carries the whole ancestor transform, so both
            // the anchor and the width are measured through it. (Rotated
            // ancestors are not supported; the width is taken horizontally.)
            var bounds = this._elementBounds();
            var topLeft = this.element.localToGlobal(bounds.x, bounds.y + bounds.height);
            var topRight = this.element.localToGlobal(bounds.x + bounds.width, bounds.y + bounds.height);

            // Everything the panel draws is expressed in the symbol's own
            // coordinates, so it has to be scaled by the same factor the
            // ancestors apply to the symbol.
            this._scale = bounds.width > 0 ? ((topRight.x - topLeft.x) / bounds.width) : 1;
            if (!(this._scale > 0)) {
                this._scale = 1;
            }
            this._rowPx = this.style.rowHeight * this._scale;

            this._panel.x = topLeft.x;
            this._panel.y = topLeft.y;
            this._panelWidth = this.style.width !== null ? this.style.width : (topRight.x - topLeft.x);

            // Keep the whole visible list on the canvas: a symbol near the
            // bottom (or the right edge) would otherwise open into nothing.
            var canvas = stage.canvas || null;
            if (canvas) {
                var visibleRows = this._visibleRows();
                if (canvas.height) {
                    this._panel.y = Math.min(this._panel.y, Math.max(0, canvas.height - (visibleRows * this._rowPx)));
                }
                if (canvas.width) {
                    this._panel.x = Math.min(this._panel.x, Math.max(0, canvas.width - this._panelWidth));
                }
            }

            stage.addChild(this._panel);
            this._renderPanel();

            this._onStageDown = function (evt) {
                if (this.element.stage !== this._stage) {
                    this.close(false);
                    return;
                }

                var local = this._panel.globalToLocal(evt.stageX, evt.stageY);
                var inside = local.x >= 0 && local.x <= this._panelWidth &&
                    local.y >= 0 && local.y <= this._visibleRows() * this._rowPx;

                if (!inside && !this._isOnElement(evt.stageX, evt.stageY)) {
                    this.close(false);
                }
            }.bind(this);
            stage.on('stagemousedown', this._onStageDown);

            this._listenForRemoval();
            this._listenForWheel();

            DirtyFlag.invalidate();
            this.trigger('open');
        };

        /**
         * The wheel is ours for as long as the list is open. We listen on the
         * canvas itself (never on the Mousewheel singleton, which a ScrollArea
         * host takes back on mouseout) and only act while the pointer is over
         * the panel, so the page and any scroll area keep their own wheel.
         */
        Dropdown.prototype._listenForWheel = function () {
            var canvas = this._stage ? this._stage.canvas : null;
            if (!canvas || !canvas.addEventListener) {
                return;
            }

            this._wheelCanvas = canvas;
            this._wheelEventName = (typeof canvas.onwheel !== 'undefined') ? 'wheel' : 'mousewheel';

            this._onWheel = function (evt) {
                if (!this._open || !this._panel) {
                    return;
                }

                if (!this._isOnPanel(evt.clientX, evt.clientY)) {
                    return;
                }

                var direction;
                if (typeof evt.deltaY === 'number' && evt.deltaY !== 0) {
                    direction = evt.deltaY > 0 ? 1 : -1;
                } else if (typeof evt.wheelDelta === 'number' && evt.wheelDelta !== 0) {
                    // Legacy 'mousewheel': wheelDelta is positive when scrolling up.
                    direction = evt.wheelDelta > 0 ? -1 : 1;
                } else {
                    return;
                }

                if (evt.preventDefault) {
                    evt.preventDefault();
                }

                this._scroll(direction);
            }.bind(this);

            this._wheelCanvas.addEventListener(this._wheelEventName, this._onWheel, { passive: false });
        };

        Dropdown.prototype._stopListeningForWheel = function () {
            if (this._wheelCanvas && this._onWheel) {
                this._wheelCanvas.removeEventListener(this._wheelEventName, this._onWheel);
            }

            this._wheelCanvas = null;
            this._wheelEventName = null;
            this._onWheel = null;
        };

        /**
         * Is a DOM (client) point over the open panel? The canvas may be
         * displayed at a different size than its backing store, so the client
         * point is scaled into canvas pixels first.
         */
        Dropdown.prototype._isOnPanel = function (clientX, clientY) {
            var canvas = this._wheelCanvas;
            if (!canvas || !this._panel || typeof clientX !== 'number' || typeof clientY !== 'number') {
                return false;
            }

            var rect = canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : null;
            var displayWidth = (rect && rect.width) || canvas.clientWidth || canvas.width;
            var displayHeight = (rect && rect.height) || canvas.clientHeight || canvas.height;
            if (!displayWidth || !displayHeight) {
                return false;
            }

            var canvasX = ((clientX - (rect ? rect.left : 0)) * canvas.width) / displayWidth;
            var canvasY = ((clientY - (rect ? rect.top : 0)) * canvas.height) / displayHeight;

            var local = this._panel.globalToLocal(canvasX, canvasY);

            return local.x >= 0 && local.x <= this._panelWidth &&
                local.y >= 0 && local.y <= this._visibleRows() * this._rowPx;
        };

        /**
         * The panel and the stagemousedown handler live on the stage, not in
         * the view, so a screen change would orphan both. EaselJS dispatches
         * 'removed' only on the object that is actually removed and never on
         * its descendants, so the whole chain between the symbol and the stage
         * is watched: whichever link leaves the display list closes the list.
         */
        Dropdown.prototype._listenForRemoval = function () {
            this._onRemoved = function () {
                this.close(false);
            }.bind(this);

            this._removalListeners = [];

            var node = this.element;
            while (node && node !== this._stage) {
                node.on('removed', this._onRemoved);
                this._removalListeners.push(node);
                node = node.parent;
            }
        };

        Dropdown.prototype._stopListeningForRemoval = function () {
            if (!this._removalListeners) {
                return;
            }

            for (var i = 0; i < this._removalListeners.length; i++) {
                this._removalListeners[i].off('removed', this._onRemoved);
            }

            this._removalListeners = null;
            this._onRemoved = null;
        };

        /**
         * Is the given stage point on the symbol itself? (Clicking it keeps the
         * list open; the symbol's own click handler is what opened it.)
         */
        Dropdown.prototype._isOnElement = function (stageX, stageY) {
            var bounds = this._elementBounds();
            var local = this.element.globalToLocal(stageX, stageY);

            return local.x >= bounds.x && local.x <= bounds.x + bounds.width &&
                local.y >= bounds.y && local.y <= bounds.y + bounds.height;
        };

        Dropdown.prototype._visibleRows = function () {
            return Math.min(this.style.maxRows, this.allValues.length);
        };

        Dropdown.prototype._renderPanel = function () {
            if (this.element.stage !== this._stage) {
                this.close(false);
                return;
            }

            var panel = this._panel;
            var s = this.style;
            var scale = this._scale;
            var rows = this._visibleRows();
            var rowHeight = this._rowPx;
            var padding = s.padding * scale;
            var border = 2 * scale;
            var radius = 8 * scale;
            var w = this._panelWidth;
            var h = rows * rowHeight;
            panel.removeAllChildren();

            var bg = new createjs.Shape();
            bg.graphics.setStrokeStyle(border).beginStroke(s.border).beginFill(s.background).drawRoundRect(0, 0, w, h, radius);
            panel.addChild(bg);

            for (var r = 0; r < rows; r++) {
                var i = this._scrollTop + r;
                if (i >= this.allValues.length) {
                    break;
                }

                var row = new createjs.Container();
                row.y = r * rowHeight;

                var rowBg = new createjs.Shape();
                rowBg.graphics.beginFill(i === this._highlight ? s.highlight : s.background).drawRect(border, border / 2, w - (2 * border), rowHeight - border);
                row.addChild(rowBg);

                var text = new BigText(this.allValues[i].text, s.font || undefined, i === this._highlight ? s.textHighlight : s.text, 'left');
                text.setLimits(w - (2 * padding), rowHeight - (2 * padding));
                text.x = padding;
                text.y = padding;
                row.addChild(text);

                row.on('click', (function (index) {
                    return function (evt) {
                        evt.stopPropagation();
                        this._highlight = index;
                        this.close(true);
                    }.bind(this);
                }.bind(this))(i));

                panel.addChild(row);
            }

            DirtyFlag.invalidate();
        };

        /**
         * Scroll the list just enough to show the highlighted row.
         */
        Dropdown.prototype._scrollHighlightIntoView = function () {
            var rows = this._visibleRows();

            if (this._highlight < this._scrollTop) {
                this._scrollTop = this._highlight;
            } else if (this._highlight >= this._scrollTop + rows) {
                this._scrollTop = this._highlight - rows + 1;
            }

            this._scrollTop = Math.max(0, Math.min(this._scrollTop, Math.max(0, this.allValues.length - rows)));
        };

        Dropdown.prototype._moveHighlight = function (delta) {
            var next = Math.max(0, Math.min(this.allValues.length - 1, this._highlight + delta));
            if (next === this._highlight) {
                return;
            }

            this._highlight = next;
            this._scrollHighlightIntoView();
            this._renderPanel();
        };

        Dropdown.prototype._scroll = function (delta) {
            var max = Math.max(0, this.allValues.length - this._visibleRows());
            var next = Math.max(0, Math.min(max, this._scrollTop + delta));
            if (next === this._scrollTop) {
                return;
            }

            this._scrollTop = next;
            this._renderPanel();
        };

        Dropdown.prototype.close = function (commit) {
            if (!this._open) {
                return;
            }

            this._open = false;
            this._stopListeningForRemoval();
            this._stopListeningForWheel();

            if (this._stage) {
                this._stage.off('stagemousedown', this._onStageDown);
                if (this._panel) {
                    this._stage.removeChild(this._panel);
                }
            }

            this._panel = null;
            this._onStageDown = null;
            this._stage = null;
            DirtyFlag.invalidate();

            if (commit && this._highlight !== this.selectedIndex) {
                this.select(this._highlight);
                this.trigger('change', this.getValue());
            } else {
                this._highlight = this.selectedIndex;
            }

            this.trigger('close');
        };

        /* ---- input ---- */

        Dropdown.prototype.keyInput = function (input) {
            switch (input) {
                case 'a':
                case 'start':
                    if (this._open) {
                        this.close(true);
                    } else {
                        this.open();
                    }
                    break;

                case 'down':
                    if (this._open) {
                        this._moveHighlight(1);
                    }
                    break;

                case 'up':
                    if (this._open) {
                        this._moveHighlight(-1);
                    }
                    break;

                case 'back':
                case 'b':
                    this.onBack();
                    break;
            }
        };

        /**
         * Navigatable.triggerBack asks the active control first; an open list
         * swallows the press (returns true) and closes without committing.
         */
        Dropdown.prototype.onBack = function () {
            if (this._open) {
                this.close(false);
                return true;
            }
            return false;
        };

        Dropdown.prototype.deactivate = function (animate) {
            if (this._open) {
                this.close(false);
            }
            Base.prototype.deactivate.call(this, animate);
        };

        return Dropdown;

    }
);
