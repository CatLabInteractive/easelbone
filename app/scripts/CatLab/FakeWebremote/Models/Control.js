define (
	[],
	function () {
		return function (id, user)
		{
			var value = 0;
			var listeners = {};
			var i;
			var m_label = id;
			var m_label_type;
			var domwatchers = [];

			this.id = id;

			this.pushed = function ()
			{
				return value === 0;
			};

			this.scale = function ()
			{
				return value;
			};

			this.update = function (newvalue)
			{
				if (value > 0 && newvalue == 0)
				{
					this.trigger ('click');
				}
				value = newvalue;
			};

			this.getLabel = function ()
			{
				return '<span class="control-label ' + m_label_type + '">' + m_label + '</span>';
			};

			this.setStaticLabel = function (label, type)
			{
				m_label = label;
				m_label_type = type;
				return this;
			}

			this.setLabel = function (label, force)
			{
				// Networky stuff to set the label
				user.emit ('button:label', { 'id' : id, 'label' : label });
				return this;
			};

			/**
			 * Event will be called any time specific button is clicked (= released)
			 */
			this.click = function (callback)
			{
				this.on ('click', callback);
				return this;
			};

			this.on = function (event, callback)
			{
				this.log ('Setting trigger ' + event);
				if (typeof (listeners[event]) == 'undefined')
				{
					listeners[event] = [];
				}
				listeners[event].push (callback);
				return this;
			};

			this.trigger = function (event)
			{
				this.log ("Triggering " + event);

				var todo = [];

				if (typeof (listeners[event]) != 'undefined')
				{
					this.log ("Found " + listeners[event].length + " events");

					for (i = 0; i < listeners[event].length; i ++)
					{
						todo.push (listeners[event][i]);
					}
				}

				for (i = 0; i < todo.length; i ++)
				{
					try {
						todo[i] ();
					}
					catch (e)
					{
						console.log (e);
					}
				}
				return this;
			};

			this.off = function (event)
			{
				listeners[event] = [];
				return this;
			};

			this.clearEvents = function ()
			{
				this.log ('Clearing events');

				listeners = {};
				return this;
			};

			this.addDomElement = function (element)
			{
				var self = this;
				var listeners = [];

				listeners.push (element.addEventListener ('click', function ()
				{
					self.trigger ('click');
				}));

				domwatchers.push ({ 'element' : element, 'listeners' : listeners });

				return this;
			};

			this.clearDomElements = function ()
			{
				for (var i = 0; i < domwatchers.length; i ++)
				{
					for (var j = 0; j < domwatchers[i].listeners.length; j ++)
					{
						domwatchers[i].element.removeEventListener ('click', domwatchers[i].listeners[j]);
					}
				}

				domwatchers = [];

				return this;
			};

			this.isLocalAuthentication = function ()
			{
				return false;
			};

			this.log = function (msg)
			{
				user.log ('[' + this.id + '] ' + msg);
			};
		};
	}
);