define (
	[
		'CatLab/Easelbone/Utilities/Loader',

		'CatLab/Easelbone/Views/Root',
		'CatLab/Easelbone/Views/Base',
		'CatLab/Easelbone/Views/Navigatable',

		'CatLab/Easelbone/Controls/Slider',

		'CatLab/Easelbone/Utilities/GlobalProperties'
	],
	function (
		Loader,

		RootView,
		BaseView,
		NavigatableView,

		SliderControl,

		GlobalProperties
	) {



		return {

			'initialize' : function () {



			},

			'setProperties' : function (properties) {
				GlobalProperties.set (properties);
			},

			'Views' : {
				'Root' : RootView,
				'Base' : BaseView,
				'Navigatable' : NavigatableView
			},

			'Controls' : {
				'Slider' : SliderControl
			},

			'Loader' : new Loader ()

		};

	}
);