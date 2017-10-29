define(
    [
        'EaselJS',
        'underscore',
        'backbone'
    ],
    function (createjs, _, Backbone) {

        var Layer = function (options) {

            _.extend(this, Backbone.Events);

            if (typeof (options) === 'undefined') {
                options = {};
            }

            if (typeof (options.container) !== 'undefined') {
                this.container = options.container;
            }
            else {
                this.container = new createjs.Container();
            }

            this.view = null;
        };

        Layer.prototype.setView = function (view) {
            if (this.view !== null) {
                this.view.trigger('stage:removed');
            }

            this.view = view;

            // Clear the container
            this.container.removeAllChildren();

            // Create a container for the view
            var container = new createjs.Container();

            // Set the view correctly
            this.view.setElement(container);

            // Add the container to the stage
            this.container.addChild(container);

            // Listen to all events and pass them trough.
            this.view.on('all', function (event) {
                this.trigger("view:" + event);
            }.bind(this));

            this.view.trigger('stage:added');
        };

        Layer.prototype.render = function () {

            if (!this.view)
                return;

            // Clear the element, so that render can recreate it
            this.view.el.removeAllChildren();

            // Before render
            this.view.trigger('render:before');

            // Render the subview
            this.view.render();

            // Post render
            this.view.trigger('render');

            // Also post render
            this.view.trigger('render:after');

        };

        Layer.prototype.tick = function (event) {
            if (this.view) {
                return this.view.tick(event);
            }
            return false;
        };

        return Layer;

    }
);