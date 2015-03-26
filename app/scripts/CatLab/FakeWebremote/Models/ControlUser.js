define (
	[
		'CatLab/FakeWebremote/Models/User',
		'CatLab/FakeWebremote/Models/Control'
	],
	function (User, WebcontrolControl) {

		var WebcontrolUser = function (data) {
			this.initialize (data);
		};

		WebcontrolUser.prototype = User;

		WebcontrolUser.prototype.setWebcontrol = function (Webcontrol) {
			this.Webcontrol = Webcontrol;
		};

		WebcontrolUser.prototype.initialize = function (data)
		{
			this.controls = {};
			this.currentView = null;
			this.color = 'orange';
			this.colorName = 'orange';
			this.tmpid = null;
			this.active = false;

			this.userdata = data;
			this.profiledata = {};

			this.access_token = null;
		};

		WebcontrolUser.prototype.clearControls = function ()
		{
			if (this.currentView != null)
			{
				var labels = this.Webcontrol.getViewLabels (this.currentView);
				for (var i = 0; i < labels.length; i ++)
				{
					this.control(labels[i].id).setStaticLabel (labels[i].label, 'mobile');
				}
			}
		};

		WebcontrolUser.prototype.clearEvents = function ()
		{
			this.log ('Clearing events');
			for (this.tmpid in this.controls)
			{
				if (this.controls.hasOwnProperty (this.tmpid))
				{
					this.controls[this.tmpid].clearEvents ();
				}
			}
		};

		WebcontrolUser.prototype.trigger = function (method, data)
		{
			if (method == 'button:down')
			{
				this.control (data.id).update (1);
			}

			else if (method == 'button:up')
			{
				this.control (data.id).update (0);
			}

			else if (method == 'user:login')
			{
				this.login (data);
			}

			else if (method == 'user:logout')
			{
				this.logout (data);
			}
		};

		WebcontrolUser.prototype.emit = function (method, data)
		{
			this.Webcontrol._playerEmit (this, method, data);
			return true;
		};

		WebcontrolUser.prototype.control = function (id)
		{
			var self = this;
			if (typeof (this.controls[id]) == 'undefined')
			{
				this.controls[id] = new WebcontrolControl (id, self);
			}
			return this.controls[id];
		};

		WebcontrolUser.prototype.getId = function ()
		{
			return this.userdata.id;
		};

		WebcontrolUser.prototype.getName = function ()
		{
			return 'User ' + this.getId ();
		};

		WebcontrolUser.prototype.getType = function ()
		{
			return 'mobile';
		};

		WebcontrolUser.prototype.getIcon = function ()
		{
			return 'fa fa-mobile-phone';
		};

		WebcontrolUser.prototype.login = function (data)
		{
			var self = this;

			this.access_token = data.access_token;

			this.Webcontrol.getOAuthClient (function (client)
			{
				client.profile  (self.access_token, function (data)
				{
					self.profiledata = data.user;
				});
			});
		};

		WebcontrolUser.prototype.getData = function ()
		{
			return this.profiledata;
		};

		WebcontrolUser.prototype.logout = function (data)
		{
			this.profiledata = null;
			this.access_token = null;
		};

		WebcontrolUser.prototype.setColor = function (aColor, colorName)
		{
			this.color = aColor;
			this.colorName = colorName;
			this.emit ('color:set', { 'color' : aColor, 'name' : colorName });
		};

		WebcontrolUser.prototype.getColor = function ()
		{
			return this.color;
		};

		WebcontrolUser.prototype.getColorName = function ()
		{
			return this.colorName;
		};

		WebcontrolUser.prototype.isActive = function ()
		{
			return this.active;
		};

		WebcontrolUser.prototype.toggleActive = function ()
		{
			this.active = !this.active;
			this.setLabel();
		};

		WebcontrolUser.prototype.setActive = function (bool)
		{
			this.active = bool;
			this.setLabel();
		};

		WebcontrolUser.prototype.setLabel = function ()
		{
			if (this.active==true){
				this.control ('join-game').setLabel ('LEAVE');
			}else{
				this.control ('join-game').setLabel ('JOIN');
			}
		};

		WebcontrolUser.prototype.setView = function (id)
		{
			this.currentView = id;

			// Clear controls
			this.clearControls ();

			// Set view
			this.emit ('view:set', { 'id' : id });
		};

		WebcontrolUser.prototype.setUserData = function (access_key, userdata)
		{
			console.log ('Setting user data: ', access_key, userdata);
		};

		WebcontrolUser.prototype.isLocalAuthentication = function ()
		{
			return true;
		};

		WebcontrolUser.prototype.log = function (string)
		{
			console.log ("[u:" + this.getId () + "] " + string);
		};

		return WebcontrolUser;
	}
);