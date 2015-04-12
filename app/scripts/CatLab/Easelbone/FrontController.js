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

		'CatLab/Easelbone/Controls/ScrollBar',
		'CatLab/Easelbone/Controls/ScrollArea',
		'CatLab/Easelbone/Controls/List',
		'CatLab/Easelbone/Controls/FloatContainer',

		'CatLab/Easelbone/EaselJS/DisplayObjects/BigText',
		'CatLab/Easelbone/EaselJS/DisplayObjects/Placeholder',

		'CatLab/Easelbone/EaselJS/DisabledButtonHelper',

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

		ScrollBar,
		ScrollArea,
		ListControl,
		FloatContainer,

		BigText,
		Placeholder,

		DisabledButtonHelper,

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
				'Selectbox' : SelectboxControl,
				'ScrollBar' : ScrollBar,
				'ScrollArea' : ScrollArea,
				'List' : ListControl,
				'FloatContainer' : FloatContainer
			},

			'EaselJS' : {
				'BigText' : BigText,
				'DisabledButtonHelper' : DisabledButtonHelper
			},

			'FakeWebremote' : {
				'KeyboardUser' : KeyboardUser
			},

			'Loader' : new Loader ()

		};

	}
);