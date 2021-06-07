define(
    [],
    function() {

        "use strict";

        /**
         * These attributes can be used in Placeholders and will be automagically passed on to the original
         * displayobject references (as in placeholders, the references to the original displayobject gets lost
         * when the placeholder is filled.
         */
        return [
            'textAlign',
            'textColor',
            'textFont'
        ];

    }
);
