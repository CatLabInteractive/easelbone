require.config ({
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
	shim: {
		EaselJS: {
			deps: [
				'TweenJS'
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