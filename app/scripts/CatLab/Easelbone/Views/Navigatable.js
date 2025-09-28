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
                this.initializeNavigatable (options);
            },

            initializeNavigatable : function (options)
            {
                options = options || {};

                this._users = [];
                this._remoteViews = [];

                this._currentIndex = -1;
                this._current = null;
                this._options = [];
                this._backCallback = null;

                this._controls = _.extend(this.DefaultControls, {});

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
                if (this._backCallback !== null) {
                    this._backCallback(actor);
                }
            },

            next : function (actor)
            {
                this.activate ((this._currentIndex + 1) % this._options.length);
            },

            previous : function (actor)
            {
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
            }

        });
    }
);
