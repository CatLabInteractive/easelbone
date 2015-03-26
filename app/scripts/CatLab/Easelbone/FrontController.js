define (
	[
		'CatLab/Easelbone/Utilities/Loader',

		'CatLab/Easelbone/Views/Root',
		'CatLab/Easelbone/Views/Base',
		'CatLab/Easelbone/Views/Navigatable',

		'CatLab/Easelbone/Controls/Slider',
		'CatLab/Easelbone/Controls/Checkbox',
		'CatLab/Easelbone/Controls/Button',

		'CatLab/Easelbone/Utilities/GlobalProperties'
	],
	function (
		Loader,

		RootView,
		BaseView,
		NavigatableView,

		SliderControl,
		CheckboxControl,
		ButtonControl,

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
				'Slider' : SliderControl,
				'Checkbox' : CheckboxControl,
				'Button' : ButtonControl
			},

			'Loader' : new Loader ()

		};

	}
);