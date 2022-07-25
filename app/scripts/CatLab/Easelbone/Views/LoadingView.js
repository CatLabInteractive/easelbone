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

        var dx = Math.random();
        var dy = 1 - dx;

        var speed = 10;

        dx *= speed;
        dy *= speed;

        var points = [];
        var flipper = false;

        return Base.extend({

            initialize: function(options) {
                this.gameVersion = options.gameVersion;
                this.dRotation = 0.0;
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

                this.versionText = new createjs.Text('v' + this.gameVersion, '12px monospace', '#ffffff');
                this.el.addChild(this.versionText);

                this.versionText.cache(-100, 0, 100, 200);
                this.loadingText.cache(-100, 0, 100, 200);

                this.el.setBounds(0, 0, this.el.stage.canvas.width, this.el.stage.canvas.height);
                this.updatePositions();

                position = {
                    x: Math.random() * limits.x.end,
                    y: Math.random() * limits.y.end
                };

                /*
                this.versionText = new createjs.Text('v1.0.0', '12px monospace', '#ffffff');
                this.el.addChild(this.versionText);*/
            },

            tick: function() {
                this.updatePositions();

                position.x += dx;
                position.y += dy;

                if (position.x < limits.x.start) {
                    dx *= -1;
                }

                if (position.x > limits.x.end) {
                    dx *= -1;
                }

                if (position.y < limits.y.start) {
                    dy *= -1;
                }

                if (position.y > limits.y.end) {
                    dy *= -1;
                }

                step ++;
                if (step % 6 === 0) {
                    this.addPaw();
                }


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
                this.loadingText.x = (this.el.getBounds().width / 2) - 25;
                this.loadingText.y = this.el.getBounds().height / 2;

                this.versionText.x = this.el.getBounds().width - 60;
                this.versionText.y = this.el.getBounds().height - 20;
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
                var atan = Math.atan2(dy, dx);

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
