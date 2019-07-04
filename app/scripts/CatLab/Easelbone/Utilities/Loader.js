define (
	[
		'preloadjs',
		'easeljs',
		'CatLab/Easelbone/Utilities/Deferred'
	],
	function (
		preloadjs,
		createjs,
		Deferred
	) {
		"use strict";

		var Loader = function (options) {

			if (typeof(options) === 'undefined') {
				options = {};
			}

			if (typeof(options.queue) === 'undefined') {
				this.queue = new createjs.LoadQueue(false);
			} else {
				this.queue = options.queue;
			}

			this.queue.on('fileload', this.handleFileLoad.bind(this));

			// manifest queues are fake queues that are used to properly handle image loads in compositions
			// browser caching will make sure that every image is only loaded once
			this.compositions = [];
			this.tasks = [];
		};

		var p = Loader.prototype;

		p.loadComposition = function(composition, path) {
			var library = composition.getLibrary();
			var manifest = library.properties.manifest;

			this.compositions.push(composition);
			this.loadManifest(manifest, path);
		};

		p.loadAssets = function (assets, path) {
			return this.loadManifest(assets.properties.manifest, path);
		};

		p.loadManifest = function(manifest, path) {
			this.queue.loadManifest (manifest, false, path);
		};

		p.handleFileLoad = function(evt) {
			if (evt.item.type === "image") {
				this.handleImageLoad(evt.item.id, evt.result);
			}
		};

		p.task = function(callback) {
			this.tasks.push(callback);
		};

		p.load = function (options) {
			if (typeof(options) === 'undefined') {
				options = {};
			}

			var callback = function() {};
			var progress = function() {};

			if (typeof(options) === 'function') {
				callback = options;
				options = {};
			}

			if (typeof(options.progress) === 'function') {
				progress = options.progress;
			}

			var promises = [];
			promises.push(this.loadQueue());
			while (this.tasks.length > 0) {
				var taskPromise = (this.tasks.shift())();
				if (taskPromise) {
					promises.push(taskPromise);
				}
			}

			var promise = Deferred.when.apply(Deferred, promises);
			promise.then(function() {

				this.fixSpriteSheets();
				callback();

			}.bind(this));

			return promise;
		};

		p.loadQueue = function() {
			var state = new Deferred();

			this.queue.on('complete', function() {

				state.resolve();

			}, this);

			this.queue.load();
			return state.promise();
		};

		/**
		 * Handle image load.
		 * @param id
		 * @param result
		 */
		p.handleImageLoad = function (id, result) {
			this.compositions.forEach(function(composition) {
				composition.getImages()[id] = result;
			}.bind(this));
		};

		p.fixSpriteSheets = function() {
			this.compositions.forEach(function(composition) {

				var assets = composition.getLibrary();
				if (typeof(assets.ssMetadata) === 'undefined') {
					return;
				}

				var ss = composition.getSpriteSheet();
				var ssMetadata = assets.ssMetadata;

				for(var i = 0; i < ssMetadata.length; i++) {
					var image = this.queue.getResult(ssMetadata[i].name);
					if (!image) {
						continue;
					}

					ss[ssMetadata[i].name] = new createjs.SpriteSheet(
						{
							"images": [ image ],
							"frames": ssMetadata[i].frames
						}
					);
				}
			}.bind(this));
		};

		return Loader;

	}
);