require.config ({
	paths: {
		EaselJS: "vendor/EaselJS/lib/easeljs-0.8.1.combined",
		Movieclip: "vendor/EaselJS/lib/movieclip-0.8.1.combined",
		PreloadJS: "vendor/PreloadJS/lib/preloadjs-0.6.1.combined",
		SoundJS: "vendor/SoundJS/lib/soundjs-0.6.1.combined",
		TweenJS: "vendor/TweenJS/lib/tweenjs-0.6.1.combined",
		jquery: "vendor/jquery/dist/jquery",
		requirejs: "vendor/requirejs/require",
		underscore: "vendor/underscore/underscore",
		backbone: "vendor/backbone/backbone",
		easelhacks: "vendor/easelhacks/dist/scripts/easelhacks"
	},
	shim: {
		EaselJS: {
			deps: [

			],
			exports: "createjs"
		},
		PreloadJS: {
			deps: [
				"EaselJS"
			],
			exports: "createjs"
		},
		Movieclip: {
			deps: [
				"EaselJS",
				"TweenJS"
			],
			exports: "createjs"
		}
	},
	packages: [

	]
});

define (
	[ 'easelbone' ],
	function (catlabremote) {
		return catlabremote;
	}
);