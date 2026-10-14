/**
 * Dirty rendering (`new easelbone.Views.Root({ dirtyRendering: true })`):
 * the display-list fingerprint, the tracker that turns it into "paint this
 * frame", the root view's tick that acts on it, and MovieClips nested at any
 * depth.
 *
 * Runs in plain node, no browser: the real EaselJS and TweenJS (from
 * app/scripts/vendor, so `bower install` first) and easelbone's own source
 * modules are loaded into a vm context with a fake canvas whose 2D context
 * records every call. The record of one paint is "the picture".
 *
 * The MovieClip tests do not check paints against expectations written by
 * hand. They build the same scene twice: one on a dirty-rendering root view,
 * one on a plain stage that is painted on every frame (the reference). After
 * every frame the last picture the dirty root painted must be the picture
 * the reference painted for that frame. A change that did not trigger a
 * paint shows up as a stale picture.
 *
 * Usage: node tools/dirty-rendering-test.js
 */
var fs = require('fs');
var path = require('path');
var vm = require('vm');
var assert = require('assert');

var ROOT = path.join(__dirname, '..');
var SCRIPTS = path.join(ROOT, 'app', 'scripts');
var EASELJS = path.join(SCRIPTS, 'vendor', 'EaselJS', 'lib', 'easeljs-NEXT.js');
var TWEENJS = path.join(SCRIPTS, 'vendor', 'TweenJS', 'lib', 'tweenjs-NEXT.js');

// ---------------------------------------------------------------------------
// A fake canvas. Its context records every call and property set; the record
// since the last reset is what was painted.
// ---------------------------------------------------------------------------

var canvasCounter = 0;

function describeArgument(value) {
    if (typeof value === 'number') {
        return String(Math.round(value * 1000) / 1000);
    }
    if (value && typeof value === 'object') {
        if (value.__fakeCanvas) {
            // Another canvas drawn into this one (a cache): its content.
            return 'canvas<' + value.__context.picture() + '>';
        }
        if (value.__fakeImage) {
            // Which picture it holds: what it loaded last, not its src (a
            // new src shows only once it has loaded). No id: the two copies
            // of a scene have their own image objects.
            return 'image<' + (value.__loadedSrc || '') + '>';
        }
        return 'object';
    }
    return String(value);
}

function createContext(canvas) {
    var log = [];
    var store = { canvas: canvas };

    var api = {
        reset: function () { log.length = 0; },
        picture: function () { return log.join(';'); }
    };

    var nothing = function () {
        return { addColorStop: function () {}, width: 10 };
    };

    var proxy = new Proxy(store, {
        get: function (target, name) {
            if (name === '__api') {
                return api;
            }
            if (Object.prototype.hasOwnProperty.call(target, name)) {
                return target[name];
            }
            if (typeof name !== 'string') {
                return undefined;
            }
            return function () {
                var args = Array.prototype.map.call(arguments, describeArgument);
                log.push(name + '(' + args.join(',') + ')');
                return nothing();
            };
        },
        set: function (target, name, value) {
            target[name] = value;
            log.push(String(name) + '=' + describeArgument(value));
            return true;
        }
    });

    return { proxy: proxy, api: api };
}

function createCanvas() {
    var canvas = {
        __fakeCanvas: true,
        __id: ++canvasCounter,
        width: 300,
        height: 150,
        style: {},
        parentNode: { offsetWidth: 800, offsetHeight: 600, appendChild: function () {} },
        addEventListener: function () {},
        removeEventListener: function () {},
        getBoundingClientRect: function () { return { left: 0, top: 0, width: 800, height: 600 }; }
    };
    var context = createContext(canvas);
    canvas.__context = context.api;
    canvas.getContext = function () { return context.proxy; };
    return canvas;
}

function FakeImage() {
    this.__fakeImage = true;
    this.__id = ++canvasCounter;
    this.naturalWidth = 0;
    this.naturalHeight = 0;
    this.width = 0;
    this.height = 0;
    this.complete = false;
    this.src = '';
    this.__loadedSrc = null;
    this.__listeners = [];
}
FakeImage.prototype.addEventListener = function (name, listener) {
    if (name === 'load') {
        this.__listeners.push(listener);
    }
};
FakeImage.prototype.removeEventListener = function () {};

/**
 * What a browser does when an image finishes loading `src`: the new size
 * and pixels, then `onload` and the load listeners.
 */
function loadImage(image, src, width, height) {
    image.src = src;
    image.__loadedSrc = src;
    image.naturalWidth = image.width = width;
    image.naturalHeight = image.height = height;
    image.complete = true;
    var event = { type: 'load', target: image };
    if (typeof image.onload === 'function') {
        image.onload(event);
    }
    image.__listeners.slice().forEach(function (listener) { listener(event); });
}

// ---------------------------------------------------------------------------
// The world: one vm context with createjs and easelbone's source modules.
// ---------------------------------------------------------------------------

function createWorld() {
    var now = 1000;
    var documentListeners = {};

    var sandbox = {
        console: console,
        setTimeout: setTimeout,
        clearTimeout: clearTimeout,
        Image: FakeImage,
        HTMLImageElement: FakeImage,
        createjs: { createCanvas: createCanvas }
    };
    sandbox.window = sandbox;
    sandbox.navigator = {};
    sandbox.performance = { now: function () { return now; } };
    sandbox.addEventListener = function () {};
    sandbox.removeEventListener = function () {};
    sandbox.document = {
        createElement: function (name) {
            if (name === 'canvas') {
                return createCanvas();
            }
            if (name === 'img') {
                return new FakeImage();
            }
            return { style: {}, appendChild: function () {} };
        },
        addEventListener: function (name, callback) {
            (documentListeners[name] = documentListeners[name] || []).push(callback);
        },
        removeEventListener: function (name, callback) {
            var list = documentListeners[name] || [];
            if (list.indexOf(callback) !== -1) {
                list.splice(list.indexOf(callback), 1);
            }
        },
        body: {}
    };

    var context = vm.createContext(sandbox);
    vm.runInContext(fs.readFileSync(EASELJS, 'utf8'), context, { filename: EASELJS });
    vm.runInContext(fs.readFileSync(TWEENJS, 'utf8'), context, { filename: TWEENJS });

    var createjs = sandbox.createjs;

    // The ticker is driven by hand; its listeners are only recorded.
    var tickerListeners = [];
    createjs.Ticker.addEventListener = function (name, listener) {
        tickerListeners.push(listener);
    };
    createjs.Ticker.removeEventListener = function (name, listener) {
        var index = tickerListeners.indexOf(listener);
        if (index !== -1) {
            tickerListeners.splice(index, 1);
        }
    };
    createjs.Ticker.getTime = function () { return now; };

    var Backbone = require('backbone');
    Backbone.$ = function (el) {
        return { 0: el, attr: function () {}, on: function () {}, off: function () {}, remove: function () {} };
    };

    var modules = {
        'easeljs': createjs,
        'tweenjs': createjs,
        'backbone': Backbone,
        'underscore': require('underscore')
    };

    function load(name) {
        if (Object.prototype.hasOwnProperty.call(modules, name)) {
            return modules[name];
        }

        var file = path.join(SCRIPTS, name + '.js');
        if (name.indexOf('CatLab/') !== 0 || !fs.existsSync(file)) {
            throw new Error('dirty-rendering-test: no module ' + name);
        }

        var definition = null;
        sandbox.define = function (deps, factory) {
            definition = { deps: deps, factory: factory };
        };
        vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });

        modules[name] = definition.factory.apply(null, definition.deps.map(load));
        return modules[name];
    }

    return {
        createjs: createjs,
        load: load,
        documentListeners: documentListeners,
        tickerListeners: tickerListeners,
        advance: function (ms) { now += ms; },
        now: function () { return now; }
    };
}

/**
 * A dirty-rendering (or plain) root view on a fake canvas, with paints
 * recorded.
 */
function createRoot(world, options) {
    var RootView = world.load('CatLab/Easelbone/Views/Root');
    // `el`: Backbone would ask the (missing) global document for one.
    var settings = { canvas: createCanvas(), el: {} };
    Object.keys(options || {}).forEach(function (key) { settings[key] = options[key]; });

    var root = new RootView(settings);
    var canvas = root.canvas;

    root.screen = null;
    root.ticks = 0;

    var stageTick = root.stage.tick;
    root.stage.tick = function () {
        root.ticks++;
        return stageTick.apply(this, arguments);
    };

    var stageUpdate = root.stage.update;
    root.stage.update = function () {
        canvas.__context.reset();
        var result = stageUpdate.apply(this, arguments);
        root.screen = canvas.__context.picture();
        return result;
    };

    // One ticker tick, `ms` later. Returns true when it painted.
    root.frame = function (ms) {
        var delta = typeof ms === 'number' ? ms : 40;
        world.advance(delta);
        var before = root.paintCount;
        root.tick({ delta: delta, time: world.now(), paused: false });
        return root.paintCount !== before;
    };

    root.settle = function () {
        for (var i = 0; i < 6; i++) {
            root.frame(10);
        }
    };

    return root;
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

var tests = [];
var group = '';

function describe(name, body) {
    var previous = group;
    group = group ? group + ' > ' + name : name;
    body();
    group = previous;
}

function test(name, body) {
    tests.push({ name: group + ' > ' + name, body: body });
}

// ---------------------------------------------------------------------------
// Fingerprint, on plain objects (no EaselJS needed to say what counts)
// ---------------------------------------------------------------------------

var nextId = 1;

function node(props) {
    var n = {
        id: nextId++,
        visible: true,
        alpha: 1,
        x: 0, y: 0,
        scaleX: 1, scaleY: 1,
        rotation: 0,
        skewX: 0, skewY: 0,
        regX: 0, regY: 0
    };
    Object.keys(props || {}).forEach(function (key) {
        n[key] = props[key];
    });
    return n;
}

function container(children, props) {
    var n = node(props);
    n.children = children || [];
    return n;
}

function text(value, props) {
    var n = node(props);
    n.text = value;
    n.font = '20px Arial';
    n.color = '#fff';
    return n;
}

function FakeGraphics() {
    this.commands = [];
}
FakeGraphics.prototype.append = function (command) {
    this.commands.push(command);
    return this;
};
FakeGraphics.prototype.clear = function () {
    this.commands.length = 0;
    return this;
};
FakeGraphics.prototype.setStrokeStyle = function () {
    return this;
};
// The tiny API points at the same functions.
FakeGraphics.prototype.c = FakeGraphics.prototype.clear;
FakeGraphics.prototype.ss = FakeGraphics.prototype.setStrokeStyle;

/**
 * A fresh copy of the module (its own "active" state and stamps).
 */
function loadDirtyRendering() {
    var file = path.join(SCRIPTS, 'CatLab', 'Easelbone', 'Utilities', 'DirtyRendering.js');
    var result = null;
    var define = function (deps, factory) { result = factory(); };
    new Function('define', fs.readFileSync(file, 'utf8'))(define);
    return result;
}

describe('fingerprint', function () {
    var DirtyRendering;
    var stage;
    var child;

    function setup() {
        DirtyRendering = loadDirtyRendering();
        child = node();
        stage = container([container([child])]);
    }

    function changes(mutate) {
        var before = DirtyRendering.fingerprint(stage);
        mutate();
        return DirtyRendering.fingerprint(stage) !== before;
    }

    function it(name, body) {
        test(name, function () {
            setup();
            body();
        });
    }

    it('is stable while nothing changes', function () {
        var first = DirtyRendering.fingerprint(stage);
        assert.strictEqual(DirtyRendering.fingerprint(stage), first);
        assert.strictEqual(DirtyRendering.fingerprint(stage), first);
    });

    ['x', 'y', 'scaleX', 'scaleY', 'rotation', 'skewX', 'skewY', 'regX', 'regY'].forEach(function (prop) {
        it('sees a change of ' + prop, function () {
            assert.strictEqual(changes(function () { child[prop] += 0.5; }), true);
        });
    });

    it('sees alpha, down to a slow fade step', function () {
        assert.strictEqual(changes(function () { child.alpha = 0.99; }), true);
    });

    it('sees a sub-pixel move of a slow tween', function () {
        assert.strictEqual(changes(function () { child.x += 0.1; }), true);
    });

    it('sees an object being hidden and shown', function () {
        assert.strictEqual(changes(function () { child.visible = false; }), true);
        assert.strictEqual(changes(function () { child.visible = true; }), true);
    });

    it('sees a child added, removed and reordered', function () {
        var parent = stage.children[0];
        var other = node();
        assert.strictEqual(changes(function () { parent.children.push(other); }), true);
        assert.strictEqual(changes(function () { parent.children.reverse(); }), true);
        assert.strictEqual(changes(function () { parent.children.pop(); }), true);
    });

    it('two moves that would cancel out in a linear sum are still seen', function () {
        var other = node();
        stage.children[0].children.push(other);
        assert.strictEqual(changes(function () { child.x += 1; other.x -= 1; }), true);
        assert.strictEqual(changes(function () { child.x += 1; child.y -= 31; }), true);
    });

    it('ignores everything below a hidden object', function () {
        var parent = stage.children[0];
        parent.visible = false;
        assert.strictEqual(changes(function () { child.x += 100; }), false);

        parent.visible = true;
        parent.alpha = 0;
        assert.strictEqual(changes(function () { child.x += 100; }), false);

        parent.alpha = 1;
        parent.scaleX = 0;
        assert.strictEqual(changes(function () { child.x += 100; }), false);
    });

    it('a MovieClip or Sprite frame counts', function () {
        child.currentFrame = 3;
        assert.strictEqual(changes(function () { child.currentFrame = 4; }), true);
    });

    it('the frame a synched MovieClip will show when it is drawn counts', function () {
        child.timeline = {};
        child.currentFrame = 0;
        child.mode = 'synched';
        child.startPosition = 0;
        child._synchOffset = 0;
        assert.strictEqual(changes(function () { child._synchOffset = 1; }), true);
        assert.strictEqual(changes(function () { child.startPosition = 4; }), true);
        assert.strictEqual(changes(function () { child.mode = 'single'; }), true);
    });

    it('a text, its colour and its font count', function () {
        var label = text('Score: 10');
        stage.children.push(label);
        assert.strictEqual(changes(function () { label.text = 'Score: 11'; }), true);
        assert.strictEqual(changes(function () { label.color = '#f00'; }), true);
        assert.strictEqual(changes(function () { label.font = '22px Arial'; }), true);
        assert.strictEqual(changes(function () { label.text = 'Score: 11'; }), false);
    });

    it('a mask that moves counts', function () {
        child.mask = node();
        assert.strictEqual(changes(function () { child.mask.x += 5; }), true);
        assert.strictEqual(changes(function () { child.mask.scaleX = 1.2; }), true);
    });

    it('a shadow counts', function () {
        child.shadow = { color: '#000', offsetX: 1, offsetY: 1, blur: 2 };
        assert.strictEqual(changes(function () { child.shadow.blur = 6; }), true);
    });

    it('bounds count: Placeholder, Fill and BigText lay out on them', function () {
        child._bounds = { x: 0, y: 0, width: 100, height: 100 };
        assert.strictEqual(changes(function () { child._bounds.width = 200; }), true);
    });

    it('another image, or the same one finishing its load', function () {
        var image = { naturalWidth: 0, naturalHeight: 0 };
        child.image = image;
        assert.strictEqual(changes(function () { image.naturalWidth = 640; image.naturalHeight = 480; }), true);
        assert.strictEqual(changes(function () { child.image = { naturalWidth: 640, naturalHeight: 480 }; }), true);
    });

    it('a source rect that moves (sprite sheet cell)', function () {
        child.image = { naturalWidth: 100, naturalHeight: 100 };
        child.sourceRect = { x: 0, y: 0, width: 10, height: 10 };
        assert.strictEqual(changes(function () { child.sourceRect.x = 10; }), true);
    });

    it('a Bitmap on a playing video changes every frame, on a paused one it does not', function () {
        var video = { currentTime: 1, readyState: 4 };
        child.image = video;
        assert.strictEqual(changes(function () { video.currentTime = 1.04; }), true);
        assert.strictEqual(changes(function () { /* paused */ }), false);
    });

    it('a video behind a createjs.VideoBuffer', function () {
        var video = { currentTime: 1, readyState: 4 };
        child.image = { _video: video };
        assert.strictEqual(changes(function () { video.currentTime = 1.04; }), true);
    });

    it('what is below a cache only shows after updateCache()', function () {
        var parent = stage.children[0];
        parent.cacheCanvas = {};
        parent.cacheID = 1;
        assert.strictEqual(changes(function () { child.x += 100; }), false);
        assert.strictEqual(changes(function () { parent.cacheID = 2; }), true);
    });

    it('the cached object itself still moves', function () {
        var parent = stage.children[0];
        parent.cacheCanvas = {};
        parent.cacheID = 1;
        assert.strictEqual(changes(function () { parent.x += 3; }), true);
    });

    describe('graphics', function () {
        function withGraphics(name, body) {
            it(name, function () {
                // A fresh class per test: install() wraps the prototype.
                function Graphics() { FakeGraphics.call(this); }
                Graphics.prototype = Object.create(FakeGraphics.prototype);
                Graphics.prototype.append = function (c) { return FakeGraphics.prototype.append.call(this, c); };
                Graphics.prototype.clear = function () { return FakeGraphics.prototype.clear.call(this); };
                Graphics.prototype.setStrokeStyle = function () { return this; };
                Graphics.prototype.c = Graphics.prototype.clear;
                Graphics.prototype.ss = Graphics.prototype.setStrokeStyle;

                var createjs = { Graphics: Graphics };
                DirtyRendering.install(createjs);
                child.graphics = new Graphics();
                child.graphics.append({});
                body(Graphics, createjs);
            });
        }

        withGraphics('a shape that is cleared and redrawn in place', function () {
            assert.strictEqual(changes(function () { child.graphics.clear().append({}); }), true);
        });

        withGraphics('one more command', function () {
            assert.strictEqual(changes(function () { child.graphics.append({}); }), true);
        });

        withGraphics('through the tiny API as well', function () {
            assert.strictEqual(changes(function () { child.graphics.c(); }), true);
            assert.strictEqual(changes(function () { child.graphics.ss(4); }), true);
        });

        withGraphics('another Graphics object on the same shape', function (Graphics) {
            assert.strictEqual(changes(function () { child.graphics = new Graphics(); }), true);
        });

        withGraphics('the wrapped methods still do their work and chain', function (Graphics) {
            var g = new Graphics();
            assert.strictEqual(g.append({ a: 1 }).append({ b: 2 }), g);
            assert.strictEqual(g.commands.length, 2);
            assert.strictEqual(g.clear(), g);
            assert.strictEqual(g.commands.length, 0);
        });

        withGraphics('installing twice wraps once', function (Graphics, createjs) {
            var append = Graphics.prototype.append;
            DirtyRendering.install(createjs);
            assert.strictEqual(Graphics.prototype.append, append);
        });
    });

    it('a walk over 5000 objects stays far below a frame', function () {
        var many = [];
        for (var i = 0; i < 5000; i++) {
            many.push(i % 10 === 0 ? text('Player ' + i) : node({ x: i }));
        }
        stage.children.push(container(many));

        DirtyRendering.fingerprint(stage);
        var start = Date.now();
        for (var run = 0; run < 20; run++) {
            DirtyRendering.fingerprint(stage);
        }
        assert.ok((Date.now() - start) / 20 < 8);
    });
});

describe('tracker', function () {
    var DirtyRendering;
    var stage;
    var child;
    var tracker;

    function it(name, body) {
        test(name, function () {
            DirtyRendering = loadDirtyRendering();
            child = node();
            stage = container([child]);
            tracker = DirtyRendering.track(stage, null);
            body();
        });
    }

    function settle() {
        for (var i = 0; i < 10; i++) {
            tracker.afterTick();
        }
    }

    it('stop() lets go of the stage, and stopping twice is harmless', function () {
        tracker.stop();
        tracker.stop();
        assert.strictEqual(tracker.tracking, false);
        assert.strictEqual(tracker.stage, null);
    });

    it('a view only hears "dirty" while the views of a dirty root tick', function () {
        assert.strictEqual(DirtyRendering.isActive(), false);
        var previous = DirtyRendering.setTicking(tracker);
        assert.strictEqual(previous, null);
        assert.strictEqual(DirtyRendering.isActive(), true);
        // A plain root ticking inside it (nested) is plain.
        var inner = DirtyRendering.setTicking(null);
        assert.strictEqual(DirtyRendering.isActive(), false);
        DirtyRendering.setTicking(inner);
        assert.strictEqual(DirtyRendering.isActive(), true);
        DirtyRendering.setTicking(previous);
        assert.strictEqual(DirtyRendering.isActive(), false);
    });

    it('the first frame is painted', function () {
        assert.strictEqual(tracker.afterTick(), true);
    });

    it('an idle stage comes to rest after the trailing frames', function () {
        assert.strictEqual(tracker.afterTick(), true);
        for (var i = 0; i < DirtyRendering.TRAILING_FRAMES; i++) {
            assert.strictEqual(tracker.afterTick(), true);
        }
        assert.strictEqual(tracker.afterTick(), false);
        assert.strictEqual(tracker.afterTick(), false);
    });

    it('a change made from outside the tick paints on the next tick, plus the trailing frames', function () {
        settle();
        child.x = 40;
        assert.strictEqual(tracker.afterTick(), true);
        for (var i = 0; i < DirtyRendering.TRAILING_FRAMES; i++) {
            assert.strictEqual(tracker.afterTick(), true);
        }
        assert.strictEqual(tracker.afterTick(), false);
    });

    it('an animation paints every frame it moves', function () {
        settle();
        for (var i = 0; i < 30; i++) {
            child.x += 2;
            assert.strictEqual(tracker.afterTick(), true);
        }
    });

    it('counts frames and changes', function () {
        settle();
        var frames = tracker.frames;
        var seen = tracker.changes;
        child.x += 1;
        tracker.afterTick();
        tracker.afterTick();
        assert.strictEqual(tracker.frames, frames + 2);
        assert.strictEqual(tracker.changes, seen + 1);
    });
});

// ---------------------------------------------------------------------------
// The root view, with the real EaselJS
// ---------------------------------------------------------------------------

describe('root view', function () {

    test('without the option nothing changes: a view decides, the stage ticks on update', function () {
        var world = createWorld();
        var root = createRoot(world, {});
        var DirtyRendering = world.load('CatLab/Easelbone/Utilities/DirtyRendering');

        assert.strictEqual(root.dirtyRendering, false);
        assert.strictEqual(root.dirtyTracker, null);
        assert.strictEqual(DirtyRendering.isActive(), false);
        assert.strictEqual(root.stage.tickOnUpdate, true);
        assert.strictEqual(typeof world.createjs.Graphics.prototype.append, 'function');

        var answer = false;
        root.layers.push({ tick: function () { return answer; }, render: function () {} });

        var before = root.paintCount;
        assert.strictEqual(root.frame(), false);
        answer = true;
        assert.strictEqual(root.frame(), true);
        assert.strictEqual(root.frame(), true);
        assert.strictEqual(root.paintCount, before + 2);

        // A base view still says "repaint every frame".
        var BaseView = world.load('CatLab/Easelbone/Views/Base');
        assert.strictEqual(BaseView.prototype.tick(), true);
    });

    test('the snapToPixel option reaches the stage and every layer', function () {
        var world = createWorld();

        var snapping = createRoot(world, { snapToPixel: true });
        assert.strictEqual(snapping.stage.snapToPixelEnabled, true);
        assert.strictEqual(snapping.mainLayer.container.snapToPixel, true);
        assert.strictEqual(snapping.nextLayer('top').container.snapToPixel, true);

        var plain = createRoot(world, {});
        assert.strictEqual(plain.stage.snapToPixelEnabled, false);
        assert.strictEqual(plain.mainLayer.container.snapToPixel, false);
    });

    describe('with dirtyRendering', function () {
        function it(name, body) {
            test(name, function () {
                var world = createWorld();
                var root = createRoot(world, { dirtyRendering: true });
                var item = new world.createjs.Shape();
                item.graphics.beginFill('#f00').drawRect(0, 0, 10, 10);
                root.stage.addChild(item);
                body(root, item, world);
            });
        }

        it('ticking and painting are separated', function (root, item, world) {
            assert.notStrictEqual(root.dirtyTracker, null);
            assert.strictEqual(root.stage.tickOnUpdate, false);
        });

        it('a base view no longer asks for a paint on every tick', function (root, item, world) {
            var BaseView = world.load('CatLab/Easelbone/Views/Base');
            root.layers.push({ tick: function () { return BaseView.prototype.tick(); }, render: function () {} });
            root.settle();
            assert.strictEqual(root.frame(10), false);
            assert.strictEqual(root.frame(10), false);
        });

        it('the stage ticks every frame, but an idle stage is not painted', function (root) {
            root.settle();
            var ticks = root.ticks;
            var paints = root.paintCount;

            for (var i = 0; i < 5; i++) {
                assert.strictEqual(root.frame(10), false);
            }

            assert.strictEqual(root.ticks, ticks + 5);
            assert.strictEqual(root.paintCount, paints);
        });

        it('a changed display object is painted on the next tick', function (root, item) {
            root.settle();
            item.x = 300;
            assert.strictEqual(root.frame(10), true);
            assert.ok(root.screen.indexOf('300') !== -1);
        });

        it('a shape redrawn in place is painted', function (root, item) {
            root.settle();
            item.graphics.clear().beginFill('#0f0').drawRect(0, 0, 20, 20);
            assert.strictEqual(root.frame(10), true);
            assert.ok(root.screen.indexOf('#0f0') !== -1);
        });

        it('an active tween on something hidden does not paint', function (root, item, world) {
            var createjs = world.createjs;
            var hidden = new createjs.Container();
            hidden.visible = false;
            var mover = new createjs.Shape();
            hidden.addChild(mover);
            root.stage.addChild(hidden);
            root.settle();

            var paints = root.paintCount;
            for (var i = 0; i < 8; i++) {
                mover.x += 5;   // what a tween does
                root.frame(10);
            }
            assert.strictEqual(root.paintCount, paints);
        });

        it('invalidate() paints once', function (root) {
            root.settle();
            var paints = root.paintCount;

            root.invalidate();
            root.frame(10);
            root.frame(10);

            assert.strictEqual(root.paintCount, paints + 1);
        });

        it('a view that returns true from tick() is still obeyed', function (root) {
            root.settle();
            var paints = root.paintCount;

            root.layers.push({ tick: function () { return true; }, render: function () {} });
            root.frame(10);
            root.frame(10);

            assert.strictEqual(root.paintCount, paints + 2);
        });

        it('mouse movement over the stage paints', function (root, item, world) {
            root.settle();
            var paints = root.paintCount;

            root.stage.dispatchEvent(new world.createjs.Event('stagemousemove'));
            root.frame(10);

            assert.strictEqual(root.paintCount, paints + 1);
        });

        it('the page becoming visible again paints', function (root, item, world) {
            root.settle();
            var paints = root.paintCount;

            world.documentListeners.visibilitychange.forEach(function (listener) { listener(); });
            root.frame(10);

            assert.strictEqual(root.paintCount, paints + 1);
        });

        it('the heartbeat paints an idle stage, and no more often than that', function (root) {
            root.settle();
            var paints = root.paintCount;

            // Three heartbeats of idle 40 ms frames.
            var frames = Math.round((root.heartbeatInterval * 3) / 40);
            for (var i = 0; i < frames; i++) {
                root.frame(40);
            }

            assert.ok(root.paintCount - paints >= 2);
            assert.ok(root.paintCount - paints <= 3);
        });

        it('heartbeatInterval is the host\'s to set', function (root) {
            root.heartbeatInterval = 100000;
            root.settle();
            var paints = root.paintCount;
            for (var i = 0; i < 50; i++) {
                root.frame(40);
            }
            assert.strictEqual(root.paintCount, paints);
        });

        it('a direct render ticks the stage first, as stage.update() does without the option', function (root) {
            var ticks = root.ticks;
            var paints = root.paintCount;

            root.render();

            assert.strictEqual(root.ticks, ticks + 1);
            assert.strictEqual(root.paintCount, paints + 1);
        });

        it('a direct render restarts the heartbeat', function (root, item, world) {
            root.settle();
            world.advance(root.heartbeatInterval - 20);
            root.render();
            root.frame(10);     // what the render's own tick changed, if anything
            root.frame(10);
            root.frame(10);
            var paints = root.paintCount;

            // Past the old heartbeat deadline, well before the new one.
            assert.strictEqual(root.frame(30), false);
            assert.strictEqual(root.paintCount, paints);
        });

        it('a Fill that waits for its content keeps every frame painted, then comes to rest', function (root, item, world) {
            var createjs = world.createjs;
            var Fill = world.load('CatLab/Easelbone/EaselJS/DisplayObjects/Background');

            // An image that is still loading: a Bitmap without bounds.
            var image = new FakeImage();
            var fill = new Fill(image, { zoom: 'minimum' });
            var content = fill.displayobject;

            var holder = new createjs.Container();
            holder.setBounds(0, 0, 200, 100);
            holder.addChild(fill);
            root.stage.addChild(holder);

            for (var i = 0; i < 20; i++) {
                assert.strictEqual(root.frame(10), true, 'frame ' + i);
            }
            assert.strictEqual(fill.children.length, 0);

            // The content arrives: not a change in the display list.
            image.naturalWidth = image.width = 10;
            image.naturalHeight = image.height = 10;
            image.complete = true;
            assert.strictEqual(root.frame(10), true);
            assert.strictEqual(fill.children.length, 1);

            root.settle();
            assert.strictEqual(root.frame(10), false);

            // New limits are laid out on the next paint.
            fill.setLimits(400, 400);
            assert.strictEqual(root.frame(10), true);
            assert.strictEqual(content.scaleX, 40);
        });
    });
});

describe('several root views, and teardown', function () {

    function baseLayer(world) {
        var BaseView = world.load('CatLab/Easelbone/Views/Base');
        return { tick: function () { return BaseView.prototype.tick(); }, render: function () {} };
    }

    test('a plain root next to a dirty root still paints every frame its views ask for', function () {
        var world = createWorld();
        var plain = createRoot(world, {});
        var dirty = createRoot(world, { dirtyRendering: true });
        plain.layers.push(baseLayer(world));
        dirty.layers.push(baseLayer(world));
        dirty.settle();

        for (var i = 0; i < 5; i++) {
            assert.strictEqual(plain.frame(10), true, 'plain, frame ' + i);
            assert.strictEqual(dirty.frame(10), false, 'dirty, frame ' + i);
        }

        // Outside any root's tick a base view keeps its old answer.
        var BaseView = world.load('CatLab/Easelbone/Views/Base');
        assert.strictEqual(BaseView.prototype.tick(), true);
    });

    test('two dirty roots both paint for an easelbone object that raised the flag', function () {
        var world = createWorld();
        var DirtyFlag = world.load('CatLab/Easelbone/Utilities/DirtyFlag');
        var a = createRoot(world, { dirtyRendering: true });
        var b = createRoot(world, { dirtyRendering: true });
        a.settle();
        b.settle();

        DirtyFlag.invalidate();
        assert.strictEqual(a.frame(10), true);
        assert.strictEqual(b.frame(10), true);
        assert.strictEqual(a.frame(10), false);
        assert.strictEqual(b.frame(10), false);
    });

    test('invalidate() on one root view paints that one only', function () {
        var world = createWorld();
        var a = createRoot(world, { dirtyRendering: true });
        var b = createRoot(world, { dirtyRendering: true });
        a.settle();
        b.settle();

        a.invalidate();
        assert.strictEqual(b.frame(10), false);
        assert.strictEqual(a.frame(10), true);
    });

    test('destroy() stops the tracker and lets go of the ticker, the stage and the page', function () {
        var world = createWorld();
        var root = createRoot(world, { dirtyRendering: true });
        var tracker = root.dirtyTracker;
        assert.strictEqual(world.tickerListeners.length, 1);
        assert.strictEqual(world.documentListeners.visibilitychange.length, 1);
        assert.strictEqual(root.stage.hasEventListener('stagemousemove'), true);

        root.destroy();
        root.destroy();

        assert.strictEqual(tracker.tracking, false);
        assert.strictEqual(root.dirtyTracker, null);
        assert.strictEqual(root.dirtyRendering, false);
        assert.strictEqual(world.tickerListeners.length, 0);
        assert.strictEqual(world.documentListeners.visibilitychange.length, 0);
        ['stagemousedown', 'stagemouseup', 'stagemousemove'].forEach(function (name) {
            assert.strictEqual(root.stage.hasEventListener(name), false, name);
        });
    });

    test('remove() tears the root view down as well', function () {
        var world = createWorld();
        var root = createRoot(world, { dirtyRendering: true });
        var tracker = root.dirtyTracker;
        root.remove();
        assert.strictEqual(tracker.tracking, false);
        assert.strictEqual(world.tickerListeners.length, 0);
    });

    test('dirty rendering turned off: the views decide again; back on: the display list does', function () {
        var world = createWorld();
        var root = createRoot(world, { dirtyRendering: true });
        var item = new world.createjs.Shape();
        root.stage.addChild(item);
        var answer = false;
        root.layers.push({ tick: function () { return answer; }, render: function () {} });
        root.settle();
        var tracker = root.dirtyTracker;

        root.setDirtyRendering(false);
        assert.strictEqual(tracker.tracking, false);
        assert.strictEqual(root.dirtyTracker, null);
        assert.strictEqual(root.stage.tickOnUpdate, true);
        assert.strictEqual(root.stage.hasEventListener('stagemousemove'), false);
        assert.strictEqual(world.documentListeners.visibilitychange.length, 0);

        item.x = 50;
        assert.strictEqual(root.frame(10), false);
        answer = true;
        assert.strictEqual(root.frame(10), true);

        answer = false;
        root.setDirtyRendering(true);
        assert.notStrictEqual(root.dirtyTracker, null);
        assert.strictEqual(root.stage.tickOnUpdate, false);
        root.settle();
        assert.strictEqual(root.frame(10), false);
        item.x = 60;
        assert.strictEqual(root.frame(10), true);

        // Turning it on twice tracks once.
        var current = root.dirtyTracker;
        root.setDirtyRendering(true);
        assert.strictEqual(root.dirtyTracker, current);
        assert.strictEqual(world.documentListeners.visibilitychange.length, 1);
    });
});

// ---------------------------------------------------------------------------
// MovieClips, nested. Every scene is built twice (see the header).
// ---------------------------------------------------------------------------

/**
 * @param build function (createjs, parent) -> anything (handed to `script`)
 * @param script function (frameNumber, scene) called before every frame, on
 *        both copies: changes made from outside the tick
 * @returns {{paints: number[], root, scene}} paints: 1/0 per frame
 */
function compare(build, script, frames) {
    var world = createWorld();
    var createjs = world.createjs;

    var root = createRoot(world, { dirtyRendering: true });
    // No safety net here: a paint the fingerprint did not ask for would
    // hide a stale picture.
    root.heartbeatInterval = Infinity;
    var scene = build(createjs, root.stage);

    var referenceCanvas = createCanvas();
    referenceCanvas.width = root.canvas.width;
    referenceCanvas.height = root.canvas.height;
    var reference = new createjs.Stage(referenceCanvas);
    var referenceScene = build(createjs, reference);

    var paints = [];
    for (var frame = 0; frame < frames; frame++) {
        if (script) {
            script(frame, scene, createjs);
            script(frame, referenceScene, createjs);
        }

        paints.push(root.frame(40) ? 1 : 0);

        referenceCanvas.__context.reset();
        reference.update({ delta: 40 });
        var expected = referenceCanvas.__context.picture();

        if (root.screen !== expected) {
            throw new Error(
                'stale picture at frame ' + frame + ' (painted this frame: ' + paints[frame] + ')\n' +
                '  on screen: ' + String(root.screen).slice(0, 400) + '\n' +
                '  should be: ' + expected.slice(0, 400)
            );
        }
    }

    return { paints: paints, root: root, scene: scene };
}

function sum(list, from, to) {
    var total = 0;
    for (var i = from; i < (typeof to === 'number' ? to : list.length); i++) {
        total += list[i];
    }
    return total;
}

function box(createjs, color, size) {
    var shape = new createjs.Shape();
    shape.graphics.beginFill(color).drawRect(0, 0, size || 10, size || 10);
    return shape;
}

/**
 * A clip as Animate exports it: children are put on the timeline by tweens.
 * @param steps function (Tween, child) per child, or state lists
 */
function clip(createjs, mode, children, options) {
    var settings = { mode: mode, loop: true };
    Object.keys(options || {}).forEach(function (key) { settings[key] = options[key]; });
    var stopped = settings.stopped;
    delete settings.stopped;
    var mc = new createjs.MovieClip(settings);
    if (stopped) {
        // autoReset: a parent timeline would start the clip again when it
        // puts it on stage (Animate clips stop from a frame action).
        mc.autoReset = false;
        mc.stop();
    }
    children.forEach(function (entry) {
        mc.timeline.addTween(entry(createjs.Tween));
    });
    return mc;
}

// A box that slides over 8 frames.
function slidingBox(createjs, color) {
    var shape = box(createjs, color);
    return function (Tween) {
        return Tween.get(shape).to({ x: 0 }).to({ x: 80 }, 8);
    };
}

// A box that fades over 8 frames.
function fadingBox(createjs, color) {
    var shape = box(createjs, color);
    return function (Tween) {
        return Tween.get(shape).to({ alpha: 1 }).to({ alpha: 0.2 }, 8);
    };
}

// Keeps `child` on the timeline for `frames` frames.
function hold(child, frames) {
    return function (Tween) {
        return Tween.get(child).wait(frames);
    };
}

// Two boxes that take turns: a frame change that adds and removes children.
function alternatingBoxes(createjs) {
    var a = box(createjs, '#00f');
    var b = box(createjs, '#ff0', 20);
    return function (Tween) {
        return Tween.get({})
            .to({ state: [{ t: a }] })
            .to({ state: [{ t: b }] }, 3)
            .to({ state: [] }, 3)
            .wait(2);
    };
}

describe('nested MovieClips', function () {
    var INDEPENDENT = 'independent';
    var SYNCHED = 'synched';
    var SINGLE = 'single';

    test('independent clips three deep: a child that moves or fades paints every frame', function () {
        var result = compare(function (createjs, parent) {
            var inner = clip(createjs, INDEPENDENT, [slidingBox(createjs, '#f00'), fadingBox(createjs, '#0f0')]);
            var middle = clip(createjs, INDEPENDENT, [hold(inner, 20)]);
            var outer = clip(createjs, INDEPENDENT, [hold(middle, 20)]);
            outer.x = 50;
            parent.addChild(outer);
            return { inner: inner };
        }, null, 40);

        assert.strictEqual(sum(result.paints, 0), 40);
    });

    test('synched clips three deep: frames are applied when drawn, and are painted', function () {
        var result = compare(function (createjs, parent) {
            var inner = clip(createjs, SYNCHED, [slidingBox(createjs, '#f00'), alternatingBoxes(createjs)]);
            var middle = clip(createjs, SYNCHED, [hold(inner, 16), fadingBox(createjs, '#0f0')]);
            var outer = clip(createjs, INDEPENDENT, [hold(middle, 16)]);
            parent.addChild(outer);
            return {};
        }, null, 48);

        assert.strictEqual(sum(result.paints, 0), 48);
    });

    test('a frame change that adds and removes children, deep down', function () {
        var result = compare(function (createjs, parent) {
            var inner = clip(createjs, INDEPENDENT, [alternatingBoxes(createjs)]);
            var wrapper = new createjs.Container();
            wrapper.addChild(inner);
            var middle = clip(createjs, SYNCHED, [hold(wrapper, 30)]);
            var outer = clip(createjs, INDEPENDENT, [hold(middle, 30)]);
            parent.addChild(outer);
            return {};
        }, null, 40);

        assert.ok(sum(result.paints, 0) > 20);
    });

    test('an independent clip inside a synched clip inside a stopped clip keeps playing and painting', function () {
        var result = compare(function (createjs, parent) {
            var inner = clip(createjs, INDEPENDENT, [slidingBox(createjs, '#f00')]);
            var middle = clip(createjs, SYNCHED, [hold(inner, 10)]);
            var outer = clip(createjs, INDEPENDENT, [hold(middle, 10)], { stopped: true });
            parent.addChild(outer);
            return {};
        }, null, 30);

        assert.ok(sum(result.paints, 10) === 20);
    });

    test('a stopped tree comes to rest, and a deep gotoAndStop from outside a tick is painted on the next one', function () {
        var result = compare(function (createjs, parent) {
            var inner = clip(createjs, INDEPENDENT, [slidingBox(createjs, '#f00')], { stopped: true });
            var middle = clip(createjs, INDEPENDENT, [hold(inner, 10)], { stopped: true });
            var outer = clip(createjs, INDEPENDENT, [hold(middle, 10)], { stopped: true });
            parent.addChild(outer);
            return { inner: inner };
        }, function (frame, scene) {
            // A countdown clip that is moved by hand, every tenth frame.
            if (frame >= 10 && frame % 10 === 0) {
                scene.inner.gotoAndStop(frame / 10);
            }
        }, 45);

        // At rest before the first jump.
        assert.strictEqual(sum(result.paints, 6, 10), 0);
        // Each jump: the frame itself plus the trailing frames, then rest.
        [10, 20, 30, 40].forEach(function (frame) {
            assert.strictEqual(result.paints[frame], 1, 'jump at ' + frame);
            assert.strictEqual(sum(result.paints, frame + 4, frame + 10 > 45 ? 45 : frame + 10), 0, 'rest after ' + frame);
        });
    });

    test('a synched clip whose startPosition is set from outside (a graphic symbol used as a state)', function () {
        var result = compare(function (createjs, parent) {
            var states = clip(createjs, SINGLE, [slidingBox(createjs, '#f00')]);
            var holder = new createjs.Container();
            holder.addChild(states);
            var outer = clip(createjs, INDEPENDENT, [hold(holder, 10)], { stopped: true });
            parent.addChild(outer);
            return { states: states };
        }, function (frame, scene) {
            if (frame === 12) {
                scene.states.startPosition = 4;
            }
        }, 24);

        assert.strictEqual(sum(result.paints, 6, 12), 0);
        assert.strictEqual(result.paints[12], 1);
        assert.strictEqual(sum(result.paints, 16, 24), 0);
    });

    test('clips under a hidden ancestor advance without a paint, and show the right frame when revealed', function () {
        var result = compare(function (createjs, parent) {
            var inner = clip(createjs, INDEPENDENT, [slidingBox(createjs, '#f00'), alternatingBoxes(createjs)]);
            var middle = clip(createjs, SYNCHED, [hold(inner, 20), fadingBox(createjs, '#0f0')]);
            var outer = clip(createjs, INDEPENDENT, [hold(middle, 20)]);
            var hidden = new createjs.Container();
            hidden.visible = false;
            hidden.addChild(outer);
            parent.addChild(hidden);
            parent.addChild(box(createjs, '#fff'));
            return { hidden: hidden, inner: inner };
        }, function (frame, scene) {
            if (frame === 30) {
                scene.hidden.visible = true;
            }
        }, 45);

        // They did advance while hidden.
        assert.ok(result.scene.inner.currentFrame > 0);
        // Hidden: at rest after the first frames.
        assert.strictEqual(sum(result.paints, 6, 30), 0);
        // Revealed: every frame.
        assert.strictEqual(sum(result.paints, 30), 15);
    });

    test('alpha 0 hides a subtree as well', function () {
        var result = compare(function (createjs, parent) {
            var inner = clip(createjs, INDEPENDENT, [slidingBox(createjs, '#f00')]);
            var outer = clip(createjs, INDEPENDENT, [hold(inner, 20)]);
            var hidden = new createjs.Container();
            hidden.alpha = 0;
            hidden.addChild(outer);
            parent.addChild(hidden);
            return {};
        }, null, 30);

        assert.strictEqual(sum(result.paints, 6), 0);
    });

    test('clips under a cached ancestor advance without a paint, until the cache is updated', function () {
        var result = compare(function (createjs, parent) {
            var inner = clip(createjs, INDEPENDENT, [slidingBox(createjs, '#f00'), alternatingBoxes(createjs)]);
            var middle = clip(createjs, SYNCHED, [hold(inner, 20), fadingBox(createjs, '#0f0')]);
            var outer = clip(createjs, INDEPENDENT, [hold(middle, 20)]);
            var cached = new createjs.Container();
            cached.addChild(outer);
            parent.addChild(cached);
            return { cached: cached, inner: inner };
        }, function (frame, scene) {
            if (frame === 5) {
                scene.cached.cache(0, 0, 100, 100);
            }
            if (frame === 30) {
                scene.cached.updateCache();
            }
        }, 45);

        assert.ok(result.scene.inner.currentFrame > 0);
        // Cached at frame 5: painted then (plus trailing), then at rest.
        assert.strictEqual(sum(result.paints, 0, 5), 5);
        assert.strictEqual(result.paints[5], 1);
        assert.strictEqual(sum(result.paints, 9, 30), 0);
        // The cache is redrawn once: one change, then rest again.
        assert.strictEqual(result.paints[30], 1);
        assert.strictEqual(sum(result.paints, 34), 0);
    });

    test('a clip that plays next to a cached, advancing one paints for the visible clip only', function () {
        var result = compare(function (createjs, parent) {
            var lights = clip(createjs, INDEPENDENT, [fadingBox(createjs, '#ff0')]);
            var background = new createjs.Container();
            background.addChild(lights);
            parent.addChild(background);

            var timer = clip(createjs, INDEPENDENT, [slidingBox(createjs, '#f00')], { stopped: true });
            parent.addChild(timer);
            return { background: background, timer: timer };
        }, function (frame, scene) {
            if (frame === 3) {
                scene.background.cache(0, 0, 100, 100);
            }
            if (frame === 20) {
                scene.timer.gotoAndStop(3);
            }
        }, 30);

        assert.strictEqual(sum(result.paints, 7, 20), 0);
        assert.strictEqual(result.paints[20], 1);
        assert.strictEqual(sum(result.paints, 24), 0);
    });
});

describe('what else decides the picture', function () {

    test('a sprite sheet whose image finishes loading late', function () {
        var result = compare(function (createjs, parent) {
            var image = new FakeImage();
            var sheet = new createjs.SpriteSheet({ images: [image], frames: { width: 10, height: 10 } });
            parent.addChild(new createjs.Sprite(sheet));
            return { image: image };
        }, function (frame, scene) {
            if (frame === 10) {
                loadImage(scene.image, 'sheet.png', 40, 10);
            }
        }, 20);

        assert.strictEqual(result.paints[10], 1);
        assert.strictEqual(sum(result.paints, 14), 0);
    });

    test('an image whose src is swapped for another of the same size', function () {
        var result = compare(function (createjs, parent) {
            var image = new FakeImage();
            loadImage(image, 'a.png', 10, 10);
            parent.addChild(new createjs.Bitmap(image));
            return { image: image };
        }, function (frame, scene) {
            if (frame === 10) {
                scene.image.src = 'b.png';
            }
            if (frame === 14) {
                loadImage(scene.image, 'b.png', 10, 10);
            }
        }, 24);

        assert.strictEqual(result.paints[14], 1);
        assert.strictEqual(sum(result.paints, 18), 0);
    });

    test('BitmapText letterSpacing, lineHeight and spaceWidth', function () {
        var result = compare(function (createjs, parent) {
            var image = new FakeImage();
            loadImage(image, 'font.png', 20, 10);
            var sheet = new createjs.SpriteSheet({
                images: [image],
                frames: { width: 10, height: 10 },
                animations: { A: 0, B: 1 }
            });
            var label = new createjs.BitmapText('A B\nAB', sheet);
            parent.addChild(label);
            return { label: label };
        }, function (frame, scene) {
            if (frame === 10) {
                scene.label.letterSpacing = 6;
            }
            if (frame === 15) {
                scene.label.lineHeight = 30;
            }
            if (frame === 20) {
                scene.label.spaceWidth = 25;
            }
        }, 26);

        assert.strictEqual(result.paints[10], 1);
        assert.strictEqual(result.paints[15], 1);
        assert.strictEqual(result.paints[20], 1);
    });

    test('loop toggled on a synched clip past the end of its timeline', function () {
        var result = compare(function (createjs, parent) {
            var child = clip(createjs, 'synched', [slidingBox(createjs, '#f00')]);
            var outer = clip(createjs, 'independent', [hold(child, 20)], { stopped: true });
            outer.gotoAndStop(12);
            parent.addChild(outer);
            return { child: child };
        }, function (frame, scene) {
            if (frame === 10) {
                scene.child.loop = false;
            }
        }, 20);

        assert.strictEqual(result.paints[10], 1);
        assert.strictEqual(sum(result.paints, 14), 0);
    });

    test('snapToPixel on an object, and snapToPixelEnabled on the stage', function () {
        var result = compare(function (createjs, parent) {
            parent.snapToPixelEnabled = true;
            var shape = box(createjs, '#f00');
            shape.x = 10.4;
            shape.y = 3.3;
            parent.addChild(shape);
            return { shape: shape, stage: parent };
        }, function (frame, scene) {
            if (frame === 10) {
                scene.shape.snapToPixel = false;
            }
            if (frame === 15) {
                scene.shape.snapToPixel = true;
            }
            if (frame === 20) {
                scene.stage.snapToPixelEnabled = false;
            }
        }, 26);

        assert.strictEqual(result.paints[10], 1);
        assert.strictEqual(result.paints[15], 1);
        assert.strictEqual(result.paints[20], 1);
    });
});

// ---------------------------------------------------------------------------

var failed = 0;
tests.forEach(function (entry) {
    try {
        entry.body();
        console.log('PASS ' + entry.name);
    } catch (e) {
        failed++;
        console.log('FAIL ' + entry.name + '\n     ' + String(e && e.stack || e).split('\n').slice(0, 8).join('\n     ').slice(0, 1500));
    }
});

console.log('');
if (failed) {
    console.log(failed + ' of ' + tests.length + ' dirty rendering tests failed');
    process.exit(1);
}
console.log('All ' + tests.length + ' dirty rendering tests passed');
