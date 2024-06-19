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

        var step = 0;

        var pawsize = {
            'width': 20,
            'height': 20
        };

        var limits = {
            'x': {
                'start': 0,
                'end': 100
            },
            'y': {
                'start': 0,
                'end': 100
            }
        };

        var position = {
            'x': limits.x.end / 2,
            'y': limits.y.end / 2
        };

        var points = [];
        var flipper = false;

        return Base.extend({

            initialize: function(options) {

                this.gameVersion = null;
                if (typeof(options.gameVersion) !== 'undefined') {
                    this.gameVersion = options.gameVersion;
                }

                this.dRotation = 0.0;

                this.speed = 10;
                this.angle = Math.random() * Math.PI * 2;
                this.targetAngle = null;

                this.flippedX = false;
                this.flippedY = false;

                this.rotationSpeedRad = 0.2;
                this.screenMargin = 50;
            },

            render: function() {

                limits = {
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

                position = {
                    x: (Math.random() * (limits.x.end - this.screenMargin * 2)) + this.screenMargin,
                    y: (Math.random() * (limits.y.end - this.screenMargin * 2)) + this.screenMargin
                };
            },

            tick: function() {
                this.updatePositions();

                let baseAngle = this.angle;
                if (this.targetAngle !== null) {
                    baseAngle = this.targetAngle;
                }

                if (
                    position.x < limits.x.start + this.screenMargin &&
                    Math.cos(baseAngle) < 0
                ) {
                    this.targetAngle = Math.PI - baseAngle;
                } else if (
                    position.x > limits.x.end - this.screenMargin &&
                    Math.cos(baseAngle) > 0
                ) {
                    this.targetAngle = Math.PI - baseAngle;
                }

                if (
                    position.y < limits.y.start + this.screenMargin &&
                    Math.sin(baseAngle) < 0
                ) {
                    this.targetAngle = (Math.PI * 2) - baseAngle;
                } else if (
                    position.y > limits.y.end - this.screenMargin &&
                    Math.sin(baseAngle) > 0
                ) {
                    this.targetAngle = (Math.PI * 2) - baseAngle;
                }

                if (this.targetAngle !== null) {
                    //this.targetAngle = (this.targetAngle + Math.PI * 2) % (Math.PI * 2);

                    if ((this.targetAngle - this.angle) > this.rotationSpeedRad) {
                        this.angle += this.rotationSpeedRad;
                    } else if ((this.targetAngle - this.angle) < 0 - this.rotationSpeedRad) {
                        this.angle -= this.rotationSpeedRad;
                    } else {
                        this.targetAngle = null;
                    }
                }

                var dx = Math.cos(this.angle) * this.speed;
                var dy = Math.sin(this.angle) * this.speed;

                position.x += dx;
                position.y += dy;

                step ++;
                if (step % 6 === 0) {
                    this.addPaw();
                }

                // Debug
                /*
                var g = new createjs.Graphics();
                g.setStrokeStyle(1);
                g.beginStroke("#000000");
                g.beginFill("yellow");
                g.drawCircle(0,0,3);

                var shape = new createjs.Shape(g);
                shape.x = position.x;
                shape.y = position.y;
                this.el.addChild(shape);

                 */

                for (var i = 0; i < points.length; i++) {
                    points[i].alpha -= (1 / 40);
                }

                var tmppoints = [];
                for (i = 0; i < points.length; i++) {
                    if (points[i].alpha > 0) {
                        tmppoints.push(points[i]);
                    }
                }
                points = tmppoints;

                return true;
            },

            updatePositions: function() {
                this.loadingText.x = this.el.getBounds().width / 2;
                this.loadingText.y = this.el.getBounds().height / 2;

                if (this.versionText) {
                    this.versionText.x = this.el.getBounds().width - 60;
                    this.versionText.y = this.el.getBounds().height - 20;
                }
            },

            stop: function() {

            },

            start: function() {

            },

            addPaw : function () {

                flipper = !flipper;

                var ox = 10;
                if (flipper) {
                    ox *= -1;
                }

                /*
                var g = new createjs.Graphics();
                g.setStrokeStyle(1);
                g.beginStroke("#000000");
                g.beginFill("yellow");
                g.drawCircle(0,0,3);

                var shape = new createjs.Shape(g);
                shape.x = position.x;
                shape.y = position.y;
                this.el.addChild(shape);
                 */

                var pawImage = new createjs.Bitmap(img);
                var atan = this.angle;

                pawImage.regX = pawsize.width / 2;
                pawImage.regY = pawsize.height / 2;

                pawImage.x = position.x + (Math.cos(atan + Math.PI / 2) * ox);
                pawImage.y = position.y + (Math.sin(atan + Math.PI / 2) * ox);

                pawImage.scaleX = pawsize.width / img.width;
                pawImage.scaleY = pawsize.height / img.height;

                pawImage.rotation = (atan + (Math.PI / 2)) * (180 / Math.PI);

                this.el.addChild(pawImage);
                points.push(pawImage);
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
