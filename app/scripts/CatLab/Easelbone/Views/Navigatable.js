define (
	[
		'CatLab/Easelbone/Views/Base'
	],
	function (BaseView)
	{
		return BaseView.extend ({

			'_previesOptionIndex' : 0,
			'_currentOptionIndex' : 0,
			'_options' : [],

			'initialize' : function ()
			{
				this.initializeNavigatable ();
			},

			'initializeNavigatable' : function ()
			{
				var self = this;

				// Reset the options for Navigatable
				this.resetOptions ();
			},

			/**
			 * To control the navigatable with keyboard, gamepad or smartphone,
			 * set a user collection here.
			 * @param users
			 */
			'setUsers' : function (users) {

				this.users = users;

				var self = this;

				// Set the events for this controller.
				for (var i = 0; i < this.users.length; i ++)
				{
					var user = this.users[i];

					user.setView ("catlab-nes");
					user.clearEvents ();
					user.control ('left').click (function () { self.callOptionLeft(); });
					user.control ('right').click (function () { self.callOptionRight(); });

					// A or start.
					user.control ('a').click (function () { self.callOptionA(); });
					user.control ('b').click (function () { self.callOptionB(); });

					user.control ('up').click (function () { self.callOptionUp(); });
					user.control ('down').click (function () { self.callOptionDown(); });

					//Webcontrol.getUsers ()[i].control ('start').click (function () { self.callCurrentOption (); });
				}

			},

			'resetOptions' : function ()
			{
				this._options = [];
			},

			'addControl' : function (control) {

			},

			'addOption' : function (button, callbackOptionA,callbackOptionB,callbackOptionUp,callbackOptionDown,callbackOptionLeft,callbackOptionRight)
			{
				// Add click event
				//button.addEventListener ("click", callback);
				//button.addEventListener ('click', callbackOptionA, this);

				this._options.push ({ 'button' : button, 'optionA' : callbackOptionA, 'optionB' : callbackOptionB,'optionUp':callbackOptionUp,'optionDown':callbackOptionDown,'optionLeft':callbackOptionLeft,'optionRight':callbackOptionRight });
			},

			'nextOption' : function ()
			{
				this._previesOptionIndex = this._currentOptionIndex;
				this._currentOptionIndex = ((this._currentOptionIndex + 1) % this._options.length);
				this.updateOptions ();
			},

			'previousOption' : function ()
			{
				this._previesOptionIndex = this._currentOptionIndex;
				this._currentOptionIndex = ((this._options.length + this._currentOptionIndex - 1) % this._options.length);
				this.updateOptions ();
			},

			'selectOption':function(button){
				for (var i = 0;i<this._options.length;i++){
					if (this._options[i].button==button){
						this._previesOptionIndex = this._currentOptionIndex;
						this._currentOptionIndex = i;
					}
				}
				this.updateOptions();
			},

			'updateOptions' : function ()
			{
				this._options[this._previesOptionIndex].button.unactivate();
				this._options[this._currentOptionIndex].button.activate();
			},

			'callOptionA' : function()
			{
				if (this._options[this._currentOptionIndex].optionA != null)
				{
					this._options[this._currentOptionIndex].optionA ();
				}
			},

			'callOptionB' : function()
			{
				if (this._options[this._currentOptionIndex].optionB != null)
				{
					this._options[this._currentOptionIndex].optionB();
				}
			},

			'callOptionUp' : function()
			{
				if (this._options[this._currentOptionIndex].optionUp != null)
				{
					this._options[this._currentOptionIndex].optionUp();
				}
			},

			'callOptionDown' : function()
			{
				if (this._options[this._currentOptionIndex].optionDown != null)
				{
					this._options[this._currentOptionIndex].optionDown();
				}
			},

			'callOptionLeft' : function()
			{
				if (this._options[this._currentOptionIndex].optionLeft != null)
				{
					this._options[this._currentOptionIndex].optionLeft();
				}
			},

			'callOptionRight' : function()
			{
				if (this._options[this._currentOptionIndex].optionRight != null)
				{
					this._options[this._currentOptionIndex].optionRight();
				}
			},

			'getCurrentOptionIndex' : function(){
				for(var i = 0 ; i< this._options.length;i++){
					if (this._options[i].isActive()){
						this._currentOptionIndex = i;
						break;
					}
				}
			}

		});
	}
);