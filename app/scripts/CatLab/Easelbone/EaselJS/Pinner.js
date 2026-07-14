define(
    ['easeljs', 'CatLab/Easelbone/Utilities/DirtyFlag'],
    function (createjs, DirtyFlag) {

        'use strict';

        // Pin state lives on the shared stage object so that separate easelbone
        // bundles (game + library) rendering onto the SAME stage cooperate: both
        // read/write stage._pinnedElements and stage._pinContainer, and whichever
        // RootView owns the tick loop drives the sync for all of them.

        function ensureState(stage) {
            if (!stage._pinnedElements) {
                stage._pinnedElements = [];
            }
            return stage._pinnedElements;
        }

        function ensureContainer(stage) {
            if (stage._pinContainer && stage._pinContainer.stage === stage) {
                return stage._pinContainer;
            }
            // Fallback for contexts with no designated pin layer (e.g. a
            // standalone library portal with no blackout): a last-child
            // container on the stage.
            var container = new createjs.Container();
            stage.addChild(container);
            stage._pinContainer = container;
            return container;
        }

        var Pinner = {

            _props: {},

            setContainer: function (stage, container) {
                stage._pinContainer = container;
            },

            // Retry pinning on each tick until obj is attached to a stage.
            // Gives up after ~5s (300 ticks) so a never-attached object can't
            // leak a permanent retry loop.
            _deferPin: function (obj, attempt) {
                if (obj.stage) {
                    Pinner.pin(obj);
                    return;
                }
                if (attempt >= 300) {
                    return;
                }
                createjs.Ticker.on('tick', function () {
                    Pinner._deferPin(obj, attempt + 1);
                }, null, true);
            },

            pin: function (obj) {
                var stage = obj.stage;
                if (!stage) {
                    // Not on a stage yet. We can't rely on obj's 'added'
                    // event here: obj is typically addChild'd to its
                    // placeholder BEFORE pinToTop is called, so 'added' has
                    // already fired and will NOT fire again when an ancestor
                    // (the placeholder) is later attached to the stage. Retry
                    // on the ticker until obj is actually on a stage.
                    Pinner._deferPin(obj, 0);
                    return;
                }

                // Idempotent: a second pin() on an object that's already
                // pinned must not re-derive the anchor from obj.parent, since
                // that's now the pin container, not the original anchor --
                // which would orphan the real record (wrong key for
                // _removeByAnchor) and push a bogus, never-torn-down one.
                if (Pinner._isPinned(stage, obj)) {
                    return;
                }

                var anchor = obj.parent;
                if (!anchor) {
                    return;
                }

                ensureState(stage);

                // Re-pin replaces: drop any existing pin on the same anchor so a
                // re-rendered QR (removeAllChildren + regenerate) never stacks.
                Pinner._removeByAnchor(stage, anchor);

                var wrapper = new createjs.Container();
                var record = { obj: obj, anchor: anchor, wrapper: wrapper };

                ensureContainer(stage).addChild(wrapper);
                wrapper.addChild(obj); // reparents obj out of anchor; obj's own transform/regX/regY untouched

                // Flag so other machinery that manages an object's place in the
                // display list (e.g. Placeholder.updateZIndex, which re-inserts
                // an inner placeholder next to its source element every tick)
                // can leave a pinned object where the Pinner put it instead of
                // dragging it back and defeating the pin.
                obj._pinnedToTop = true;

                stage._pinnedElements.push(record);

                // Immediate sync: correctly placed even without a running tick.
                Pinner._syncRecord(stage, record);

                // Reparenting doesn't itself mark the RootView dirty; under
                // dirtyRendering:true this ensures the pin paints next frame
                // instead of waiting for an unrelated event or the heartbeat.
                DirtyFlag.invalidate();
            },

            unpin: function (obj) {
                var stage = obj.stage;
                var records = stage && stage._pinnedElements;
                if (!records) {
                    return;
                }
                for (var i = 0; i < records.length; i++) {
                    if (records[i].obj === obj) {
                        Pinner._restore(records[i]);
                        records.splice(i, 1);
                        DirtyFlag.invalidate();
                        return;
                    }
                }
            },

            _isPinned: function (stage, obj) {
                var records = stage._pinnedElements;
                if (!records) {
                    return false;
                }
                for (var i = 0; i < records.length; i++) {
                    if (records[i].obj === obj) {
                        return true;
                    }
                }
                return false;
            },

            sync: function (stage) {
                var records = stage._pinnedElements;
                if (!records || records.length === 0) {
                    return false;
                }
                for (var i = records.length - 1; i >= 0; i--) {
                    var record = records[i];
                    // Auto-teardown: anchor removed from the stage.
                    if (record.anchor.stage !== stage) {
                        Pinner._restore(record);
                        records.splice(i, 1);
                        continue;
                    }
                    Pinner._syncRecord(stage, record);
                }
                return records.length > 0;
            },

            _removeByAnchor: function (stage, anchor) {
                var records = stage._pinnedElements;
                for (var i = records.length - 1; i >= 0; i--) {
                    if (records[i].anchor === anchor) {
                        Pinner._restore(records[i]);
                        records.splice(i, 1);
                    }
                }
            },

            _restore: function (record) {
                record.obj._pinnedToTop = false;
                if (record.obj.parent) {
                    record.obj.parent.removeChild(record.obj);
                }
                if (record.wrapper.parent) {
                    record.wrapper.parent.removeChild(record.wrapper);
                }
                if (record.anchor && record.anchor.stage) {
                    record.anchor.addChild(record.obj);
                }
            },

            _syncRecord: function (stage, record) {
                var wrapper = record.wrapper;

                // Callers can hide all pinned overlays (e.g. while a modal is
                // open over the pinned QR) by setting stage._pinsHidden.
                wrapper.visible = !stage._pinsHidden;

                var container = wrapper.parent;
                if (!container) {
                    return;
                }

                // Positioning needs only the concatenated matrices. Reading
                // them walks the anchor/container up to the stage, which can
                // throw (or return null) while the tree is still being built
                // (e.g. a pin created from a deferred tick during screen init).
                // If so, leave the pin where it is and place it on a later sync.
                var anchorMatrix;
                var containerMatrix;
                try {
                    anchorMatrix = record.anchor.getConcatenatedMatrix();
                    containerMatrix = container.getConcatenatedMatrix();
                } catch (e) {
                    return;
                }

                if (!anchorMatrix || !containerMatrix) {
                    return;
                }

                // The anchor's bounds are OPTIONAL -- only used so bounds-sizing
                // children (e.g. a Fill) can match the anchor's box. getBounds()
                // walks the anchor's *subtree* and can throw when a descendant
                // has incomplete bounds; that must NOT block positioning, so
                // guard it separately and just skip the bounds carry on failure.
                // Only touch bounds when they actually change.
                var bounds = null;
                try {
                    bounds = record.anchor.getBounds();
                } catch (e) {
                    bounds = null;
                }
                if (bounds && (record._bw !== bounds.width || record._bh !== bounds.height)) {
                    record._bw = bounds.width;
                    record._bh = bounds.height;
                    wrapper.setBounds(0, 0, bounds.width, bounds.height);
                }

                // Place the wrapper in the anchor's coordinate space:
                //   wrapperLocal = pinContainerConcatenated^-1 * anchorConcatenated
                var local = containerMatrix.invert().appendMatrix(anchorMatrix);

                // Short-circuit: if the resulting transform is bit-identical to
                // last frame (a static QR on a still screen), skip the decompose
                // and the property writes. The matrix reads above are the same
                // inputs -> same outputs, so an exact compare is safe.
                var m = record._m || (record._m = { a: 0, b: 0, c: 0, d: 0, tx: 0, ty: 0 });
                if (
                    m.a === local.a && m.b === local.b && m.c === local.c &&
                    m.d === local.d && m.tx === local.tx && m.ty === local.ty
                ) {
                    return;
                }
                m.a = local.a; m.b = local.b; m.c = local.c;
                m.d = local.d; m.tx = local.tx; m.ty = local.ty;

                var props = local.decompose(Pinner._props);
                wrapper.x = props.x;
                wrapper.y = props.y;
                wrapper.scaleX = props.scaleX;
                wrapper.scaleY = props.scaleY;
                wrapper.rotation = props.rotation;
                wrapper.skewX = props.skewX;
                wrapper.skewY = props.skewY;
            }
        };

        return Pinner;
    }
);
