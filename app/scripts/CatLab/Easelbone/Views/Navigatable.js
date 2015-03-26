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

			'initialize' : function ()
			{
				this.initializeNavigatable ();
			},

			'initializeNavigatable' : function ()
			{
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

					user.control ('left').click (function () { self.previous (); });
					user.control ('right').click (function () { self.next (); });

					// A or start.
					user.control ('a').click (function () { self.keyInput ('a'); });
					user.control ('b').click (function () { self.keyInput ('b'); });

					user.control ('up').click (function () { self.keyInput ('up'); });
					user.control ('down').click (function () { self.keyInput ('down'); });

					//Webcontrol.getUsers ()[i].control ('start').click (function () { self.callCurrentOption (); });
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

				this._options.push (control);
				if (this._options.length === 1) {
					// First control added? Activate that one.
					this.activate (0);
				}
				else {
					control.deactivate ();
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