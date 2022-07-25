define(
    [
        'CatLab/Easelbone/Utilities/Loader',
        'CatLab/Easelbone/Views/LoadingView',

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
        'CatLab/Easelbone/EaselJS/DisplayObjects/EmojiText',
        'CatLab/Easelbone/EaselJS/DisplayObjects/Placeholder',
        'CatLab/Easelbone/EaselJS/DisplayObjects/Background',

        'CatLab/Easelbone/EaselJS/Filters/ColorSwapFilter',

        'CatLab/Easelbone/EaselJS/DisabledButtonHelper',

        'CatLab/Easelbone/Utilities/GlobalProperties',
        'CatLab/Easelbone/Utilities/MovieClipHelper',

        'CatLab/FakeWebremote/Models/KeyboardUser'
    ],
    function (
        Loader,
        LoadingView,

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
        EmojiText,
        Placeholder,
        Background,

        ColorSwapFilter,

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
                Navigatable: NavigatableView,
                Loading: LoadingView
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
                EmojiText: EmojiText,
                Placeholder: Placeholder,
                Fill: Background,
                DisabledButtonHelper: DisabledButtonHelper,
                Filters: {
                    ColorSwapFilter: ColorSwapFilter
                }
            },

            FakeWebremote: {
                KeyboardUser: KeyboardUser
            },

            Loader: Loader,

            Helpers: {
                MovieClipHelper: MovieClipHelper
            }

        };

    }
);
