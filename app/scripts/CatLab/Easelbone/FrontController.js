define (
	[
		'CatLab/Easelbone/Utilities/Loader',

		'CatLab/Easelbone/Views/Root',
		'CatLab/Easelbone/Views/Base',
		'CatLab/Easelbone/Views/Navigatable',

		'CatLab/Easelbone/Controls/Slider',
		'CatLab/Easelbone/Controls/Checkbox',
		'CatLab/Easelbone/Controls/Button',
		'CatLab/Easelbone/Controls/Selectbox',

		'CatLab/Easelbone/EaselJS/DisplayObjects/BigText',

		'CatLab/Easelbone/Utilities/GlobalProperties',

		'CatLab/FakeWebremote/Models/KeyboardUser'
	],
	function (
		Loader,

		RootView,
		BaseView,
		NavigatableView,

		SliderControl,
		CheckboxControl,
		ButtonControl,
		SelectboxControl,

		BigText,

		GlobalProperties,

		KeyboardUser
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
				'Button' : ButtonControl,
				'Selectbox' : SelectboxControl
			},

			'EaselJS' : {
				'BigText' : BigText
			},

			'FakeWebremote' : {
				'KeyboardUser' : KeyboardUser
			},

			'Loader' : new Loader ()

		};

	}
);