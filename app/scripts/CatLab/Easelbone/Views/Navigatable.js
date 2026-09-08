define (
    [
        'underscore',
        'CatLab/Easelbone/Views/Base'
    ],
    function (
        _,
        BaseView
    ) {
        return BaseView.extend ({

            ORIENTATION : {
                VERTICAL : 'vertical',
                HORIZONTAL : 'horizontal'
            },

            DefaultControls : {

                navigation : [ 'left' , 'right' ],
                toggle : [ 'a' ],
                manipulation : [ 'down', 'up' ],
                back : [ 'b', 'back' ]

            },

            initialize : function (options)
            {
                this.initializeNavigable (options);
            },

            initializeNavigable : function (options)
            {
                options = options || {};

                this._users = [];
                this._remoteViews = [];

                this._currentIndex = -1;
                this._current = null;
                this._options = [];
                this._backCallback = null;

                this._controls = _.extend({}, this.DefaultControls);

                if (typeof (options.orientation) !== 'undefined') {
                    // Is orientation vertical?
                    if (options.orientation === this.ORIENTATION.VERTICAL) {
                        this._controls.navigation = [ 'up', 'down' ];
                        this._controls.manipulation = [ 'left' , 'right' ];
                    } else {
                        this._controls.navigation = [ 'left' , 'right' ];
                        this._controls.manipulation = [ 'up', 'down' ];
                    }
                }

                // Reset the options for Navigatable
                this.resetOptions ();
            },

            // Deprecated, use initializeNavigable instead.
            initializeNavigatable: function (options) {
                this.initializeNavigable(options);
            },

            /**
             * To control the navigatable with keyboard, gamepad or smartphone,
             * set a user collection here.
             * @param users
             */
            setUsers : function (users)
            {
                this._users = users;

                // Set the events for this controller.
                for (var i = 0; i < this._users.length; i ++) {
                    this.setWebremoteControls(this._users[i]);
                }
            },

            clearUsers : function() {

                for (var i = 0; i < this._remoteViews.length; i ++) {
                    this.clearWebremoteControlsInView(this._remoteViews[i]);
                }

                this._users = [];
                this._remoteViews = [];

            },

            setWebremoteControls : function(user) {

                var view = user.setView ("catlab-nes");
                this._remoteViews.push(view);

                this.setWebremoteControlsInView(view);

            },

            setWebremoteControlsInView: function(view)
            {
                // Focus next and previous
                view.control(this._controls.navigation[0]).click(function (actor) { this.previous(actor); }.bind(this));
                view.control(this._controls.navigation[1]).click(function (actor) { this.next(actor); }.bind(this));

                // Toggle
                for (var i = 0; i < this._controls.toggle.length; i ++ ) {
                    (function(i) {
                        view.control(this._controls.toggle[i]).click (function (actor) {
                            this.keyInput(this._controls.toggle[i], actor);
                        }.bind(this));
                    }.bind(this))(i);
                }

                // Back
                for (i = 0; i < this._controls.back.length; i ++ ) {
                    (function(i) {
                        view.control(this._controls.back[i]).click (function (actor) {
                            this.triggerBack(actor);
                        }.bind(this));
                    }.bind(this))(i);
                }

                // Increase or decrease
                view.control(this._controls.manipulation[0]).click(function (actor) { this.keyInput('down', actor); }.bind(this));
                view.control(this._controls.manipulation[1]).click(function (actor) { this.keyInput('up', actor); }.bind(this));
            },

            clearWebremoteControlsInView: function(view)
            {
                // Focus next and previous
                view.control(this._controls.navigation[0]).off('click');
                view.control(this._controls.navigation[1]).off('click');

                // Toggle
                for (var i = 0; i < this._controls.toggle.length; i ++ ) {
                    (function(i) {
                        view.control(this._controls.toggle[i]).off('click');
                    }.bind(this))(i);
                }

                // Back
                for (i = 0; i < this._controls.back.length; i ++ ) {
                    (function(i) {
                        view.control(this._controls.back[i]).off('click');
                    }.bind(this))(i);
                }

                // Increase or decrease
                view.control(this._controls.manipulation[0]).off('click');
                view.control(this._controls.manipulation[1]).off('click');
            },

            /**
             * @param backCallback
             */
            setBack : function(backCallback)
            {
                this._backCallback = backCallback;
            },

            /**
             *
             */
            triggerBack : function(actor)
            {
                // Give the active control first refusal: an open Dropdown
                // swallows the press and closes instead of leaving the view.
                if (this._current && typeof (this._current.onBack) === 'function' && this._current.onBack(actor) === true) {
                    return;
                }

                if (this._backCallback !== null) {
                    this._backCallback(actor);
                }
            },

            /**
             * Like triggerBack, next/previous give the active control first
             * refusal: a control whose capturesNavigation() returns true takes
             * the whole navigation axis (an open Dropdown behaves like a native
             * <select>: the focus cannot leave it until the list is committed
             * or cancelled). The press is handed to the control as key input
             * instead, under the name the VIEW gave it: this._controls.
             * navigation[1] for next and [0] for previous. A horizontal view
             * therefore forwards 'right'/'left', which a Dropdown ignores; a
             * vertical view forwards 'down'/'up', so its own arrow keys move
             * the highlight - in both cases exactly what a native <select>
             * does with the keys the reader is already using. A control without
             * a capturesNavigation() method never captures anything.
             */
            next : function (actor)
            {
                if (this._current && typeof (this._current.capturesNavigation) === 'function' && this._current.capturesNavigation()) {
                    if (typeof (this._current.keyInput) === 'function') {
                        this._current.keyInput(this._controls.navigation[1], actor);
                    }
                    return;
                }

				if (this._options.length === 0) {
					return;
				}

                this.activate ((this._currentIndex + 1) % this._options.length);
            },

            previous : function (actor)
            {
                if (this._current && typeof (this._current.capturesNavigation) === 'function' && this._current.capturesNavigation()) {
                    if (typeof (this._current.keyInput) === 'function') {
                        this._current.keyInput(this._controls.navigation[0], actor);
                    }
                    return;
                }

				if (this._options.length === 0) {
					return;
				}

                var previous = this._currentIndex - 1;
                if (previous < 0) {
                    previous = this._options.length - 1;
                }
                this.activate (previous);
            },

            keyInput : function (button, actor)
            {
                if (this._current) {
                    this._current.keyInput(button, actor);
                }
            },

            resetOptions : function ()
            {
                this._options = [];
            },

            addControl : function (control)
            {
                this._options.push (control);

                if (this._options.length === 1) {
                    // First control added? Activate that one.
                    setTimeout (function () {
                        this.activate(0, false);
                    }.bind(this), 1);
                } else {
                    control.deactivate (false);
                }
            },

            /**
             * Active control with given index.
             * @param controlIndex
             * @param animate
             */
            activate : function (controlIndex, animate)
            {
                if (typeof(animate) === 'undefined') {
                    animate = true;
                }

                if (this._currentIndex !== -1 && this._currentIndex !== null) {
                    this._options[this._currentIndex].deactivate(animate);
                }

                this._currentIndex = controlIndex;
                this._options[controlIndex].activate(animate);
                this._current = this._options[controlIndex];

				this.scrollIntoView(this._current.element);
            },

        });
    }
);
