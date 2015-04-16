define (
	[
		'EaselJS'
	],
	function (createjs) {

		var Layer = function (options) {

            if (typeof (options) == 'undefined') {
                options = {};
            }

            if (typeof (options.container) != 'undefined') {
                this.container = options.container;
            }
            else {
                this.container = new createjs.Container ();
            }

			this.view = null;
		};

		Layer.prototype.setView = function (view) {
			if (this.view != null)
			{
				this.view.trigger ('stage:removed');
			}

			this.view = view;

			// Clear the container
			this.container.removeAllChildren ();

			// Create a container for the view
			var container = new createjs.Container ();

			// Set the view correctly
			this.view.setElement (container);

			// Add the container to the stage
			this.container.addChild (container);

			this.view.trigger ('stage:added');
		};

		Layer.prototype.render = function () {

			if (!this.view)
				return;

			// Clear the element, so that render can recreate it
			this.view.el.removeAllChildren ();

			// Before render
			this.view.trigger ('render:before');

			// Render the subview
			this.view.render ();

			// Post render
			this.view.trigger ('render');

			// Also post render
			this.view.trigger ('render:after');

		};

		Layer.prototype.tick = function (event) {
			return false;
		};

		return Layer;

	}
);