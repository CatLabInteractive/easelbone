module.exports = function (grunt) {

    grunt.initConfig
    ({
        'requirejs': {
            'compile': {
                'options': {

                    baseUrl: 'app/scripts/',
                    paths: {
                        EaselJS: "vendor/EaselJS/lib/easeljs-NEXT.combined",
                        PreloadJS: "vendor/PreloadJS/lib/preloadjs-NEXT.combined",
                        SoundJS: "vendor/SoundJS/lib/soundjs-NEXT.combined",
                        TweenJS: "vendor/TweenJS/lib/tweenjs-NEXT.combined",
                        jquery: "vendor/jquery/dist/jquery",
                        requirejs: "vendor/requirejs/require",
                        underscore: "vendor/underscore/underscore",
                        backbone: "vendor/backbone/backbone",
                        easelhacks: "vendor/easelhacks/dist/scripts/easelhacks"
                    },
                    include: [
                        //'vendor/almond/almond',
                        'easelbone'
                    ],
                    exclude: [
                        'jquery',
                        'EaselJS',
                        'PreloadJS',
                        'SoundJS',
                        'TweenJS',
                        'backbone',
                        'requirejs',
                        'underscore'
                    ],
                    out: 'dist/scripts/easelbone.js',
                    /*
                    wrap: {
                        "startFile": "wrapper/wrap.start",
                        "endFile": "wrapper/wrap.end"
                    }
                    */
                }
            }
        },

        'copy': {
            'main': {
                'files': [
                    {
                        'expand': true,
                        'src': './package.json',
                        'dest': 'dist'
                    },

                    {
                        'expand': true,
                        'cwd': './app/scripts/',
                        'src': 'main.js',
                        'dest': 'dist/scripts/'
                    },

                    {
                        'expand': true,
                        'cwd': './app/',
                        'src': 'examples/**/*',
                        'dest': 'dist/'
                    }
                ]
            }
        },

        'clean': [
            'dist/package.json',
            'dist/scripts/CatLab/'
        ]
    });

    // Requirejs
    grunt.loadNpmTasks('grunt-contrib-requirejs');


    // Cleaner
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Copy
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.loadNpmTasks('grunt-bower-requirejs');

    grunt.registerTask('default', ['requirejs', 'copy', 'clean']);
};