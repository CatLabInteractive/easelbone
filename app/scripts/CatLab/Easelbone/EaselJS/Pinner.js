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
            if (stage._pinContainer && stage._pinContainer.getStage() === stage) {
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

            pin: function (obj) {
                var stage = obj.getStage();
                if (!stage) {
                    // Not on a stage yet; defer until it is added.
                    var deferred = function () {
                        obj.off('added', deferred);
                        Pinner.pin(obj);
                    };
                    obj.on('added', deferred);
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

                stage._pinnedElements.push(record);

                // Immediate sync: correctly placed even without a running tick.
                Pinner._syncRecord(stage, record);

                // Reparenting doesn't itself mark the RootView dirty; under
                // dirtyRendering:true this ensures the pin paints next frame
                // instead of waiting for an unrelated event or the heartbeat.
                DirtyFlag.invalidate();
            },

            unpin: function (obj) {
                var stage = obj.getStage();
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
                    if (!record.anchor.getStage || record.anchor.getStage() !== stage) {
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
                if (record.obj.parent) {
                    record.obj.parent.removeChild(record.obj);
                }
                if (record.wrapper.parent) {
                    record.wrapper.parent.removeChild(record.wrapper);
                }
                if (record.anchor && record.anchor.getStage && record.anchor.getStage()) {
                    record.anchor.addChild(record.obj);
                }
            },

            _syncRecord: function (stage, record) {
                var wrapper = record.wrapper;
                var container = wrapper.parent;
                if (!container) {
                    return;
                }

                // Carry the anchor's bounds so bounds-sizing children (e.g. Fill) size correctly.
                var bounds = record.anchor.getBounds();
                if (bounds) {
                    wrapper.setBounds(0, 0, bounds.width, bounds.height);
                }

                // Place the wrapper in the anchor's coordinate space:
                //   wrapperLocal = pinContainerConcatenated^-1 * anchorConcatenated
                var local = container.getConcatenatedMatrix().invert()
                    .appendMatrix(record.anchor.getConcatenatedMatrix());

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
