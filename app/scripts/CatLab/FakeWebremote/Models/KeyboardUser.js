define (
	[
		'CatLab/FakeWebremote/Models/ControlUser'
	],
	function (User)
	{

		var KeyboardUser = function (keys) {
			if (typeof (keys) == 'undefined') {
				keys = [
					{
						'id': 'up',
						'label': '↑',
						'key': 38
					},

					{
						'id': 'down',
						'label': '↓',
						'key': 40
					},

					{
						'id': 'right',
						'label': '→',
						'key': 39
					},

					{
						'id': 'left',
						'label': '←',
						'key': 37
					},

					{
						'id': 'a',
						'label': 'A',
						'key': 65
					},

					{
						'id': 'b',
						'label': 'B',
						'key': 66
					},

					{
						'id': 'x',
						'label': 'X',
						'key': 88
					},

					{
						'id': 'y',
						'label': 'Y',
						'key': 89
					},

					{
						'id': 'join-game',
						'label': 'SPACE',
						'key': 32
					},

					{
						'id': 'start-game',
						'label': 'ENTER',
						'key': 13
					}
				];
			}

			this.keys = keys;

			this.initialize ({ 'id' : 'keyboard' });

			var controls = {};
			var self = this;

			var control;
			var i = 0;

			// Attach the events
			document.addEventListener('keydown', function (e) {
				control = getControlFromKey(e.keyCode);
				if (control) {
					control.update(1);
				}
			});

			document.addEventListener('keyup', function (e) {
				control = getControlFromKey(e.keyCode);
				if (control) {
					control.update(0);
				}
			});

			function getControlFromKey(keycode) {
				for (i = 0; i < keys.length; i++) {
					if (keys[i].key == keycode) {
						control = self.control (keys[i].id);
						return control;
					}
				}
				return null;
			}

			this.clearControls = function () {
				for (var i = 0; i < keys.length; i++) {
					this.control (keys[i].id).setStaticLabel(keys[i].label, 'keyboard');
				}
			};

			this.getType = function () {
				return 'keyboard';
			};

			this.getIcon = function () {
				return 'fa fa-keyboard-o';
			};

			this.setView = function (id) {
				// Clear controls
				this.clearControls();
			};

			this.emit = function (method, data) {
				// Keyboard. Do nothing.
				return false;
			};

			this.isLocalAuthentication = function ()
			{
				return false;
			};

			// Set labels
			this.clearControls();
		};

		KeyboardUser.prototype = new User ();
		KeyboardUser.prototype.constructor = KeyboardUser;

		return KeyboardUser;

	}
);