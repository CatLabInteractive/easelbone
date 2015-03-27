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
					'textColor' : 'white'
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
				return this.get ('textColor');
			},

			'ifUndefined' : function (value, defaultValue) {
				if (typeof (value) !== 'undefined' && value !== null) {
					return value;
				}
				return defaultValue;
			}


		});

		// Return an instance, not a prototype!
		return new model ();

	}
);