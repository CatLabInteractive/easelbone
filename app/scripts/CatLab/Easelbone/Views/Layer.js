define(
    [
        'easeljs',
        'underscore',
        'backbone',

        'CatLab/Easelbone/Utilities/Deferred'
    ],
    function (createjs, _, Backbone, Deferred) {

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

        Layer.prototype.setView = function (view)
        {
            var oldView = this.view;

            this.view = view;

            // Create a container for the view
            var container = new createjs.Container();

            // Set the view correctly
            this.view.setElement(container);

            // Add the container to the stage, but below the old view
            this.container.addChild(container);

            // Listen to all events and pass them trough.
            this.view.on('all', function (event) {
                this.trigger("view:" + event);
            }.bind(this));

            this.view.trigger('stage:added');

            // Make sure the new view is set behind the old view
            if (oldView && this.container.children.length > 0) {
                this.container.setChildIndex(oldView.el, this.container.children.length - 1);
            }

            // First, wait for any 'view:destroy' event that we might have
            var paused = false;
            if (this.view.el.timeline) {
                paused = this.view.el.timeline.paused;
                this.view.el.timeline.paused = true;
            }

            this._waitForViewDestroy(oldView)
                .then(function() {
                    if (oldView !== null) {
                        oldView.trigger('stage:removed');
                        this.container.removeChild(oldView.el);
                    }

                    if (this.view.el.timeline) {
                        this.view.el.timeline.paused = paused;
                    }

                    // Clear the container
                    //this.container.removeChild(oldView.el);
                    //this.container.addChild(container);

                }.bind(this));
        };

        /**
         * @param oldView
         * @returns {*}
         * @private
         */
        Layer.prototype._waitForViewDestroy = function(oldView)
        {
            var state = new Deferred();
            if (
                !oldView ||
                typeof(oldView.hasLabeledFrame) === 'undefined' ||
                typeof(oldView.easelScreen) === 'undefined' ||
                !oldView.easelScreen ||
                !oldView.hasLabeledFrame('view:destroy')
            ) {
                state.resolve();
                return state.promise();
            }

            oldView.jumpToFrame('view:destroy')
                .then(function() {
                    state.resolve();
                });

            //state.resolve();
            return state.promise();
        }

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
