require.config ({
	paths: {
		EaselJS: "vendor/EaselJS/lib/easeljs-0.8.0.combined",
		Movieclip: "vendor/EaselJS/lib/movieclip-0.8.0.combined",
		PreloadJS: "vendor/PreloadJS/lib/preloadjs-0.6.0.combined",
		SoundJS: "vendor/SoundJS/lib/soundjs-0.6.0.combined",
		TweenJS: "vendor/TweenJS/lib/tweenjs-0.6.0.combined",
		backbone: "vendor/backbone/backbone",
		jquery: "vendor/jquery/dist/jquery",
		requirejs: "vendor/requirejs/require",
		underscore: "vendor/underscore/underscore"
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