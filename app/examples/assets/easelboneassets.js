(function (lib, img, cjs) {

var p; // shortcut to reference prototypes

// library properties:
lib.properties = {
	width: 800,
	height: 600,
	fps: 24,
	color: "#FFFFFF",
	manifest: []
};



// symbols:



(lib.PointerInactive = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#320B1F").s().p("AjQiRIENALICfCGIiTCHIkkALg");

	this.addChild(this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-22,-14.7,44.1,29.4);


(lib.PointerActive = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#006633").s().p("AjQiRIENALICfCGIiTCHIkkALg");

	this.addChild(this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-22,-14.7,44.1,29.4);


(lib.Pointer = function(mode,startPosition,loop) {
if (loop == null) { loop = false; }	this.initialize(mode,startPosition,loop,{Up:0,Over:1,Down:2,Out:3});

	// Layer 1
	this.instance = new lib.PointerInactive("synched",0);
	this.instance.setTransform(14.4,19.1,0.639,0.774,90,0,0,7.8,-3.9);

	this.instance_1 = new lib.PointerActive("synched",0);
	this.instance_1.setTransform(14.4,19.1,0.639,0.774,90,0,0,7.8,-3.9);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance}]}).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).to({state:[{t:this.instance_1}]},1).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,22.8,28.2);


(lib.Slider = function(mode,startPosition,loop) {
if (loop == null) { loop = false; }	this.initialize(mode,startPosition,loop,{"Up":0,"Over":1,"Down":2,"Out":3});

	// timeline functions:
	this.frame_0 = function() {
		if (typeof (this.setValue) == 'undefined') {
			this.setValue = function (percentage) {
				
				var width = 300;
				var margin = 35;
				
				this.pointer.x = margin + (percentage * width);
			};
		}
		
		this.pointer.gotoAndStop ('Up');
		
		this.stop ();
	}
	this.frame_1 = function() {
		this.stop ();
		this.pointer.gotoAndStop ('Over');
	}
	this.frame_2 = function() {
		this.stop ();
		this.pointer.gotoAndStop ('Down');
	}
	this.frame_3 = function() {
		this.stop ();
		this.pointer.gotoAndStop ('Out');
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1).call(this.frame_2).wait(1).call(this.frame_3).wait(1));

	// Line
	this.pointer = new lib.Pointer();
	this.pointer.setTransform(34,19,1,1,0,0,0,11.4,14.1);

	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#320B1F").ss(4).p("AgY4mMAAxAxN");
	this.shape.setTransform(186,26.5,1.113,1.111,-90,0,0,0.1,0);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#320B1F").s().p("AgnAoQgQgRAAgXQAAgWAQgRQARgQAWAAQAXAAARAQQAQARAAAWQAAAXgQARQgRAQgXAAQgWAAgRgQg");
	this.shape_1.setTransform(9.6,31.4,1.694,1.694,-90);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#320B1F").s().p("AgkAlQgQgPAAgWQAAgUAQgQQAPgQAVAAQAVAAAQAQQAQAQAAAUQAAAWgQAPQgQAQgVAAQgVAAgPgQg");
	this.shape_2.setTransform(370.1,24,1.694,1.694,-90);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1},{t:this.shape},{t:this.pointer}]}).to({state:[{t:this.shape_2},{t:this.shape_1},{t:this.shape},{t:this.pointer}]},1).to({state:[{t:this.shape_2},{t:this.shape_1},{t:this.shape},{t:this.pointer}]},1).to({state:[{t:this.shape_2},{t:this.shape_1},{t:this.shape},{t:this.pointer}]},1).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,4.9,379.1,36.1);


(lib.ExampleSettingsView = function() {
	this.initialize();

	// Layer 1
	this.text = new cjs.Text("Slider 2", "20px 'Times New Roman'", "#320B1F");
	this.text.lineHeight = 22;
	this.text.lineWidth = 100;
	this.text.setTransform(35.8,94);

	this.slider2 = new lib.Slider();
	this.slider2.setTransform(416.8,102,1,1,0,0,0,189.6,22.9);

	this.text_1 = new cjs.Text("Slider 1", "20px 'Times New Roman'", "#320B1F");
	this.text_1.lineHeight = 22;
	this.text_1.lineWidth = 100;
	this.text_1.setTransform(36,44);

	this.slider1 = new lib.Slider();
	this.slider1.setTransform(417,52,1,1,0,0,0,189.6,22.9);

	this.addChild(this.slider1,this.text_1,this.slider2,this.text);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(35.8,34,570.8,86.1);


// stage content:
(lib.easelboneassets = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.ExampleSettingsView();
	this.instance.setTransform(297,43,1,1,0,0,0,296.1,43);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(436.6,334,570.8,86.1);

})(lib = lib||{}, images = images||{}, createjs = createjs||{});
var lib, images, createjs;