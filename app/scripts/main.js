require.config ({
	paths: {
		EaselJS: "../../node_modules/EaselJS/lib/easeljs",
		PreloadJS: "../../node_modules/PreloadJS/lib/preloadjs",
		SoundJS: "../../node_modules/SoundJS/lib/soundjs",
		TweenJS: "../../node_modules/TweenJS/lib/tweenjs",
		jquery: "../../node_modules/jquery/dist/jquery",
		requirejs: "../../node_modules/requirejs/require",
		underscore: "../../node_modules/underscore/underscore",
		backbone: "../../node_modules/backbone/backbone",
		easelhacks: "../../node_modules/easelhacks/dist/scripts/easelhacks"
	},
	shim: {
		EaselJS: {
			deps: [
				"TweenJS"
			],
			exports: "createjs"
		},
		PreloadJS: {
			deps: [
				"EaselJS"
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