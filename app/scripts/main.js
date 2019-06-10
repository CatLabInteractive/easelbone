require.config ({
	paths: {
		easeljs: "../../node_modules/EaselJS/lib/easeljs",
		preloadjs: "../../node_modules/PreloadJS/lib/preloadjs",
		soundjs: "../../node_modules/SoundJS/lib/soundjs",
		tweenjs: "../../node_modules/TweenJS/lib/tweenjs",
		jquery: "../../node_modules/jquery/dist/jquery",
		requirejs: "../../node_modules/requirejs/require",
		underscore: "../../node_modules/underscore/underscore",
		backbone: "../../node_modules/backbone/backbone",
		easelhacks: "../../node_modules/easelhacks/dist/scripts/easelhacks"
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