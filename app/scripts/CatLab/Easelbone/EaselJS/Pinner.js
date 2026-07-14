define(
    ['easeljs'],
    function (createjs) {

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

                var anchor = obj.parent;
                if (!anchor) {
                    return;
                }

                ensureState(stage);

                // Re-pin replaces: drop any existing pin on the same anchor so a
                // re-rendered QR (removeAllChildren + regenerate) never stacks.
                Pinner._removeByAnchor(stage, anchor);

                var record = {
                    obj: obj,
                    anchor: anchor,
                    localMatrix: obj.getMatrix(),
                    origRegX: obj.regX,
                    origRegY: obj.regY
                };

                ensureContainer(stage).addChild(obj); // reparents out of anchor
                stage._pinnedElements.push(record);

                // Immediate sync: correctly placed even without a running tick.
                Pinner._syncRecord(stage, record);
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
                        return;
                    }
                }
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
                record.obj.regX = record.origRegX;
                record.obj.regY = record.origRegY;
            },

            _syncRecord: function (stage, record) {
                var obj = record.obj;
                var container = obj.parent;
                if (!container) {
                    return;
                }

                // desired global matrix = anchorConcatenated * capturedLocal
                var desired = record.anchor.getConcatenatedMatrix()
                    .appendMatrix(record.localMatrix);

                // Express in the pin container's local space (do not assume the
                // pin container sits at identity):
                //   local = containerConcatenated^-1 * desired
                var local = container.getConcatenatedMatrix().invert()
                    .appendMatrix(desired);

                var props = local.decompose(Pinner._props);
                obj.x = props.x;
                obj.y = props.y;
                obj.scaleX = props.scaleX;
                obj.scaleY = props.scaleY;
                obj.rotation = props.rotation;
                obj.skewX = props.skewX;
                obj.skewY = props.skewY;
                // The captured localMatrix already bakes in the original regX/regY
                // as translation, so the pinned copy must carry none of its own.
                obj.regX = 0;
                obj.regY = 0;
            }
        };

        return Pinner;
    }
);
