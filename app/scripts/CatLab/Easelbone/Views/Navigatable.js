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
                toggle : [ 'start', 'a' ],
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
                this._currentIndex = -1;
                this._current = null;
                this._options = [];
                this._backCallback = null;

                if (typeof (options.orientation) !== 'undefined') {
                    this._controls = _.extend(this.DefaultControls, {});

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

            setWebremoteControls : function(user)
            {
                user.setView ("catlab-nes");
                user.clearEvents ();

                // Focus next and previous
                user.control(this._controls.navigation[0]).click(function () { this.previous(); }.bind(this));
                user.control(this._controls.navigation[1]).click(function () { this.next(); }.bind(this));

                // Toggle
                for (var i = 0; i < this._controls.toggle.length; i ++ ) {
                    (function(i) {
                        user.control(this._controls.toggle[i]).click (function () {
                            this.keyInput(this._controls.toggle[i]);
                        }.bind(this));
                    }.bind(this))(i);
                }

                // Back
                for (i = 0; i < this._controls.back.length; i ++ ) {
                    (function(i) {
                        user.control(this._controls.back[i]).click (function () {
                            this.triggerBack();
                        }.bind(this));
                    }.bind(this))(i);
                }

                // Increase or decreate
                user.control(this._controls.manipulation[0]).click(function () { this.keyInput('down'); }.bind(this));
                user.control(this._controls.manipulation[1]).click(function () { this.keyInput('up'); }.bind(this));
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
            triggerBack : function()
            {
                if (this._backCallback !== null) {
                    this._backCallback.apply();
                }
            },

            next : function ()
            {
                this.activate ((this._currentIndex + 1) % this._options.length);
            },

            previous : function ()
            {
                var previous = this._currentIndex - 1;
                if (previous < 0) {
                    previous = this._options.length - 1;
                }
                this.activate (previous);
            },

            keyInput : function (button)
            {
                if (this._current) {
                    this._current.keyInput(button);
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
                        this.activate (0);
                    }.bind(this), 1);
                } else {
                    control.deactivate (false);
                }
            },

            /**
             * Active control with given index.
             * @param controlIndex
             */
            activate : function (controlIndex)
            {
                if (this._currentIndex !== -1 && this._currentIndex !== null) {
                    this._options[this._currentIndex].deactivate ();
                }

                this._currentIndex = controlIndex;
                this._options[controlIndex].activate ();
                this._current = this._options[controlIndex];
            }

        });
    }
);