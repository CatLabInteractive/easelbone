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



(lib.TextPlaceholderBackground = function() {
	this.initialize();

	// Laag 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FF00FF").s().p("AnzHzIAAvmIPmAAIAAPmg");
	this.shape.setTransform(50,50);

	this.addChild(this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,100,100);


(lib.Marker = function() {
	this.initialize();

}).prototype = p = new cjs.Container();
p.nominalBounds = null;


(lib.PointerInactive = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#320B1F").s().p("AjQiRIENALICfCGIiTCHIkkALg");
	this.shape.setTransform(-22,0);

	this.addChild(this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-44,-14.7,44.1,29.4);


(lib.PointerActive = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#006633").s().p("AjQiRIENALICfCGIiTCHIkkALg");
	this.shape.setTransform(-22,0.1);

	this.addChild(this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-44,-14.6,44.1,29.4);


(lib.SelectboxArrow = function(mode,startPosition,loop) {
if (loop == null) { loop = false; }	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		this.gotoAndStop(1);
	}
	this.frame_2 = function() {
		this.stop();
	}
	this.frame_3 = function() {
		this.gotoAndStop(3);
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1).call(this.frame_2).wait(1).call(this.frame_3).wait(1));

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FF873E").s().p("AhiA3IBdhtIBoBtg");
	this.shape.setTransform(33.6,18.9,1.97,1.97);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FF6000").s().p("AhiA3IBdhtIBoBtg");
	this.shape_1.setTransform(33.6,18.9,1.97,1.97);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape}]}).to({state:[]},1).to({state:[{t:this.shape_1}]},1).to({state:[]},1).wait(1));

	// Layer 2
	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("rgba(89,34,48,0)").s().p("AlTCvIAAldIKnAAIAAFdg");
	this.shape_2.setTransform(34,17.5);

	this.timeline.addTween(cjs.Tween.get(this.shape_2).to({_off:true},1).wait(3));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,68,35);


(lib.Checkbox = function(mode,startPosition,loop) {
if (loop == null) { loop = false; }	this.initialize(mode,startPosition,loop,{Up:0,Over:1,Down:2,Hit:3});

	// timeline functions:
	this.frame_0 = function() {
		this.stop ();
	}
	this.frame_1 = function() {
		this.stop ();
	}
	this.frame_2 = function() {
		this.stop ();
	}
	this.frame_3 = function() {
		this.stop ();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1).call(this.frame_2).wait(1).call(this.frame_3).wait(1));

	// Layer 2
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FF873C").s().p("AizAVQgagpgVgoIgXgsIADgQIADgEQAFgEAJgCQAKAZATAkQANAYASAdQAxBQAOAeQALg8CFhhIAIgGQCGhhA7AVIAGgCQAEACABAPQgmAPg/ApQgpAcgpAiQhQBChRBfQgngxguhPg");
	this.shape.setTransform(25,23);
	this.shape._off = true;

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(2).to({_off:false},0).wait(2));

	// Layer 1
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#8B504F").ss(5).p("ABfheIAAC9Ii9AAIAAi9g");
	this.shape_1.setTransform(19.2,19.2,2.023,2.023);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#592230").s().p("AheBeIAAi8IC9AAIAAC8g");
	this.shape_2.setTransform(19.2,19.2,2.023,2.023);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#FFC39F").s().p("AheBeIAAi8IC9AAIAAC8g");
	this.shape_3.setTransform(19.2,19.2,2.023,2.023);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f().s("#8B504F").ss(5).p("ADAi/IAAF/Il/AAIAAl/g");
	this.shape_4.setTransform(-13.2,12.3,1,1,0,0,0,-32.4,-6.9);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1,p:{x:19.2,y:19.2}}]}).to({state:[{t:this.shape_3,p:{x:19.2,y:19.2}},{t:this.shape_1,p:{x:19.2,y:19.2}}]},1).to({state:[{t:this.shape_2},{t:this.shape_1,p:{x:19.2,y:19.2}}]},1).to({state:[{t:this.shape_4},{t:this.shape_3,p:{x:19.4,y:18.9}},{t:this.shape_1,p:{x:19.4,y:18.9}}]},1).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-2.5,-2.5,43.5,43.4);


(lib.CogVector = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#282A1F").s().p("Ag/MAQgehhgLhlQgbgEgvgOIgkgNQgUgIgOgIQhLBKhXA3QgsgbgwgqQAkhoAvhQQgdgegUgdQgKgLgLgUIgUghQhpAQhlgGQgVg1gNg5QBOg4BhgtQgCgPgBgXIgCglQABgxAEgZQhggzhMg/QAIgiAchLQBoABBhAVQAZgtAQgTQAUgdAdgeQgshWgdhrQA9gwAhgTQBQA8BGBMQAOgIAUgIIAkgNQAvgNAbgFQAShsAlhbQAwgEBBAFQAeBhALBlQAbAFAvANIAkANQAUAIAOAIQBLhKBXg3QAsAbAwAqQgkBogvBQQAdAeAUAdQAQATAZAtQBpgQBlAGQAWA5AMA1QhOA4hhAtQAEAZABAxIgCAlQgBAXgCAPQBgAzBMA/QgHAigdBLQhogBhhgVQgZAtgQATQgUAdgdAeQAsBWAdBrQg9AwghATQhQg8hGhMQgOAIgUAIIgkANQgvAOgbAEQgSBsglBbQgXACgaAAQgdAAgjgDgAhtlTQg3ASgtAhQgvAiggAtQhDBagCB3QACB4BDBaQAgAtAvAiQAtAhA3ASQA1ASA4AAQA5AAA1gSQA3gSAtghQAvgiAggtQBDhaACh4QgCh3hDhaQgggtgvgiQgtghg3gSQg1gRg5AAQg4AAg1ARg");

	this.addChild(this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-75,-77.1,150.1,154.3);


(lib.TextPlaceholder = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.TextPlaceholderBackground();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,100,100);


(lib.Pointer = function(mode,startPosition,loop) {
if (loop == null) { loop = false; }	this.initialize(mode,startPosition,loop,{"Up":0,"Over":1,"Down":2,Out:3});

	// Layer 1
	this.instance = new lib.PointerInactive("synched",0,false);
	this.instance.setTransform(3,5,0.639,0.774,90,0,0,7.8,-3.9);

	this.instance_1 = new lib.PointerActive("synched",0);
	this.instance_1.setTransform(3,5,0.639,0.774,90,0,0,7.8,-3.9);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance}]}).to({state:[{t:this.instance_1,p:{x:3,y:5}}]},1).to({state:[{t:this.instance_1,p:{x:3,y:5}}]},1).to({state:[{t:this.instance_1,p:{x:3.1,y:5.1}}]},1).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-11.4,-28.1,22.8,28.2);


(lib.SelectboxButton = function() {
	this.initialize();

	// Layer 1
	this.down = new lib.SelectboxArrow();
	this.down.setTransform(68.1,74.6,1,1,-180);

	this.up = new lib.SelectboxArrow();
	this.up.setTransform(20.7,11.6,1,1,0,0,0,19.6,10.9);

	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#592230").ss(5).p("AiuC+IAAl6IFdAAIAAF6g");
	this.shape.setTransform(34.6,37.4,1.97,1.97);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#8B504F").s().p("AitC9IAAl6IFcAAIAAF6g");
	this.shape_1.setTransform(34.6,37.4,1.97,1.97);

	this.addChild(this.shape_1,this.shape,this.up,this.down);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-2.4,-2.5,74,79.9);


(lib.SelectBox = function(mode,startPosition,loop) {
if (loop == null) { loop = false; }	this.initialize(mode,startPosition,loop,{"Up":0,"Over":1,"Down":2,"Hit":3});

	// timeline functions:
	this.frame_0 = function() {
		this.stop ();
	}
	this.frame_1 = function() {
		this.stop ();
	}
	this.frame_2 = function() {
		this.stop ();
	}
	this.frame_3 = function() {
		this.stop ();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1).call(this.frame_2).wait(1).call(this.frame_3).wait(1));

	// Text
	this.text = new lib.TextPlaceholder();
	this.text.setTransform(1.1,7.1,2.24,0.677,0,0,0,0.5,1.1);

	this.timeline.addTween(cjs.Tween.get(this.text).wait(4));

	// Layer 1
	this.spnButton = new lib.SelectboxButton();
	this.spnButton.setTransform(263.2,37.4,1,1,0,0,0,34.5,37.4);
	new cjs.ButtonHelper(this.spnButton, 0, 1, 1);

	this.shape = new cjs.Shape();
	this.shape.graphics.rf(["#320B1F","#190412"],[0.004,1],0,0,0,0,0,20.3).s().p("AjVC+IAAl7IGsAAIAAF7g");
	this.shape.setTransform(114.9,39.5,5.348,1.789);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.rf(["#329343","#190412"],[0.004,1],0,0,0,0,0,20.3).s().p("AjVC+IAAl7IGsAAIAAF7g");
	this.shape_1.setTransform(114.9,39.5,5.348,1.789);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.rf(["#32933C","#190412"],[0.004,1],0,0,0,0,0,20.3).s().p("AjVC+IAAl7IGsAAIAAF7g");
	this.shape_2.setTransform(114.9,39.5,5.348,1.789);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape},{t:this.spnButton}]}).to({state:[{t:this.shape_1},{t:this.spnButton}]},1).to({state:[{t:this.shape},{t:this.spnButton}]},1).to({state:[{t:this.shape_2},{t:this.spnButton}]},1).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-0.1,-2.5,300.4,79.9);


(lib.Button = function(mode,startPosition,loop) {
if (loop == null) { loop = false; }	this.initialize(mode,startPosition,loop,{"Over":1,"Over-NoAnim":6,"Up":7,"Up-NoAnim":11,"Down":12,"Hit":13});

	// timeline functions:
	this.frame_0 = function() {
		this.stop ();
	}
	this.frame_6 = function() {
		this.stop ();
	}
	this.frame_11 = function() {
		this.stop ();
	}
	this.frame_12 = function() {
		this.stop ();
	}
	this.frame_13 = function() {
		this.stop ();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(6).call(this.frame_6).wait(5).call(this.frame_11).wait(1).call(this.frame_12).wait(1).call(this.frame_13).wait(1));

	// TextLabel
	this.text = new lib.TextPlaceholder();
	this.text.setTransform(13.7,13.7,1.739,0.494,0,0.4,0.5,0.1,0.8);

	this.timeline.addTween(cjs.Tween.get(this.text).wait(1).to({scaleX:1.89,rotation:0.4,skewX:0,skewY:0,x:5.7},0).to({scaleY:0.57,rotation:5.4,x:8.7,y:1.7},5).to({scaleY:0.54,rotation:5.2,x:8.4,y:2},1).to({scaleY:0.49,rotation:0.4,x:5.7,y:13.7},4).wait(1).to({rotation:0.4},0).wait(2));

	// Layer 3
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#0F0609").s().p("A42D+Ii+oDMA3pgAIIkyIbg");
	this.shape.setTransform(103.3,39.2,0.566,1);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#0F0609").s().p("AxBE1IiBp0MAmGgAKIjSKTg");
	this.shape_1.setTransform(103.4,39.1,0.821,0.821);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#0F0609").s().p("AuwDkIhboZMAgWABDIjGIog");
	this.shape_2.setTransform(104.2,39.3);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#0F0609").s().p("AvXDTIhOoqMAhLAB9IjaIyg");
	this.shape_3.setTransform(104.8,39);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#0F0609").s().p("AvzDHIhFo2MAhxACmIjpI5g");
	this.shape_4.setTransform(105.2,38.9);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#0F0609").s().p("AwEDAIhAo+MAiJADAIjyI9g");
	this.shape_5.setTransform(105.5,38.7);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#0F0507").s().p("AvmDNIhKoxMAhhACUIjiI1g");
	this.shape_6.setTransform(105,38.9);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#0F0305").s().p("AvDDbIhVohMAgxABgIjRItg");
	this.shape_7.setTransform(104.5,39.2);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#0F0202").s().p("AugDrIhgoTMAgBAAsIi+Ikg");
	this.shape_8.setTransform(103.9,39.4);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#0F0000").s().p("At9D+IhroDIfRgIIisIbg");
	this.shape_9.setTransform(103.4,39.2);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#990000").s().p("AxBE1IiBp0MAmGgAKIjSKTg");
	this.shape_10.setTransform(103.4,39.1,0.821,0.821);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#0F51B8").s().p("AxBE1IiBp0MAmGgAKIjSKTg");
	this.shape_11.setTransform(103.4,39.1,0.821,0.821);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape}]}).to({state:[{t:this.shape_1,p:{scaleX:0.821,scaleY:0.821,rotation:0,x:103.4,y:39.1}}]},1).to({state:[{t:this.shape_2}]},1).to({state:[{t:this.shape_3}]},1).to({state:[{t:this.shape_4}]},1).to({state:[{t:this.shape_5}]},1).to({state:[{t:this.shape_1,p:{scaleX:0.903,scaleY:0.903,rotation:5.4,x:102.8,y:39.2}}]},1).to({state:[{t:this.shape_1,p:{scaleX:0.903,scaleY:0.903,rotation:5.4,x:102.8,y:39.2}}]},1).to({state:[{t:this.shape_6}]},1).to({state:[{t:this.shape_7}]},1).to({state:[{t:this.shape_8}]},1).to({state:[{t:this.shape_9}]},1).to({state:[{t:this.shape_10}]},1).to({state:[{t:this.shape_11}]},1).wait(1));

	// Layer 2
	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f().s("#0F0609").ss(2).p("ATyluMgnlAAPIB4LOMAi0gAUg");
	this.shape_12.setTransform(103.9,39.4,0.826,0.821,0,0,0,-0.2,0);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f().s("#0A6006").ss(2).p("Aw0kaMAhpgAsIiVJgI9lAtg");
	this.shape_13.setTransform(103.5,39.3,1,1,0,0,0,0.1,0);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f().s("#05A503").ss(2).p("AxSkVMAikgBFIiSJyI+ZBDg");
	this.shape_14.setTransform(103.1,39.2,1,1,0,0,0,0.1,0);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f().s("#02D701").ss(2).p("AxmkRMAjNgBYIiQKAI+9BTg");
	this.shape_15.setTransform(102.7,39.2,1,1,0,0,0,0.1,0);

	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.f().s("#01F500").ss(2).p("AxykPMAjlgBiIiOKHI/UBdg");
	this.shape_16.setTransform(102.5,39.1,1,1,0,0,0,0.1,0);

	this.shape_17 = new cjs.Shape();
	this.shape_17.graphics.f().s("#00FF00").ss(2).p("ATyluMgnlAAPIB4LOMAi0gAUg");
	this.shape_17.setTransform(103.4,39.4,0.903,0.903,-2.2,0,0,-0.2,0);

	this.shape_18 = new cjs.Shape();
	this.shape_18.graphics.f().s("#0FFF00").ss(2).p("ATyluMgnlAAPIB4LOMAi0gAUg");
	this.shape_18.setTransform(103.4,39.4,0.903,0.903,-2.2,0,0,-0.2,0);

	this.shape_19 = new cjs.Shape();
	this.shape_19.graphics.f().s("#0FC102").ss(2).p("AxdkTMAi6gBPIiQJ6I+uBMg");
	this.shape_19.setTransform(102.9,39.2,1,1,0,0,0,0.1,0);

	this.shape_20 = new cjs.Shape();
	this.shape_20.graphics.f().s("#0F8305").ss(2).p("AxDkXMAiGgA5IiTJpI9/A4g");
	this.shape_20.setTransform(103.3,39.3,1,1,0,0,0,0.1,0);

	this.shape_21 = new cjs.Shape();
	this.shape_21.graphics.f().s("#0F4407").ss(2).p("AwpkbMAhSgAjIiVJZI9SAkg");
	this.shape_21.setTransform(103.7,39.3,1,1,0,0,0,0.1,0);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_12}]}).to({state:[{t:this.shape_12}]},1).to({state:[{t:this.shape_13}]},1).to({state:[{t:this.shape_14}]},1).to({state:[{t:this.shape_15}]},1).to({state:[{t:this.shape_16}]},1).to({state:[{t:this.shape_17}]},1).to({state:[{t:this.shape_18}]},1).to({state:[{t:this.shape_19}]},1).to({state:[{t:this.shape_20}]},1).to({state:[{t:this.shape_21}]},1).to({state:[{t:this.shape_12}]},1).to({state:[{t:this.shape_12}]},1).to({state:[{t:this.shape_12}]},1).wait(1));
	this.timeline.addTween(cjs.Tween.get(this.shape_12).wait(1).to({scaleX:0.82},0).to({_off:true},1).wait(9).to({_off:false},0).wait(3));

	// Layer 1
	this.shape_22 = new cjs.Shape();
	this.shape_22.graphics.f("#592230").s().p("A0sFHIAysmMAonACoIloMXg");
	this.shape_22.setTransform(109.6,39.4,0.826,0.821);

	this.shape_23 = new cjs.Shape();
	this.shape_23.graphics.f("#592230").s().p("AxqECIA4qsMAidAC7Ik/Kag");
	this.shape_23.setTransform(109.5,39.1);

	this.shape_24 = new cjs.Shape();
	this.shape_24.graphics.f("#592230").s().p("AyMD5IBDq8MAjXADgIlTKng");
	this.shape_24.setTransform(109.6,38.9);

	this.shape_25 = new cjs.Shape();
	this.shape_25.graphics.f("#592230").s().p("AylD0IBMrKMAj/AD8IlfKxg");
	this.shape_25.setTransform(109.5,38.8);

	this.shape_26 = new cjs.Shape();
	this.shape_26.graphics.f("#592230").s().p("Ay0DwIBRrRMAkYAEMIlnK3g");
	this.shape_26.setTransform(109.5,38.7);

	this.shape_27 = new cjs.Shape();
	this.shape_27.graphics.f("#592230").s().p("AyaD2IBIrEMAjtADwIlZKsg");
	this.shape_27.setTransform(109.6,38.9);

	this.shape_28 = new cjs.Shape();
	this.shape_28.graphics.f("#592230").s().p("Ax7D9IA9q0MAi7ADOIlKKhg");
	this.shape_28.setTransform(109.6,39.1);

	this.shape_29 = new cjs.Shape();
	this.shape_29.graphics.f("#592230").s().p("AxdEFIA0qlMAiGACsIk3KVg");
	this.shape_29.setTransform(109.6,39.2);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_22}]}).to({state:[{t:this.shape_22}]},1).to({state:[{t:this.shape_23}]},1).to({state:[{t:this.shape_24}]},1).to({state:[{t:this.shape_25}]},1).to({state:[{t:this.shape_26}]},1).to({state:[{t:this.shape_22}]},1).to({state:[{t:this.shape_22}]},1).to({state:[{t:this.shape_27}]},1).to({state:[{t:this.shape_28}]},1).to({state:[{t:this.shape_29}]},1).to({state:[{t:this.shape_22}]},1).to({state:[{t:this.shape_22}]},1).to({state:[{t:this.shape_22}]},1).wait(1));
	this.timeline.addTween(cjs.Tween.get(this.shape_22).wait(1).to({scaleX:0.82,x:109.5},0).to({_off:true},1).wait(4).to({_off:false,scaleX:0.9,scaleY:0.9,rotation:3,x:109.6},0).wait(1).to({_off:true},1).wait(3).to({_off:false,scaleX:0.82,scaleY:0.82,rotation:0,x:109.5},0).wait(3));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1.8,0,220.9,78.8);


(lib.Cog = function(mode,startPosition,loop) {
if (loop == null) { loop = false; }	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_14 = function() {
		this.gotoAndPlay (1);
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).wait(14).call(this.frame_14).wait(1));

	// Cog
	this.instance = new lib.CogVector("synched",0);
	this.instance.setTransform(75.1,77.1);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({rotation:36},14).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,150.2,154.3);


(lib.Slider = function(mode,startPosition,loop) {
if (loop == null) { loop = false; }	this.initialize(mode,startPosition,loop,{"Up":0,"Over":1,"Down":2,"Hit":3});

	// timeline functions:
	this.frame_0 = function() {
		this.pointer.gotoAndStop('Up');
		this.stop();
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

	// Markers
	this.pointer = new lib.Pointer();
	this.pointer.setTransform(35,41.1,1,1,0,0,0,0,2);

	this.maximum = new lib.Marker();
	this.maximum.setTransform(342,35);

	this.minimum = new lib.Marker();
	this.minimum.setTransform(35,41);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.minimum},{t:this.maximum},{t:this.pointer}]}).wait(4));

	// Line
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#320B1F").ss(4).p("AgY4mMAAxAxN");
	this.shape.setTransform(186,26.5,1.113,1.111,-90,0,0,0.1,0);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#320B1F").s().p("AgnAoQgQgRAAgXQAAgWAQgRQARgQAWAAQAXAAARAQQAQARAAAWQAAAXgQARQgRAQgXAAQgWAAgRgQg");
	this.shape_1.setTransform(9.6,31.4,1.694,1.694,-90);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#320B1F").s().p("AgkAlQgQgPAAgWQAAgUAQgQQAPgQAVAAQAVAAAQAQQAQAQAAAUQAAAWgQAPQgQAQgVAAQgVAAgPgQg");
	this.shape_2.setTransform(370.1,24,1.694,1.694,-90);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).to({state:[{t:this.shape_2},{t:this.shape_1},{t:this.shape}]},1).to({state:[{t:this.shape_2},{t:this.shape_1},{t:this.shape}]},1).to({state:[{t:this.shape_2},{t:this.shape_1},{t:this.shape}]},1).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,10.9,379.1,30.1);


(lib.ExampleSettingsView = function() {
	this.initialize();

	// Layer 1
	this.selectbox = new lib.SelectBox();
	this.selectbox.setTransform(432.1,295.2,1,1,0,0,0,154.8,39.8);

	this.instance = new lib.Cog();
	this.instance.setTransform(753.2,44.1,0.466,0.466,0,0,0,75,77.2);

	this.text = new cjs.Text("This is another checkbox.", "20px 'Times New Roman'");
	this.text.lineHeight = 22;
	this.text.lineWidth = 386;
	this.text.setTransform(104.1,202);

	this.text_1 = new cjs.Text("This is a checkbox.", "20px 'Times New Roman'");
	this.text_1.lineHeight = 22;
	this.text_1.lineWidth = 386;
	this.text_1.setTransform(104,145.3);

	this.checkbox2 = new lib.Checkbox();
	this.checkbox2.setTransform(50.2,221,1,1,0,0,0,13.9,19.2);

	this.checkbox1 = new lib.Checkbox();
	this.checkbox1.setTransform(49.7,161.8,1,1,0,0,0,13.9,19.2);

	this.button2 = new lib.Button();
	this.button2.setTransform(413.1,393,1,1,0,0,0,108.6,39.4);

	this.button1 = new lib.Button();
	this.button1.setTransform(152.1,393,1,1,0,0,0,108.6,39.4);

	this.text_2 = new cjs.Text("Slider 2", "20px 'Times New Roman'", "#320B1F");
	this.text_2.lineHeight = 22;
	this.text_2.lineWidth = 100;
	this.text_2.setTransform(35.8,94);

	this.slider2 = new lib.Slider();
	this.slider2.setTransform(416.8,102,1,1,0,0,0,189.6,22.9);

	this.text_3 = new cjs.Text("Slider 1", "20px 'Times New Roman'", "#320B1F");
	this.text_3.lineHeight = 22;
	this.text_3.lineWidth = 100;
	this.text_3.setTransform(36,44);

	this.slider1 = new lib.Slider();
	this.slider1.setTransform(417,52,1,1,0,0,0,189.6,22.9);

	this.addChild(this.slider1,this.text_3,this.slider2,this.text_2,this.button1,this.button2,this.checkbox1,this.checkbox2,this.text_1,this.text,this.instance,this.selectbox);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(33.3,8.1,754.9,424.4);


// stage content:



(lib.easelboneassets = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.ExampleSettingsView();
	this.instance.setTransform(297,43,1,1,0,0,0,296.1,43);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(434.2,308.1,754.9,424.4);

})(lib = lib||{}, images = images||{}, createjs = createjs||{});
var lib, images, createjs;