define (
	[
		'preloadjs'
	],
	function (PreloadJS) {

		var Loader = function () {

			this.loader = new createjs.LoadQueue (false);

		};

		Loader.prototype.loadAssets = function (assets, path) {
			this.loader.loadManifest (assets.properties.manifest, true, path);
		};

		Loader.prototype.load = function (callback) {
			callback ();
		};

		return Loader;

	}
);