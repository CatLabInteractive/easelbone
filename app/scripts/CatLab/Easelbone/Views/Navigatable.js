define (
    [
        'CatLab/Easelbone/Views/Base'
    ],
    function (BaseView)
    {
        return BaseView.extend ({

            '_users' : [],
            '_currentIndex' : -1,
            '_current' : null,
            '_options' : [],

            '_controls' : {

                'navigation' : [ 'left' , 'right' ],
                'toggle' : [ 'start', 'a' ],
                'manipulation' : [ 'down', 'up' ]

            },

            'initialize' : function (options)
            {
                this.initializeNavigatable (options);
            },

            'initializeNavigatable' : function (options)
            {
                options = options || {};

                if (typeof (options.orientation) !== 'undefined') {

                    if (options.orientation == 'vertical') {
                        this._controls.navigation = [ 'up', 'down' ];
                        this._controls.manipulation = [ 'left' , 'right' ];
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
            'setUsers' : function (users) {

                this._users = users;

                var self = this;

                // Set the events for this controller.
                for (var i = 0; i < this._users.length; i ++)
                {
                    var user = this._users[i];
                    this.setWebremoteControls(user);
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

                // Increase or decreate
                user.control(this._controls.manipulation[0]).click(function () { this.keyInput('down'); }.bind(this));
                user.control(this._controls.manipulation[1]).click(function () { this.keyInput('up'); }.bind(this));
            },

            next : function ()
            {
                this.activate ((this._currentIndex + 1) % this._options.length);
            },

            previous : function () {
                var previous = this._currentIndex - 1;
                if (previous < 0) {
                    previous = this._options.length - 1;
                }
                this.activate (previous);
            },

            keyInput : function (button) {
                if (this._current) {
                    this._current.keyInput(button);
                }
            },

            'resetOptions' : function ()
            {
                this._options = [];
            },

            'addControl' : function (control) {

                var self = this;

                this._options.push (control);

                /*
                if (this._options.length === 1) {
                    // First control added? Activate that one.
                    setTimeout (function ()
                    {
                        self.activate (0);
                    }, 1);

                }
                else {
                */
                    control.deactivate (false);
                //}
            },

            'activate' : function (index) {

                if (this._currentIndex !== -1 && this._currentIndex !== null) {
                    this._options[this._currentIndex].deactivate ();
                }

                this._currentIndex = index;
                this._options[index].activate ();
                this._current = this._options[index];
            }

        });
    }
);