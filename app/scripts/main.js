require.config ({
	paths: {
		easeljs: "vendor/EaselJS/lib/easeljs",
		preloadjs: "vendor/PreloadJS/lib/preloadjs",
		soundjs: "vendor/SoundJS/lib/soundjs",
		tweenjs: "vendor/TweenJS/lib/tweenjs",
		jquery: "vendor/jquery/dist/jquery",
		requirejs: "vendor/requirejs/require",
		underscore: "vendor/underscore/underscore",
		backbone: "vendor/backbone/backbone",
		easelhacks: "vendor/easelhacks/dist/scripts/easelhacks"
	},
	shim: {
		easeljs: {
			deps: [
				"tweenjs"
			],
			exports: "createjs"
		},
		preloadjs: {
			deps: [
				"easeljs"
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
