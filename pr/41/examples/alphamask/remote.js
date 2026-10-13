(function (lib, img, cjs) {

var p; // shortcut to reference prototypes

// library properties:
lib.properties = {
	width: 854,
	height: 480,
	fps: 24,
	color: "#FFFFFF",
	manifest: []
};



// symbols:



(lib.TextPlaceholderBackgroundAlternate = function() {
	this.initialize();

	// Laag 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#00FF00").s().p("AnzHzIAAvmIPmAAIAAPmg");
	this.shape.setTransform(50,50);

	this.addChild(this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,100,100);


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


(lib.TextPlaceholderBackground_1 = function() {
	this.initialize();

	// Laag 1
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FF00FF").s().p("AnzHzIAAvmIPmAAIAAPmg");
	this.shape_1.setTransform(50,50);

	this.addChild(this.shape_1);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,100,100);


(lib.Marker_1 = function() {
	this.initialize();

}).prototype = p = new cjs.Container();
p.nominalBounds = null;


(lib.btnScrollUp = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#592230").s().p("AiKBcICDi3ICSC3g");
	this.shape.setTransform(20.3,13.5);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#592230").ss(4).p("ACffhIk9AAMAAAg/BIE9AAg");
	this.shape_1.setTransform(19.7,15.5,1.232,0.077);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#8B504F").s().p("AiefhMAAAg/BIE9AAMAAAA/Bg");
	this.shape_2.setTransform(19.7,15.5,1.232,0.077);

	this.addChild(this.shape_2,this.shape_1,this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-2,-2,43.4,35);


(lib.btnScrollDown = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#592230").s().p("Ahvg9IDfAAIh2B7g");
	this.shape.setTransform(18.3,15.3,1.067,1.213);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#592230").ss(4).p("ACffhIk9AAMAAAg/BIE9AAg");
	this.shape_1.setTransform(19.7,13.5,1.232,0.067,180);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#8B504F").s().p("AiefhMAAAg/BIE9AAMAAAA/Bg");
	this.shape_2.setTransform(19.7,13.5,1.232,0.067,180);

	this.addChild(this.shape_2,this.shape_1,this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-2,-2,43.4,31);


(lib.TextPlaceholderBackground_2 = function() {
	this.initialize();

	// Laag 1
	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FF00FF").s().p("AnzHzIAAvmIPmAAIAAPmg");
	this.shape_2.setTransform(50,50);

	this.addChild(this.shape_2);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,100,100);


(lib.mobile = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.rf(["#320B1F","#190412"],[0.004,1],0,0,0,0,0,6.2).s().p("AgoBNIAAiZIBRAFIgUCUg");
	this.shape.setTransform(37.5,6.5,0.839,0.839);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.rf(["#320B1F","#190412"],[0.004,1],0,0,0,0,0,30.1).s().p("AhPE/IiZp9IHSgkIgbLFg");
	this.shape_1.setTransform(19.6,42.1,0.839,0.839);

	this.addChild(this.shape_1,this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,41,72);


(lib.CloseButton = function() {
	this.initialize();

	// Laag 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#FF873A").ss(3,1,1).p("AADgCIA+A8AADgCIBChCAg5hAIA8A+AhEBFIBHhH");
	this.shape.setTransform(6.7,7.5);

	// Laag 2
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#51232D").s().p("AhaBbIAAi1IC1AAIAAC1g");
	this.shape_1.setTransform(6.8,7.8);

	this.addChild(this.shape_1,this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-2.4,-1.4,18.3,18.3);


(lib.TextPlaceholder = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.TextPlaceholderBackground_2();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,100,100);


(lib.PlaceholderAlternateColor = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.TextPlaceholderBackgroundAlternate();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,100,100);


(lib.Placeholder = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.TextPlaceholderBackground();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,100,100);


(lib.Placeholder_1 = function() {
	this.initialize();

	// Layer 1
	this.instance_1 = new lib.TextPlaceholderBackground_1();
	this.instance_1.setTransform(0,0,0.901,1);

	this.addChild(this.instance_1);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,90.1,100);


(lib.scrollBar = function() {
	this.initialize();

	// Layer 1
	this.bottom = new lib.Marker_1();
	this.bottom.setTransform(10.6,440);

	this.top = new lib.Marker_1();
	this.top.setTransform(11.3,0);

	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("rgba(89,34,48,0)").ss(0.1).p("EACfAiXIk9AAMAAAhEtIE9AAg");
	this.shape.setTransform(16,220);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#8B504F").s().p("EgCeAiXMAAAhEtIE9AAMAAABEtg");
	this.shape_1.setTransform(16,220);

	this.addChild(this.shape_1,this.shape,this.top,this.bottom);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-1,-1,34,442);


(lib.Scrollbar = function() {
	this.initialize();

	// Layer 1
	this.maximum = new lib.Marker_1();
	this.maximum.setTransform(20.1,343.5,1,1,0,0,0,0.1,0);

	this.minimum = new lib.Marker_1();
	this.minimum.setTransform(20,45);

	this.indicator = new lib.scrollBar();
	this.indicator.setTransform(20,88.2,0.813,0.386,0,0,0,15.9,0.3);

	this.down = new lib.btnScrollDown();
	this.down.setTransform(17.9,360.9,1,1.611,0,0,0,17.9,10.8);
	new cjs.ButtonHelper(this.down, 0, 1, 1);

	this.up = new lib.btnScrollUp();
	this.up.setTransform(19.7,21,1,1.338,0,0,0,19.7,15.5);
	new cjs.ButtonHelper(this.up, 0, 1, 1);

	// Layer 2
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#592230").ss(5).p("Ai3C+IAAliIGIAA");
	this.shape.setTransform(18.5,16.7);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#592230").s().p("AjDYDMAAAgwEIABAAIGGAAMAAAAwEg");
	this.shape_1.setTransform(19.7,189.6);

	this.addChild(this.shape_1,this.shape,this.up,this.down,this.indicator,this.minimum,this.maximum);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-2.6,-2.4,44.7,392.7);


(lib.LongButton = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{Over:1,"Over-NoAnim":6,Up:7,"Up-NoAnim":11,Down:12,Hit:13});

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
	this.text = new cjs.Text("Text", "16px 'Myriad Pro'", "#FF873A");
	this.text.name = "text";
	this.text.textAlign = "center";
	this.text.lineHeight = 16;
	this.text.lineWidth = 232;
	this.text.setTransform(132.5,13.6);

	this.text_1 = new lib.TextPlaceholder();
	this.text_1.setTransform(15.5,12,1.741,0.542,0,0,0,0.5,-0.2);
	this.text_1._off = true;

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.text}]}).to({state:[{t:this.text_1}]},1).to({state:[{t:this.text_1}]},5).to({state:[{t:this.text_1}]},1).to({state:[{t:this.text_1}]},4).to({state:[{t:this.text_1}]},1).to({state:[{t:this.text_1}]},1).wait(1));
	this.timeline.addTween(cjs.Tween.get(this.text_1).wait(1).to({_off:false},0).to({regX:0.4,regY:-0.3,scaleY:0.56,rotation:6,x:14,y:1.7},5).wait(1).to({regX:0.5,regY:-0.1,scaleY:0.54,rotation:6.2,x:16.8,y:1.8},0).to({regY:-0.2,rotation:0,x:15.5,y:12},4).wait(3));

	// Layer 3
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#0F0609").s().p("Ay8CaIiRk4MAqagAFIjpFHg");
	this.shape.setTransform(140.2,23.8);

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
	this.shape_12.setTransform(0,6.4,1.113,0.499,0,0,0,-126.8,-35.2);

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
	this.timeline.addTween(cjs.Tween.get(this.shape_12).wait(1).to({regX:-0.2,regY:0,scaleX:0.82,scaleY:0.82,x:103.9,y:39.4},0).to({_off:true},1).wait(9).to({_off:false},0).wait(3));

	// Layer 1
	this.shape_22 = new cjs.Shape();
	this.shape_22.graphics.f("#592230").s().p("A0sFHIAysmMAonACoIloMXg");
	this.shape_22.setTransform(148.6,23.9,1.113,0.499);

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
	this.timeline.addTween(cjs.Tween.get(this.shape_22).wait(1).to({scaleX:0.82,scaleY:0.82,x:109.5,y:39.4},0).to({_off:true},1).wait(4).to({_off:false,scaleX:0.9,scaleY:0.9,rotation:3,x:109.6},0).wait(1).to({_off:true},1).wait(3).to({_off:false,scaleX:0.82,scaleY:0.82,rotation:0,x:109.5},0).wait(3));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1.4,0,297.5,47.9);


(lib.UserModel = function() {
	this.initialize();

	// Laag 1
	this.boundary = new lib.Marker();
	this.boundary.setTransform(82.7,101.3);

	this.picture = new lib.Placeholder();
	this.picture.setTransform(0,0,0.75,0.75);

	this.name = new cjs.Text("User", "15px 'Myriad Pro'", "#FFFFFF");
	this.name.name = "name";
	this.name.textAlign = "center";
	this.name.lineHeight = 17;
	this.name.lineWidth = 71;
	this.name.setTransform(35.5,77.4);

	this.shape = new cjs.Shape();
	this.shape.graphics.f("rgba(0,0,0,0.498)").s().p("Al2F2IAArsILsAAIAALsg");
	this.shape.setTransform(37.5,37.5);

	this.addChild(this.shape,this.name,this.picture,this.boundary);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,75,99.4);


(lib.UserIcon = function() {
	this.initialize();

	// Colors (mask)
	var mask = new cjs.Shape();
	mask._off = true;
	mask.graphics.p("AiVhnIErAAIgODJIjaAFg");
	mask.setTransform(36.6,33.9);

	// PlayerColor
	this.PlayerColor = new lib.Placeholder();
	this.PlayerColor.setTransform(0,0,0.75,0.75);

	this.PlayerColor.mask = mask;

	// Front
	this.instance = new lib.mobile();
	this.instance.setTransform(37,37.6,1,1,0,0,0,20.6,36);

	// Main
	this.boundary = new lib.Marker();
	this.boundary.setTransform(80,80);

	this.addChild(this.boundary,this.instance,this.PlayerColor);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(16.4,1.6,40.9,72);


(lib.UserIconTablet = function() {
	this.initialize();

	// Colors (mask)
	var mask = new cjs.Shape();
	mask._off = true;
	mask.graphics.p("Aj9E0Ighm0IKAgXIAAHWg");
	mask.setTransform(35.5,32);

	// PlayerColor
	this.PlayerColor = new lib.Placeholder();
	this.PlayerColor.setTransform(0,8.8,0.783,0.633);

	this.PlayerColor.mask = mask;

	// Front
	this.shape = new cjs.Shape();
	this.shape.graphics.rf(["#320B1F","#190412"],[0.004,1],0,0,0,0,0,50.6).s().p("AlZEQIgQoZILTgeIgKJPg");
	this.shape.setTransform(39.4,40.6,1.03,1.03);

	// Main
	this.boundary = new lib.Marker();
	this.boundary.setTransform(80,80);

	this.addChild(this.boundary,this.shape,this.PlayerColor);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(2,10.1,74.8,61.2);


(lib.UserIconPhone = function() {
	this.initialize();

	// Colors (mask)
	var mask = new cjs.Shape();
	mask._off = true;
	mask.graphics.p("AiVhnIErAAIgODJIjaAFg");
	mask.setTransform(36.6,33.9);

	// PlayerColor
	this.PlayerColor = new lib.Placeholder();
	this.PlayerColor.setTransform(0,0,0.75,0.75);

	this.PlayerColor.mask = mask;

	// Front
	this.instance = new lib.mobile();
	this.instance.setTransform(37,37.6,1,1,0,0,0,20.6,36);

	// Main
	this.boundary = new lib.Marker();
	this.boundary.setTransform(80,80);

	this.addChild(this.boundary,this.instance,this.PlayerColor);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(16.4,1.6,40.9,72);


(lib.UserIconKeyboard = function() {
	this.initialize();

	// Colors (mask)
	var mask = new cjs.Shape();
	mask._off = true;
	mask.graphics.p("ADaBSIByAIIACBNIh1ADgAiSCoIgQhRIExgFIAABYgAlNCoIAEhSIBqAFIAQBNgAAmggIBZgHIgJBRIhQADgAhXggIBMACIACBKIhiABgAlFApIAEhQIC2AHIgXBKgAC3grICPAEIAFBLIibACgAiyihIBZgHIgJBTIhQADgAk9ihIBcABIABBNIhhABgABQhXIAAhKIBSgHIALBRgAgxhXIAEhRIBNAHIgEBKgADUipIBrACIABBMIhhABg");
	mask.setTransform(39.2,44.2);

	// PlayerColor
	this.PlayerColor = new lib.Placeholder();
	this.PlayerColor.setTransform(0,8.8,0.783,0.633);

	this.PlayerColor.mask = mask;

	// Front
	this.shape = new cjs.Shape();
	this.shape.graphics.rf(["#290B19","#0F030A"],[0.004,1],0,0,0,0,0,214.5).s().p("A6eOsIBZ8jMAyGgCTMABeAgVg");
	this.shape.setTransform(1.7,20.7,0.22,0.22,0,0,0,-170.9,-106);

	// Main
	this.boundary = new lib.Marker();
	this.boundary.setTransform(80,80);

	this.addChild(this.boundary,this.shape,this.PlayerColor);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(2,21.2,74.8,45.6);


(lib.UserIconGamepad = function() {
	this.initialize();

	// Colors (mask)
	var mask = new cjs.Shape();
	mask._off = true;
	mask.graphics.p("AiVhnIErAAIgODJIjaAFg");
	mask.setTransform(36.6,33.9);

	// PlayerColor
	this.PlayerColor = new lib.Placeholder();
	this.PlayerColor.setTransform(0,0,0.75,0.75);

	this.PlayerColor.mask = mask;

	// Front
	this.instance = new lib.mobile();
	this.instance.setTransform(37,37.6,1,1,0,0,0,20.6,36);

	// Main
	this.boundary = new lib.Marker();
	this.boundary.setTransform(80,80);

	this.addChild(this.boundary,this.instance,this.PlayerColor);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(16.4,1.6,40.9,72);


(lib.UserIconAuthenticated = function() {
	this.initialize();

	// OriginalIcon
	this.ControllerIcon = new lib.PlaceholderAlternateColor();
	this.ControllerIcon.setTransform(36.8,0,0.349,0.349);

	// PlayerImage
	this.userimage = new lib.PlaceholderAlternateColor();
	this.userimage.setTransform(5.3,15.3,0.54,0.542);

	// Main
	this.boundary = new lib.Marker();
	this.boundary.setTransform(80,80);

	// Colors (mask)
	var mask = new cjs.Shape();
	mask._off = true;
	mask.graphics.p("AkcEsQgGAAgEgFQgFgEAAgGIAAo5QAAgGAFgEQAEgFAGAAII5AAQAGAAAEAFQAFAEAAAGIAAI5QAAAGgFAEQgEAFgGAAgAkNEOIIbAAIAAobIobAAg");
	mask.setTransform(32.3,42.4);

	// PlayerColor
	this.PlayerColor = new lib.Placeholder();
	this.PlayerColor.setTransform(0,0,0.75,0.75);

	this.PlayerColor.mask = mask;

	this.addChild(this.PlayerColor,this.boundary,this.userimage,this.ControllerIcon);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(2.3,0,69.5,72.4);


(lib.Accounts = function() {
	this.initialize();

	// Laag 1
	this.scrollbar = new lib.Scrollbar();
	this.scrollbar.setTransform(341.2,15.8,0.567,0.421);

	this.content = new lib.Placeholder_1();
	this.content.setTransform(6.2,15.9,3.644,1.599);

	this.addChild(this.content,this.scrollbar);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(6.2,14.8,358.7,165.3);


(lib.Signin = function() {
	this.initialize();

	// Layer 1
	this.linkAccount = new lib.LongButton();
	this.linkAccount.setTransform(294.3,312.7);

	this.accounts = new lib.Accounts();
	this.accounts.setTransform(552.8,329,1,1,0,0,0,299.6,196);

	this.title = new cjs.Text("Select your profile", "20px 'Verdana'", "#FF873A");
	this.title.name = "title";
	this.title.lineHeight = 22;
	this.title.lineWidth = 217;
	this.title.setTransform(258.5,113.2);

	// background
	this.close = new lib.CloseButton();
	this.close.setTransform(611.9,130.1,1,1,0,0,0,12.6,19.4);

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#290B19").s().p("A6LNCIAA6DMA0XAAAIAAaDg");
	this.shape.setTransform(261.4,151.6,1,1,0,0,0,-161.3,-76.9);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f().s("#51232D").ss(3).p("Eg+HgfhMgBsA/DMB/ogA8MgAKg9pg");
	this.shape_1.setTransform(242.1,96.4,0.483,0.68,0,0,0,-397.7,-201.9);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#51232D").s().p("Eg+TAdhMABXg6vMB63gASMAAZA7Bg");
	this.shape_2.setTransform(244.6,102.5,0.474,0.684,0,0,0,-400.3,-188.6);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("rgba(0,0,0,0.749)").s().p("EhCvAlnMAAAhLNMCFfAAAMAAABLNg");
	this.shape_3.setTransform(427,240.7);

	this.addChild(this.shape_3,this.shape_2,this.shape_1,this.shape,this.close,this.title,this.accounts,this.linkAccount);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-0.2,0,913.6,481.5);


// stage content:
(lib.remote = function() {
	this.initialize();

	// Portal
	this.instance = new lib.UserIconTablet();
	this.instance.setTransform(160,155.4,1,1,0,0,0,40,44.4);

	this.instance_1 = new lib.UserIconPhone();
	this.instance_1.setTransform(40.9,155.3,1,1,0,0,0,40,40);

	this.instance_2 = new lib.UserIconKeyboard();
	this.instance_2.setTransform(171,61.7,1,1,0,0,0,40,44.4);

	this.instance_3 = new lib.UserIconGamepad();
	this.instance_3.setTransform(40.9,57.3,1,1,0,0,0,40,40);

	this.addChild(this.instance_3,this.instance_2,this.instance_1,this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(427.9,257.3,210.2,178);

})(quizwitzremote = quizwitzremote||{}, images = images||{}, createjs = createjs||{});
var quizwitzremote, images, createjs;