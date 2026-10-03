define (
	[
		'underscore',
	    'backbone',
		'easeljs',

		'CatLab/Easelbone/Controls/ScrollBar',
		'CatLab/Easelbone/EaselJS/DisplayObjects/ScrollArea',

		'CatLab/Easelbone/Utilities/Mousewheel'
	],
	function (_, Backbone, createjs, ScrollBar, ScrollAreaDisplayObject, Mousewheel) {

		/**
		 * How far (in the scroll area's own units) a press has to travel
		 * before it is a drag and not a tap: a finger always wobbles a
		 * little between press and release, and that must still click the
		 * row under it.
		 */
		var DRAG_THRESHOLD = 8;

		var ScrollArea = function (element) {

            _.extend(this, Backbone.Events);

			this.element = element;
			this.element._scrollArea = this;

			this.scrollbar = new ScrollBar (element.scrollbar);
			this.scrollbar.link (this);

			this.content = new ScrollAreaDisplayObject (element.content);
			this.content.on ('scroll', this.onScroll, this);

			// If mouseover events are available, listen to those
			this.element.on ('mouseover', this.enableScrollMouse, this);
			this.element.on ('mouseout', this.disableScrollMouse, this);
			this.element.on ('removed', this.disableScrollMouse, this);

			this.initializeDrag ();

			//this.scrollTo (0);
			this.element.on ('added', this.onAdd, this);
		};

		var p = ScrollArea.prototype;

		p.enableScrollMouse = function () {
			var self = this;
			Mousewheel.listen (function (iv) {
				self.scroll (iv.y > 0 ? 50 : - 50);
			});
		};

		p.onAdd = function (element) {
			this.scrollTo (0);
		};

		p.disableScrollMouse = function () {
			Mousewheel.stop ();
		};

		/**
		 * Drag scrolling: press anywhere in the content window and move. A
		 * touch screen has no wheel, no hover and (with a scrollbar thumb
		 * the size of a fingertip) no usable thumb, so this is how a phone
		 * scrolls a list; a mouse gets it too.
		 *
		 * The content window is the Placeholder the content sits in
		 * (`this.content.parent`): it is masked to the window's bounds and
		 * does not move with the scroll, so a press on it means "in the
		 * window". A transparent shape behind the content gives the gaps
		 * between rows a hit too; the scrollbar is a sibling and keeps its
		 * own thumb drag.
		 */
		p.initializeDrag = function () {
			var surface = this.content.parent;

			this._drag = null;

			// Invisible but hit-testable: a hitArea is drawn opaquely by the
			// hit test whatever the shape itself draws (nothing).
			this.dragSurface = new createjs.Shape ();
			this.dragSurface.hitArea = new createjs.Shape ();
			surface.addChildAt (this.dragSurface, 0);

			surface.on ('bounds:change', this.resizeDragSurface, this);
			this.resizeDragSurface ();

			surface.on ('mousedown', this.onDragStart, this);
			surface.on ('pressmove', this.onDragMove, this);
			surface.on ('pressup', this.onDragEnd, this);
		};

		p.resizeDragSurface = function () {
			var bounds = this.content.parent.getBounds ();
			var graphics = this.dragSurface.hitArea.graphics;

			graphics.clear ();
			if (bounds) {
				graphics.beginFill ('#000').drawRect (0, 0, bounds.width, bounds.height);
			}
		};

		p.onDragStart = function (evt) {
			if (!this.content.isActive ()) {
				this._drag = null;
				return;
			}

			this._drag = {
				startY: this.content.parent.globalToLocal (evt.stageX, evt.stageY).y,
				startScroll: this.content.getScroll (),
				moved: false
			};
		};

		p.onDragMove = function (evt) {
			var drag = this._drag;
			if (!drag) {
				return;
			}

			var dy = this.content.parent.globalToLocal (evt.stageX, evt.stageY).y - drag.startY;

			if (!drag.moved) {
				if (Math.abs (dy) < DRAG_THRESHOLD) {
					return;
				}
				drag.moved = true;

				// A drag must not end in a click on whatever row ends up under
				// the finger: EaselJS clicks the object it finds under the
				// pointer at release when it is the one pressed, so hide the
				// content from that hit test until the release is handled.
				// pressmove still arrives here: it goes to the pressed object
				// and bubbles, no hit test involved.
				this.content.mouseEnabled = false;
			}

			this.content.setScroll (drag.startScroll - dy);
		};

		p.onDragEnd = function () {
			var drag = this._drag;
			this._drag = null;

			if (drag && drag.moved) {
				// After the click EaselJS dispatches for this release, if any.
				var content = this.content;
				setTimeout (function () {
					content.mouseEnabled = true;
				}, 0);
			}
		};

		p.onScroll = function (evt) {

			var perc = {
				'percentage' : this.content.getPercentage (),
				'contentHeight' : this.content.getBounds ().height,
				'containerHeight' : this.content.parent.getBounds ().height
			};

			this.trigger ('scroll', perc);
		};

		p.scrollTo = function (percentage) {
			this.content.scrollTo (percentage);
		};

		p.scroll = function (pixels) {
			this.content.up (pixels);
		};

		p.up = function () {
			this.content.up (25);
		};

		p.down = function () {
			this.content.down (25);
		};

		p.focus = function (element, delay, ease) {
			return this.content.focus (element, delay, ease);
		};

		return ScrollArea;

	}
);
