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
					'height' : 600
				});

			},

			'getWidth' : function () {
				return this.get ('width');
			},

			'getHeight' : function () {
				return this.get ('height');
			}

		});

		// Return an instance, not a prototype!
		return new model ();

	}
);