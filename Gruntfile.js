module.exports = function(grunt) {

	grunt.initConfig
	({

		bowerRequirejs: {
			target: {
				rjsConfig: 'app/scripts/main.js'
			}
		},

		'requirejs' : {
			'compile' : {
				'options' : {

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
					include : [
						'main'
					],
					exclude : [
                        'jquery',
                        'EaselJS',
                        'PreloadJS',
                        'SoundJS',
                        'TweenJS',
                        'backbone',
                        'requirejs',
                        'underscore'
					],
					out: 'dist/scripts/easelbone.js'

					/*

					appDir: "app/",
					baseUrl: "scripts",
					dir: "dist/",
					mainConfigFile: "app/scripts/main.js",
					name: "easelbone",
					optimize: 'uglify2',
					optimizeCss: "standard",
					removeCombined: true,
					generateSourceMaps : true,
					preserveLicenseComments : false,
					exclude: [
						'jquery',
						'EaselJS',
						'PreloadJS',
						'SoundJS',
						'TweenJS',
						'backbone',
						'requirejs',
						'underscore'
					]
					*/
				}
			}
		},

		'copy' : {
			'main' : {
				'files' : [
					{
						'expand' : true,
						'src' : './package.json',
						'dest' : 'dist'
					},

                    {
                        'expand' : true,
						'cwd' : './app/scripts/',
                        'src' : 'main.js',
                        'dest' : 'dist/scripts/'
                    }
				]
			}
		},

		'clean' : [
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

	grunt.registerTask('default', ['requirejs', 'copy', 'clean' ]);
};