define (
	[
		'EaselJS'
	],
	function (createjs)
	{
		var Placeholder = function (element) {

			if (typeof (element) != 'undefined') {

				this.initialize ();
				this.initializePlaceholder (element);
			}

		};

		var p = Placeholder.prototype = new createjs.Container ();

		p.initializePlaceholder = function (element) {

			var innerPlaceholder = this;
			var boundHash = '0:0';
			var oldBoundHash = '0:0';
			var event;

			element.original_draw = element.draw;

			// Override the draw method of the original placeholder.
			element.draw = function (ctx, ignoreCache) {

				this.updateBounds ();
				return element.original_draw (ctx, ignoreCache);
			};

			this.getBoundsHash = function () {

				if (this.getBounds ()) {
					boundHash = this.getBounds ().width + ':' + this.getBounds ().height;
					return boundHash;
				}
				return null;
			};

			this.hasBoundsChanged = function () {

				if (this.getBoundsHash () != oldBoundHash) {
					oldBoundHash = boundHash;
					return true;
				}
			};

			element.updateBounds = function () {

				// Set the bounds on this local container
				innerPlaceholder.setBounds (
					0, 0,
					Math.ceil (this.scaleX * 100),
					Math.ceil (this.scaleY * 100)
				);

				if (innerPlaceholder.hasBoundsChanged ()) {

					innerPlaceholder.x = this.x;
					innerPlaceholder.y = this.y;
					innerPlaceholder.rotation = this.rotation;

					if (this.mask) {
						innerPlaceholder.mask = this.mask;
					}

					else if (this.originalMask) {
						innerPlaceholder.mask = this.originalMask;
					}

					this.mask = false;

					event = new createjs.Event ('bounds:change');
					innerPlaceholder.dispatchEvent (event);
				}
			};

			// Remove everything
			//element.removeAllChildren ();
			for (var i = 0; i < element.children.length; i ++) {
				element.children[i].visible = false;
			}

			//element.visible = false;

			// And add ourselves
			if (element.parent != null) {
				var index = element.parent.getChildIndex (element);

				element.parent.addChildAt (innerPlaceholder, index + 1);
				innerPlaceholder.dispatchEvent ('initialized');
			}
			else {
				element.addEventListener ('added', function () {

					var index = element.parent.getChildIndex (element);
					element.parent.addChildAt (innerPlaceholder, index + 1);
					innerPlaceholder.dispatchEvent ('initialized');
				});
			}

			/*
			// And add ourselves
			if (element.parent != null) {
				element.parent.addChild (innerPlaceholder);
				innerPlaceholder.dispatchEvent ('initialized');
			}
			else {
				element.addEventListener ('added', function () {
					element.parent.addChild (innerPlaceholder);
					innerPlaceholder.dispatchEvent ('initialized');
				});
			}
			*/
		};


		return Placeholder;
	}
);