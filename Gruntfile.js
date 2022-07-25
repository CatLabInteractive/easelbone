module.exports = function (grunt) {

    grunt.initConfig
    ({
        'requirejs': {
            'compile': {
                'options': {

                    baseUrl: 'app/scripts/',
                    paths: {
                        easeljs: "vendor/EaselJS/lib/easeljs-NEXT",
                        preloadjs: "vendor/PreloadJS/lib/preloadjs-NEXT",
                        soundjs: "vendor/SoundJS/lib/soundjs-NEXT",
                        tweenjs: "vendor/TweenJS/lib/tweenjs-NEXT",
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
                        'easeljs',
                        'preloadjs',
                        'soundjs',
                        'tweenjs',
                        'backbone',
                        'requirejs',
                        'underscore'
                    ],
                    out: 'dist/scripts/easelbone.js',
                    optimize: 'none',
                    onBuildWrite: function(moduleName, path, contents) {
                        // r.js overrides `require` saving the original function as `require.nodeRequire`
                        var terser = require("terser");

                        var options = {
                            toplevel: true,
                            compress: {
                                global_defs: {

                                },
                                passes: 2
                            },
                            output: {
                                beautify: false
                            }
                        };

                        var result = terser.minify(contents, options);
                        if (result.error) {
                            throw new Error(result.error);
                        }
                        return result.code;
                    }
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
                    },

                    {
                        'expand': true,
                        'cwd': './app/',
                        'src': 'scripts/vendor/**/*',
                        'dest': 'dist/'
                    }
                ]
            }
        },

        'clean': [
            'dist/package.json',
            'dist/scripts/CatLab/'
        ],

        watch: {
            js: {
                files: ['app/**/*.js'],
                tasks: ['default']
            }
        },

        bump: {
            options: {
                files: [
                    'package.json'
                ],
                updateConfigs: [],
                commit: true,
                createTag: true,
                push: false,
                globalReplace: true,
                prereleaseName: false,
                regExp: false
            }
        },
    });

    // Requirejs
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.loadNpmTasks('grunt-bump');

    // Cleaner
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Copy
    grunt.loadNpmTasks('grunt-contrib-copy');

    grunt.loadNpmTasks('grunt-bower-requirejs');

    grunt.registerTask('default', ['requirejs', 'copy', 'clean']);
};
