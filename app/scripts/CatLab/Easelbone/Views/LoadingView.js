define(
    [
        'CatLab/Easelbone/Views/Base'
    ],
    function (
        Base
    ) {
        "use strict";

        var img = new Image();
        img.crossOrigin = 'anonymous';

        img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAWCAYAAAA1vze2AAAABmJLR0QA/wD/AP+gvaeT" +
            "AAAACXBIWXMAAA3XAAAN1wFCKJt4AAAAB3RJTUUH3wMRCycoY5y7DgAAAeBJREFUSMel1j9sTlEYBvD3fv2DIqmmmmjTBSXV" +
            "kYSBhAixWNRmMYvBgMZQSUeLQWIw2hqLWIRBYpCIQYcyYDBJNAQpBk21P8u5cdzcfv1835Pc3JznOed9zn3f95zciCbAAbzE" +
            "Ik5VtI04jxmMRzvAKD76i1VszvSZTFvESDsmk1jxLyYz/UtFu7pWrEYTn9EafUcyGIiIgYo23o5Jdw23kt79NVrR1AQNbEEe" +
            "+F0WtMSLiIiiKN5HxGqdluL1oB89JdGFabzGLWxKfB9ms5zfqdTsYqbNoT+LN5tqdq+cfLrSQUcrOxrGCLoqJg1sxxg2ZPyZ" +
            "SsNcCTyvdMlUdABMpc2W+NyIiP2VecMtBjuMEzVSX2U82B0RSxHRk5H5gTsbEbcjYig1wpuI2BoRx7I5cxFxqCiK5URtq3Sa" +
            "wINKui6nxfvwU2u4npneqGjzkQr3LRFPMZil40eLJnfLxsAQHuErHpfx1sr5Xnxq0WS6Wf2anfhzKb/r4XeqVcvt14sL//EF" +
            "JZ6Uh3g9gzF80D7u4yQm1rzU8DYi9kRnWE333WBRFN/rarIQnaMREb/SU5uu3VjWOS6haFaX41iqWbjQosE8eltpgAk8TKf9" +
            "FXYl/kgawzMcTPxOXMPN/B8gxx+XbHMxap3gAwAAAABJRU5ErkJggg==";

        var pawsize = {
            'width': 20,
            'height': 20
        };

        return Base.extend({

            initialize: function(options) {

                this.gameVersion = null;
                if (typeof(options.gameVersion) !== 'undefined') {
                    this.gameVersion = options.gameVersion;
                }

                this.dRotation = 0.0;

                this.angle = Math.random() * Math.PI * 2;
                this.targetAngle = null;

                this.flippedX = false;
                this.flippedY = false;

                this.rotationSpeedRad = 0.2;

                // Instance-level state (was incorrectly shared at module level)
                this._step = 0;
                this._points = [];
                this._flipper = false;
                this._limits = { x: { start: 0, end: 100 }, y: { start: 0, end: 100 } };
                this._position = { x: 50, y: 50 };
            },

            _getScreenMargin: function() {
                // Scale margin proportionally to the smaller canvas dimension
                return Math.min(this._limits.x.end, this._limits.y.end) * 0.05;
            },

            _getSpeed: function() {
                // Speed proportional to canvas diagonal so it looks consistent on any aspect ratio
                var w = this._limits.x.end;
                var h = this._limits.y.end;
                return Math.sqrt(w * w + h * h) * 0.007;
            },

            render: function() {

                this._limits = {
                    'x': {
                        'start': 0,
                        'end': this.el.stage.canvas.width
                    },
                    'y': {
                        'start': 0,
                        'end': this.el.stage.canvas.height
                    }
                };

                this.loadingText = new createjs.Text('Loading', '15px monospace', '#ffffff');
                this.loadingText.textAlign = 'center';
                this.loadingText.lineHeight = 20;
                this.el.addChild(this.loadingText);

                this.versionText = null;
                if (this.gameVersion) {
                    this.versionText = new createjs.Text('v' + this.gameVersion, '12px monospace', '#ffffff');
                    this.el.addChild(this.versionText);

                    this.versionText.cache(-100, -100, 200, 200);
                    this.loadingText.cache(-100, -100, 200, 200);
                }

                this.el.setBounds(0, 0, this.el.stage.canvas.width, this.el.stage.canvas.height);
                this.updatePositions();

                var screenMargin = this._getScreenMargin();
                this._position = {
                    x: (Math.random() * (this._limits.x.end - screenMargin * 2)) + screenMargin,
                    y: (Math.random() * (this._limits.y.end - screenMargin * 2)) + screenMargin
                };
            },

            tick: function() {
                this.updatePositions();

                var screenMargin = this._getScreenMargin();
                var limits = this._limits;
                var position = this._position;

                var baseAngle = this.angle;
                if (this.targetAngle !== null) {
                    baseAngle = this.targetAngle;
                }

                if (
                    position.x < limits.x.start + screenMargin &&
                    Math.cos(baseAngle) < 0
                ) {
                    this.targetAngle = Math.PI - baseAngle;
                } else if (
                    position.x > limits.x.end - screenMargin &&
                    Math.cos(baseAngle) > 0
                ) {
                    this.targetAngle = Math.PI - baseAngle;
                }

                if (
                    position.y < limits.y.start + screenMargin &&
                    Math.sin(baseAngle) < 0
                ) {
                    this.targetAngle = (Math.PI * 2) - baseAngle;
                } else if (
                    position.y > limits.y.end - screenMargin &&
                    Math.sin(baseAngle) > 0
                ) {
                    this.targetAngle = (Math.PI * 2) - baseAngle;
                }

                if (this.targetAngle !== null) {
                    if ((this.targetAngle - this.angle) > this.rotationSpeedRad) {
                        this.angle += this.rotationSpeedRad;
                    } else if ((this.targetAngle - this.angle) < 0 - this.rotationSpeedRad) {
                        this.angle -= this.rotationSpeedRad;
                    } else {
                        this.targetAngle = null;
                    }
                }

                var speed = this._getSpeed();
                var dx = Math.cos(this.angle) * speed;
                var dy = Math.sin(this.angle) * speed;

                position.x += dx;
                position.y += dy;

                this._step++;
                if (this._step % 6 === 0) {
                    this.addPaw();
                }

                for (var i = 0; i < this._points.length; i++) {
                    this._points[i].alpha -= (1 / 40);
                }

                var tmppoints = [];
                for (i = 0; i < this._points.length; i++) {
                    if (this._points[i].alpha > 0) {
                        tmppoints.push(this._points[i]);
                    }
                }
                this._points = tmppoints;

                return true;
            },

            updatePositions: function() {
                var bounds = this.el.getBounds();
                this.loadingText.x = bounds.width / 2;
                this.loadingText.y = bounds.height / 2;

                if (this.versionText) {
                    this.versionText.x = bounds.width - 10;
                    this.versionText.textAlign = 'right';
                    this.versionText.y = bounds.height - 20;
                }
            },

            stop: function() {

            },

            start: function() {

            },

            addPaw : function () {

                this._flipper = !this._flipper;

                var ox = 10;
                if (this._flipper) {
                    ox *= -1;
                }

                var pawImage = new createjs.Bitmap(img);
                var atan = this.angle;

                pawImage.regX = pawsize.width / 2;
                pawImage.regY = pawsize.height / 2;

                pawImage.x = this._position.x + (Math.cos(atan + Math.PI / 2) * ox);
                pawImage.y = this._position.y + (Math.sin(atan + Math.PI / 2) * ox);

                pawImage.scaleX = pawsize.width / img.width;
                pawImage.scaleY = pawsize.height / img.height;

                pawImage.rotation = (atan + (Math.PI / 2)) * (180 / Math.PI);

                this.el.addChild(pawImage);
                this._points.push(pawImage);
            },

            /**
             * @param percentage Between 0 and 1
             */
            setProgress: function (percentage) {
                percentage = Math.floor(percentage * 100);

                this.loadingText.text = 'Loading\n' + percentage + '%';
                this.loadingText.cache(-100, -100, 200, 200);
            },

        });
    }
);
