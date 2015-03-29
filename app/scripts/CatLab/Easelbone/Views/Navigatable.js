define (
	[
		'CatLab/Easelbone/Views/Base'
	],
	function (BaseView)
	{
		return BaseView.extend ({

			'_users' : [],
			'_currentIndex' : null,
			'_current' : null,
			'_options' : [],

			'_controls' : {

				'navigation' : [ 'left' , 'right' ],
				'toggle' : [ 'a' ],
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

					user.setView ("catlab-nes");
					user.clearEvents ();

					user.control (this._controls.navigation[0]).click (function () { self.previous (); });
					user.control (this._controls.navigation[1]).click (function () { self.next (); });

					// A or start.
					user.control (this._controls.toggle).click (function () { self.keyInput ('a'); });
					user.control (this._controls.toggle).click (function () { self.keyInput ('b'); });

					user.control (this._controls.manipulation[0]).click (function () { self.keyInput ('down'); });
					user.control (this._controls.manipulation[1]).click (function () { self.keyInput ('up'); });
				}

			},

			'next' : function () {
				this.activate ((this._currentIndex + 1) % this._options.length);
			},

			'previous' : function () {
				var previous = this._currentIndex - 1;
				if (previous < 0) {
					previous = this._options.length - 1;
				}
				this.activate (previous);
			},

			'keyInput' : function (button) {
				if (this._current) {
					this._current.keyInput (button);
				}
			},

			'resetOptions' : function ()
			{
				this._options = [];
			},

			'addControl' : function (control) {

				var self = this;

				this._options.push (control);
				if (this._options.length === 1) {
					// First control added? Activate that one.
					setTimeout (function ()
					{
						self.activate (0);
					}, 1);

				}
				else {
					control.deactivate (false);
				}
			},

			'activate' : function (index) {
				if (this._currentIndex !== null) {
					this._options[this._currentIndex].deactivate ();
				}

				this._currentIndex = index;
				this._options[index].activate ();
				this._current = this._options[index];
			}

		});
	}
);