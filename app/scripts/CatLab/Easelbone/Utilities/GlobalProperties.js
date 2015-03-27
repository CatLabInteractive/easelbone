define (
	[
		'backbone'
	],
	function (backbone)
	{

		var model = backbone.Model.extend ({

			'initialize' : function () {

				this.set ({
					'width': 800,
					'height' : 600,
					'font' : 'sans-serif',
					'text-color' : 'white'
				});

			},

			'getWidth' : function () {
				return this.get ('width');
			},

			'getHeight' : function () {
				return this.get ('height');
			},

			'getDefaultFont' : function () {
				return this.get ('font');
			},

			'getDefaultTextColor' : function () {
				return this.get ('text-color');
			},

			'ifUndefined' : function (value, defaultValue) {
				if (typeof (value) !== 'undefined') {
					return value;
				}
				return defaultValue;
			}


		});

		// Return an instance, not a prototype!
		return new model ();

	}
);