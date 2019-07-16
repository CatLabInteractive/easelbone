define(
    [
        'CatLab/Easelbone/Utilities/Loader',
        'CatLab/Easelbone/Utilities/LoadingScreen',

        'CatLab/Easelbone/Views/Root',
        'CatLab/Easelbone/Views/Base',
        'CatLab/Easelbone/Views/Layer',
        'CatLab/Easelbone/Views/Navigatable',

        'CatLab/Easelbone/Controls/Slider',
        'CatLab/Easelbone/Controls/Checkbox',
        'CatLab/Easelbone/Controls/Button',
        'CatLab/Easelbone/Controls/Selectbox',

        'CatLab/Easelbone/Controls/ScrollBar',
        'CatLab/Easelbone/Controls/ScrollArea',
        'CatLab/Easelbone/Controls/List',
        'CatLab/Easelbone/Controls/FloatContainer',
        'CatLab/Easelbone/Controls/GridFill',

        'CatLab/Easelbone/EaselJS/DisplayObjects/BigText',
        'CatLab/Easelbone/EaselJS/DisplayObjects/Placeholder',
        'CatLab/Easelbone/EaselJS/DisplayObjects/Background',

        'CatLab/Easelbone/EaselJS/DisabledButtonHelper',

        'CatLab/Easelbone/Utilities/GlobalProperties',
        'CatLab/Easelbone/Utilities/MovieClipHelper',

        'CatLab/FakeWebremote/Models/KeyboardUser'
    ],
    function (
        Loader,
        LoadingScreen,

        RootView,
        BaseView,
        LayerView,
        NavigatableView,

        SliderControl,
        CheckboxControl,
        ButtonControl,
        SelectboxControl,

        ScrollBar,
        ScrollArea,
        ListControl,
        FloatContainer,
        GridFill,

        BigText,
        Placeholder,
        Background,

        DisabledButtonHelper,

        GlobalProperties,
        MovieClipHelper,

        KeyboardUser
    ) {

        return {

            initialize: function () {


            },

            setProperties: function (properties) {
                GlobalProperties.set(properties);
            },

            Views: {
                Root: RootView,
                Base: BaseView,
                Layer: LayerView,
                Navigatable: NavigatableView
            },

            Controls: {
                Slider: SliderControl,
                Checkbox: CheckboxControl,
                Button: ButtonControl,
                Selectbox: SelectboxControl,
                ScrollBar: ScrollBar,
                ScrollArea: ScrollArea,
                List: ListControl,
                FloatContainer: FloatContainer,
                GridFill : GridFill
            },

            EaselJS: {
                BigText: BigText,
                Placeholder: Placeholder,
                Fill: Background,
                DisabledButtonHelper: DisabledButtonHelper
            },

            FakeWebremote: {
                KeyboardUser: KeyboardUser
            },

            Loader: Loader,
            LoadingScreen : LoadingScreen,

            Helpers: {
                MovieClipHelper: MovieClipHelper
            }

        };

    }
);