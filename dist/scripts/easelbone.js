define("CatLab/Easelbone/Utilities/Loader",["PreloadJS"],function(t){var e=function(){this.loader=new createjs.LoadQueue(!1)};return e.prototype.loadAssets=function(t,e){this.loader.loadManifest(t.properties.manifest,!0,e)},e.prototype.load=function(t){t()},e}),define("CatLab/Easelbone/Views/Layer",["EaselJS","underscore","backbone"],function(t,e,i){var n=function(n){e.extend(this,i.Events),"undefined"==typeof n&&(n={}),"undefined"!=typeof n.container?this.container=n.container:this.container=new t.Container,this.view=null};return n.prototype.setView=function(e){null!=this.view&&this.view.trigger("stage:removed"),this.view=e,this.container.removeAllChildren();var i=new t.Container;this.view.setElement(i),this.container.addChild(i);var n=this;this.view.on("all",function(t){n.trigger("view:"+t)}),this.view.trigger("stage:added")},n.prototype.render=function(){this.view&&(this.view.el.removeAllChildren(),this.view.trigger("render:before"),this.view.render(),this.view.trigger("render"),this.view.trigger("render:after"))},n.prototype.tick=function(t){return!1},n}),define("CatLab/Easelbone/Views/Root",["backbone","EaselJS","CatLab/Easelbone/Views/Layer"],function(t,e,i){var n,s,o=!1;return t.View.extend({stage:null,container:null,hudcontainer:null,view:null,hud:null,initialize:function(t){var i=this;if("undefined"!=typeof t.canvas)this.canvas=t.canvas,this.container=this.canvas.parentNode;else{if("undefined"==typeof t.container)throw new Error("Container must be defined for root view.");this.canvas=document.createElement("canvas"),this.container=t.container,this.container.appendChild(this.canvas)}this.stage=new e.Stage(this.canvas),this.layers=[],this.layerMap={},this.mainLayer=this.nextLayer("main"),e.Ticker.addEventListener("tick",function(t){i.tick(t)}),e.Ticker.addEventListener("tick",this.stage),this.resize()},nextLayer:function(t){"undefined"==typeof t&&(t="Layer"+this.layers.length);var e=new i;return this.stage.addChild(e.container),this.layers.push(e),this.layerMap[t]=e,e},getLayer:function(t){return this.layerMap[t]},setView:function(t){this.mainLayer.setView(t),this.render()},tick:function(t){for(this.trigger("tick:before",t),o=!1,n=0;n<this.layers.length;n++)s=this.layers[n],s.tick(t)&&(o=!0);o&&this.update(),this.trigger("tick:after")},render:function(){for(n=0;n<this.layers.length;n++)this.layers[n].render();return this.update(),this},update:function(){this.stage.update()},fullscreen:function(){this.resizeFullscreen()},resize:function(){"undefined"!=typeof this.container?(this.canvas.width=this.container.offsetWidth,this.canvas.height=this.container.offsetHeight):(this.canvas.width=window.innerWidth,this.canvas.height=window.innerHeight),this.render()}})}),define("CatLab/Easelbone/Utilities/GlobalProperties",["backbone"],function(t){var e=t.Model.extend({initialize:function(){this.set({width:800,height:600,font:"sans-serif",textColor:"white"})},getWidth:function(){return this.get("width")},getHeight:function(){return this.get("height")},getDefaultFont:function(){return this.get("font")},getDefaultTextColor:function(){return this.get("textColor")},ifUndefined:function(t,e){return"undefined"!=typeof t&&null!==t?t:e}});return new e}),define("CatLab/Easelbone/Views/Base",["backbone","CatLab/Easelbone/Utilities/GlobalProperties"],function(t,e){return t.View.extend({el:"div",setRootView:function(t){this.set("root",t)},getWidth:function(){return this.el.getStage().canvas.width},getHeight:function(){return this.el.getStage().canvas.height},scale:function(t){var e=this.getScale();t.scaleX=e.x,t.scaleY=e.y},getScale:function(t,i,n){("undefined"==typeof t||null===t)&&(t=e.getWidth()),("undefined"==typeof i||null===i)&&(i=e.getHeight()),"undefined"==typeof n&&(n=!1);var s=this.getWidth()/t,o=this.getHeight()/i,a=n?Math.max(s,o):Math.min(s,o);return{x:a,y:a}},addCenter:function(t,i,n,s,o){("undefined"==typeof i||null===i)&&(i=e.getWidth()),("undefined"==typeof n||null===n)&&(n=e.getHeight()),("undefined"==typeof o||null===o)&&(o=1);var a=this.getScale(i,n,s);a.x=a.x*o,a.y=a.y*o,t.x=(this.getWidth()-i*a.x)/2,t.y=(this.getHeight()-n*a.y)/2,t.scaleX=a.x,t.scaleY=a.y,this.el.addChild(t);var r=new createjs.Graphics;t.x>0&&(r.beginFill(this.getBackground()).drawRect(0,0,Math.ceil(t.x),this.getHeight()),r.beginFill(this.getBackground()).drawRect(this.getWidth()-Math.ceil(t.x),0,Math.ceil(t.x),this.getHeight())),t.y>0&&(r.beginFill(this.getBackground()).drawRect(0,0,this.getWidth(),Math.ceil(t.y)),r.beginFill(this.getBackground()).drawRect(0,this.getHeight()-Math.ceil(t.y),this.getWidth(),Math.ceil(t.y)));var l=new createjs.Shape(r);this.el.addChild(l)},clear:function(){this.el.removeAllChildren();var t=new createjs.Graphics;t.beginFill(this.getBackground()).drawRect(0,0,this.getWidth(),this.getHeight());var e=new createjs.Shape(t);this.el.addChild(e)},getBackground:function(){return"#000000"},render:function(){var t=new createjs.Container;t.setBounds(0,0,this.getWidth(),this.getHeight());var e=new createjs.BigText("Please wait, initializing application","Arial","#000000");t.addChild(e),this.el.addChild(t)},tick:function(){return!1},afterRender:function(){},onRemove:function(){}})}),define("CatLab/Easelbone/Views/Navigatable",["CatLab/Easelbone/Views/Base"],function(t){return t.extend({_users:[],_currentIndex:-1,_current:null,_options:[],_controls:{navigation:["left","right"],toggle:["a"],manipulation:["down","up"]},initialize:function(t){this.initializeNavigatable(t)},initializeNavigatable:function(t){t=t||{},"undefined"!=typeof t.orientation&&"vertical"==t.orientation&&(this._controls.navigation=["up","down"],this._controls.manipulation=["left","right"]),this.resetOptions()},setUsers:function(t){this._users=t;for(var e=this,i=0;i<this._users.length;i++){var n=this._users[i];n.setView("catlab-nes"),n.clearEvents(),n.control(this._controls.navigation[0]).click(function(){e.previous()}),n.control(this._controls.navigation[1]).click(function(){e.next()}),n.control(this._controls.toggle).click(function(){e.keyInput("a")}),n.control(this._controls.toggle).click(function(){e.keyInput("b")}),n.control(this._controls.manipulation[0]).click(function(){e.keyInput("down")}),n.control(this._controls.manipulation[1]).click(function(){e.keyInput("up")})}},next:function(){this.activate((this._currentIndex+1)%this._options.length)},previous:function(){var t=this._currentIndex-1;0>t&&(t=this._options.length-1),this.activate(t)},keyInput:function(t){this._current&&this._current.keyInput(t)},resetOptions:function(){this._options=[]},addControl:function(t){this._options.push(t),t.deactivate(!1)},activate:function(t){-1!==this._currentIndex&&null!==this._currentIndex&&this._options[this._currentIndex].deactivate(),this._currentIndex=t,this._options[t].activate(),this._current=this._options[t]}})}),define("CatLab/Easelbone/Controls/Base",["underscore","backbone"],function(t,e){var i=function(){this.checked=!1,this.active=!1,t.extend(this,e.Events)};return i.prototype.activate=function(t){this.active=!0,this.update(t)},i.prototype.deactivate=function(t){this.active=!1,this.update(t)},i.prototype.update=function(t){"undefined"==typeof t&&(t=!0),this.active?this.checked?this.gotoWithAnimate("Hit",t):this.gotoWithAnimate("Over",t):this.checked?this.gotoWithAnimate("Down",t):this.gotoWithAnimate("Up",t)},i.prototype.gotoWithAnimate=function(t,e){return!e&&this.element.timeline.resolve(t+"-NoAnim")?void this.element.gotoAndPlay(t+"-NoAnim"):void this.element.gotoAndPlay(t)},i}),define("CatLab/Easelbone/Utilities/Path",[],function(){var t,e,i=function(t,e){this.start={x:t.x,y:t.y},this.end={x:e.x,y:e.y},this.distance={x:e.x-t.x,y:e.y-t.y},this.orientation=this.distance.x>this.distance.y?"horizontal":"vertical",this.indicatorSize={x:0,y:0}};return i.prototype.getPosition=function(t){return isNaN(t)&&(t=0),{x:this.start.x+(this.distance.x-this.indicatorSize.x)*t,y:this.start.y+(this.distance.y-this.indicatorSize.y)*t}},i.prototype.getValue=function(i,n){return t="horizontal"===this.orientation?(i-this.start.x)/this.distance.x:(n-this.start.y)/this.distance.y,e=Math.max(0,Math.min(1,t))},i.prototype.position=function(t,e){var i=this.getPosition(e);t.x=i.x,t.y=i.y},i.prototype.setIndicatorSize=function(t,e){this.indicatorSize={x:t,y:e}},i}),define("CatLab/Easelbone/Controls/Slider",["CatLab/Easelbone/Controls/Base","CatLab/Easelbone/Utilities/Path"],function(t,e){var i=function(t){var i,n=this;this.element=t,this.step=.1,this.path=new e(this.element.minimum,this.element.maximum),this.setValue(.5),this.element.pointer.on("pressmove",function(t){i=n.element.globalToLocal(t.stageX,t.stageY),n.setValue(n.path.getValue(i.x,i.y))}),this.element.pointer.on("click",function(t){t.stopPropagation()}),this.element.on("click",function(t){i=n.element.globalToLocal(t.stageX,t.stageY),n.setValue(n.path.getValue(i.x,i.y))})};return i.prototype=new t,i.prototype.link=function(t,e){return this.setValue(t.get(e)),this},i.prototype.setValue=function(t){this.value=t,this.path.position(this.element.pointer,this.value)},i.prototype.keyInput=function(t){switch(console.log(t),t){case"up":this.value=Math.min(1,this.value+this.step);break;case"down":this.value=Math.max(0,this.value-this.step)}this.setValue(this.value)},i}),define("CatLab/Easelbone/Controls/Checkbox",["CatLab/Easelbone/Controls/Base"],function(t){var e=function(t){var e=this;this.element=t,this.element.addEventListener("click",function(){e.toggle()})};return e.prototype=new t,e.prototype.toggle=function(){this.checked=!this.checked,this.update()},e.prototype.check=function(){this.checked=!0,this.update()},e.prototype.uncheck=function(){this.checked=!1,this.update()},e.prototype.keyInput=function(t){switch(t){case"a":this.toggle()}},e}),define("CatLab/Easelbone/EaselJS/DisplayObjects/BigText",["EaselJS","CatLab/Easelbone/Utilities/GlobalProperties"],function(t,e){var i,n,s,o=!1,a=!1,r=function(t,i,n,s){this.textstring=t,this.font=e.ifUndefined(i,e.getDefaultFont()),this.color=e.ifUndefined(n,e.getDefaultTextColor()),this.align="undefined"==typeof s?"center":s,this.initialize(),this.initialized=!1,this.limits=null,this.debug=o},l=r.prototype=new t.Container;return l.Container_initialize=l.initialize,l.initialize=function(){this.Container_initialize()},l.isVisible=function(){return!0},l.setText=function(t){this.initialized=!1,this.textstring=t,this.textElement&&(this.textElement.text=t)},l.setLimits=function(t,e){this.limits={width:t,height:e}},l.getAvailableSpace=function(){return null!==this.limits?this.limits:(this.getBounds()?(i=this.getBounds().width,n=this.getBounds().height):this.parent?(i=this.parent.getBounds().width,n=this.parent.getBounds().height):(i=100,n=100),{width:i,height:n})},l.goBigOrGoHome=function(e,i,n){function s(){if(l--,0>l)return!1;var s=new t.Text(e,a+"px "+o.font,o.color);return s.lineWidth=i,s.getBounds().height<n&&s.getBounds().width<=i?(r=s,a++,!0):!1}for(var o=this,a=10,r=new t.Text(""+String(e),a+"px "+this.font,this.color),l=500;s(););return r},l.Container_draw=l.draw,l.getLocationHash=function(){return s=this.getAvailableSpace(),s.width+":"+s.height},l.hasChanged=function(){return s=this.getLocationHash(),a=this.lastHash!=s,this.lastHash=s,a},l.draw=function(e,i){if(this.initialized&&!this.hasChanged())return this.Container_draw(e,i);this.initialized=!0,this.removeAllChildren();var n=this.getAvailableSpace();if(this.debug){var s=new t.Shape;s.graphics.beginStroke("#FFA500"),s.graphics.setStrokeStyle(1),s.snapToPixel=!0,s.graphics.drawRect(0,0,n.width,n.height),this.addChild(s)}var o=this.goBigOrGoHome(this.textstring,n.width,n.height);return this.textElement=o,o.textAlign="center","center"==this.align?o.x=(n.width-o.getBounds().width)/2+o.getBounds().width/2:"left"==this.align?o.x=o.getBounds().width/2:"right"==this.align&&(o.x=n.width-o.getBounds().width),o.y=(n.height-o.getBounds().height)/2,this.addChild(o),this.Container_draw(e,i)},t.BigText=r,r}),define("CatLab/Easelbone/EaselJS/DisplayObjects/Placeholder",["EaselJS"],function(t){var e=function(t){"undefined"!=typeof t&&(this.initialize(),this.initializePlaceholder(t))},i=e.prototype=new t.Container;return i.initializePlaceholder=function(e){var i,n=this,s="0:0",o="0:0";e.original_draw=e.draw,e.draw=function(t,i){return this.updateBounds(),e.original_draw(t,i)},this.getBoundsHash=function(){return this.getBounds()?s=this.getBounds().width+":"+this.getBounds().height:null},this.hasBoundsChanged=function(){return this.getBoundsHash()!=o?(o=s,!0):void 0},e.updateBounds=function(){n.setBounds(0,0,Math.ceil(100*this.scaleX),Math.ceil(100*this.scaleY)),n.x=this.x,n.y=this.y,n.rotation=this.rotation,n.hasBoundsChanged()&&(this.mask?n.mask=this.mask:this.originalMask&&(n.mask=this.originalMask),this.mask=!1,i=new t.Event("bounds:change"),n.dispatchEvent(i))};for(var a=0;a<e.children.length;a++)e.children[a].visible=!1;if(null!=e.parent){var r=e.parent.getChildIndex(e);e.parent.addChildAt(n,r+1),n.dispatchEvent("initialized")}else e.addEventListener("added",function(){var t=e.parent.getChildIndex(e);e.parent.addChildAt(n,t+1),n.dispatchEvent("initialized")})},e}),define("CatLab/Easelbone/EaselJS/DisplayObjects/TextPlaceholder",["CatLab/Easelbone/EaselJS/DisplayObjects/Placeholder"],function(t){return t}),define("CatLab/Easelbone/Controls/Button",["CatLab/Easelbone/Controls/Base","CatLab/Easelbone/EaselJS/DisplayObjects/BigText","CatLab/Easelbone/EaselJS/DisplayObjects/TextPlaceholder"],function(t,e,i){var n=function(t){var e=this;if(this.element=t,this.checked=!1,!this.element.text)throw"All buttons should have a text placeholder.";this.convertText(),this.element.addEventListener("click",function(){e.trigger("click")})};return n.prototype=new t,n.prototype.setText=function(t,i,n){var s=new e(t,i,n);this.text.addChild(s)},n.prototype.convertText=function(){if(this.element.text instanceof createjs.Text){var t=this;this.setText=function(e){t.element.text.text=e}}else this.text=new i(this.element.text)},n.prototype.keyInput=function(t){switch(t){case"a":this.trigger("click")}},n}),define("CatLab/Easelbone/Controls/Selectbox",["CatLab/Easelbone/Controls/Base","CatLab/Easelbone/EaselJS/DisplayObjects/BigText","CatLab/Easelbone/EaselJS/DisplayObjects/TextPlaceholder"],function(t,e,i){var n=function(t){var i=this;if(this.element=t,this.checked=!1,this.repeat=!1,this.textcontainer=e,this.selectedIndex=0,this.selectedValue=null,this.allValues=[],!this.element.value)throw"All selectboxes should have a text placeholder.";if(!this.element.buttons)throw"All selectboxes must have a buttons object";this.element.buttons.on("click",function(t){var e=i.element.buttons.globalToLocal(t.stageX,t.stageY);e.y>40?i.previous():i.next()}),this.convertText()};return n.prototype=new t,n.prototype.setText=function(t,e,i){var n=new this.textcontainer(t,e,i);this.textElement.removeAllChildren(),this.textElement.addChild(n)},n.prototype.convertText=function(){this.textElement=new i(this.element.value)},n.prototype.setValues=function(t){var e=[];if(t instanceof Array){for(var i=0;i<t.length;i++)e.push({text:t[i],value:t[i]});t=e}else for(var n in t)if(t.hasOwnProperty(n)){var s=t[n];s instanceof Object?e.push(s):e.push({text:s,value:n})}this.allValues=e,this.select(0)},n.prototype.getValue=function(){return this.value},n.prototype.select=function(t){0>t||t>this.values.length-1||(this.selectedIndex=t,this.selectedValue=this.values[this.selectedIndex],this.setText(this.selectedValue.text))},n.prototype.getIndexFromText=function(t){for(var e=0;e<this.allValues.length;e++)if(this.allValues[e].text==t)return e;return null},n.prototype.getIndexFromValue=function(t){for(var e=0;e<this.allValues.length;e++)if(this.allValues[e].value==t)return e;return null},n.prototype.next=function(){this.selectedIndex<this.allValues.length-1?this.select(this.selectedIndex+1):this.repeat&&this.select(0)},n.prototype.previous=function(){this.selectedIndex>0?this.select(this.selectedIndex-1):this.repeat&&this.select(this.allValues.length-1)},n.prototype.keyInput=function(t){switch(t){case"up":this.next();break;case"down":this.previous()}},Object.defineProperty(n.prototype,"text",{get:function(){return this.selectedValue.text},set:function(t){var e=this.getIndexFromText(t);null!==e&&(this.index=e)}}),Object.defineProperty(n.prototype,"value",{get:function(){return this.selectedValue.value},set:function(t){var e=this.getIndexFromValue(t);null!==e&&(this.index=e)}}),Object.defineProperty(n.prototype,"index",{get:function(){return this.selectedIndex},set:function(t){this.select(t)}}),Object.defineProperty(n.prototype,"values",{get:function(){return this.allValues},set:function(t){this.setValues(t)}}),n}),define("CatLab/Easelbone/Controls/ScrollBar",["underscore","CatLab/Easelbone/Utilities/Path"],function(t,e){var i,n,s=function(t){var i=this;this.element=t,this.element.up.on("click",this.up,this),this.element.down.on("click",this.down,this),this.path=new e(this.element.minimum,this.element.maximum),this.containers=[],this.element.on("pressmove",function(t){n=i.element.globalToLocal(t.stageX,t.stageY),i.scrollTo(i.path.getValue(n.x,n.y))})},o=s.prototype;return o.link=function(t){this.containers.push(t),t.on("scroll",this.onScroll,this)},o.up=function(){t.each(this.containers,function(t){t.up()})},o.down=function(){t.each(this.containers,function(t){t.down()})},o.getIndicatorSize=function(){return n=this.element.indicator.bottom&&this.element.indicator.top?{x:(this.element.indicator.bottom.x-this.element.indicator.top.x)*this.element.indicator.scaleX,y:(this.element.indicator.bottom.y-this.element.indicator.top.y)*this.element.indicator.scaleY}:{x:0,y:0}},o.scrollTo=function(e){t.each(this.containers,function(t){t.scrollTo(e)})},o.onScroll=function(t){i=Math.min(1,t.containerHeight/t.contentHeight),n=this.getIndicatorSize(),this.path.setIndicatorSize(n.x,n.y),this.path.position(this.element.indicator,t.percentage)},s}),define("CatLab/Easelbone/EaselJS/DisplayObjects/ScrollArea",["EaselJS","CatLab/Easelbone/EaselJS/DisplayObjects/Placeholder","jquery"],function(t,e){var i,n=function(i){var n=this;this.initialize();var s=new e(i);s.on("bounds:change",function(){var e=new t.Shape;e.graphics.drawRect(0,0,this.getBounds().width,this.getBounds().height),"undefined"!=typeof n.setMask?n.setMask(e):n.mask=e}),s.addChild(this),this.on("tick",function(){n.setScroll(0)},this,!0),Object.defineProperty(this,"scroll",{set:function(t){this.setScroll(t)},get:function(){return this.getScroll()}})},s=n.prototype=new e;return s.isActive=function(){return null!=this.getBounds()&&null!=this.parent&&null!=this.parent.getBounds()},s.getFinalDestination=function(t){return this.isActive()?0>t?0:this.getBounds().height-this.parent.getBounds().height<0?0:t>this.getBounds().height-this.parent.getBounds().height?0-(this.getBounds().height-this.parent.getBounds().height):0-t:0},s.setScroll=function(t){return this.oldY=this.y,this.y=this.getFinalDestination(t),this.oldY!=this.y&&this.onScroll(),this},s.getDistance=function(t){return Math.abs(this.y-this.getFinalDestination(t))},s.getScroll=function(){return 0-this.y},s.down=function(t){return this.setScroll(this.getScroll()+t)},s.up=function(t){return this.setScroll(this.getScroll()-t)},s.getPercentage=function(){return this.getBounds()?this.getScroll()/(this.getBounds().height-this.parent.getBounds().height):0},s.focus=function(e,i,n){var s=new jQuery.Deferred;if(!this.parent.getBounds())return s.resolve(),s;"undefined"==typeof i&&(i=0);var o=e.y,a=0;return e.getBounds()&&(a=e.getBounds().height),a<this.parent.getBounds().height&&(o-=this.parent.getBounds().height/2-a/2),1e-4==this.getDistance()?s.resolve():i>0?t.Tween.get(this).to({scroll:o},i,n).call(s.resolve):(this.scroll=o,s.resolve()),s},s.scrollTo=function(t){return this.getBounds()?void this.setScroll(t*(this.getBounds().height-this.parent.getBounds().height)):void this.setScroll(0)},s.onScroll=function(){i=new t.Event("scroll"),this.dispatchEvent(i)},n}),define("CatLab/Easelbone/Utilities/Mousewheel",[],function(){var t=function(){var t=this;document.body.addEventListener("mousewheel",function(e){t.scroll(e)})},e=t.prototype;return e.scroll=function(t){this.callback&&this.callback({x:0,y:t.wheelDelta})},e.listen=function(t){this.stop(),this.callback=t},e.stop=function(){this.callback=null},new t}),define("CatLab/Easelbone/Controls/ScrollArea",["CatLab/Easelbone/Controls/Base","CatLab/Easelbone/Controls/ScrollBar","CatLab/Easelbone/EaselJS/DisplayObjects/ScrollArea","CatLab/Easelbone/Utilities/Mousewheel"],function(t,e,i,n){var s=function(t){this.element=t,this.scrollbar=new e(t.scrollbar),this.scrollbar.link(this),this.content=new i(t.content),this.content.on("scroll",this.onScroll,this),this.element.on("mouseover",this.enableScrollMouse,this),this.element.on("mouseout",this.disableScrollMouse,this),this.element.on("removed",this.disableScrollMouse,this),this.element.on("added",this.onAdd,this)},o=s.prototype=new t;return o.enableScrollMouse=function(){var t=this;n.listen(function(e){t.scroll(e.y>0?50:-50)})},o.onAdd=function(){this.scrollTo(0)},o.disableScrollMouse=function(){n.stop()},o.onScroll=function(t){var e={percentage:this.content.getPercentage(),contentHeight:this.content.getBounds().height,containerHeight:this.content.parent.getBounds().height};this.trigger("scroll",e)},o.scrollTo=function(t){this.content.scrollTo(t)},o.scroll=function(t){this.content.up(t)},o.up=function(){this.content.up(25)},o.down=function(){this.content.down(25)},o.focus=function(t,e,i){return this.content.focus(t,e,i)},s}),define("CatLab/Easelbone/Controls/ListElement",[],function(){var t=function(t){this.element=t},e=t.prototype;return e.focus=function(){this.dispatchEvent("focus")},t}),define("CatLab/Easelbone/Controls/List",["EaselJS","CatLab/Easelbone/Controls/ListElement"],function(t,e){var i=function(t){this.initialize(),this.listItems=[],"undefined"!=typeof t&&this.setChildElement(t)},n=i.prototype=new t.Container;return n.setChildElement=function(t){this.childElement=t;var e=new t;this.boundary={x:e.boundary.x,y:e.boundary.y}},n.getChildElement=function(){if("undefined"==typeof this.childElement)throw"No child element set.";return this.childElement},n.updateBounds=function(){this.setBounds(0,0,this.boundary.x,this.boundary.y*this.listItems.length)},n.createElement=function(){var t=new e(new(this.getChildElement()));return this.listItems.push(t),this.addChild(t.element),t.element.y=this.boundary.y*(this.listItems.length-1),this.updateBounds(),t},i}),define("CatLab/Easelbone/Controls/FloatContainer",["EaselJS","CatLab/Easelbone/Controls/ListElement"],function(t,e){var i=function(t,e){this.initialize(),this.listItems=[],"undefined"!=typeof t&&this.setChildElement(t),this.rows=0,this.columns=e,this.currentColumn=0},n=i.prototype=new t.Container;return n.setChildElement=function(t){this.childElement=t;var e=this.getChildElement();this.boundary={x:e.boundary.x,y:e.boundary.y}},n.getChildElement=function(e){if("undefined"==typeof this.childElement)throw"No child element set.";return this.childElement.prototype instanceof t.DisplayObject?new this.childElement:this.childElement(e)},n.updateBounds=function(){this.setBounds(0,0,this.boundary.x*this.columns,this.boundary.y*(this.rows+1))},n.nextRow=function(){this.currentColumn=1,this.rows++},n.getNextPosition=function(){var t={};return this.currentColumn++,this.currentColumn>this.columns&&this.nextRow(),t.x=this.boundary.x*(this.currentColumn-1),t.y=this.boundary.y*this.rows,t},n.createElement=function(t){var i=new e(this.getChildElement(t));this.listItems.push(i),this.addChild(i.element);var n=this.getNextPosition();return i.element.x=n.x,i.element.y=n.y,this.updateBounds(),i},n.removeAllChildren_container=n.removeAllChildren,n.removeAllChildren=function(){this.currentColumn=0,this.rows=0,this.removeAllChildren_container.apply(this,arguments)},i}),define("CatLab/Easelbone/EaselJS/DisplayObjects/Background",["EaselJS"],function(t){var e,i,n,s=!1,o=!1,a={},r=function(e,i){if("undefined"==typeof i&&(i={zoom:"stretch"}),this.fillOptions=i,e instanceof Image||e instanceof HTMLImageElement)this.displayobject=new t.Bitmap(e);else if(e instanceof t.DisplayObject){if(!e.getBounds())throw"Objects to be filled must have bounds set.";this.displayobject=e}else this.color=e;this.initialize(),this.initialized=!1,this.limits=null,this.debug=s},l=r.prototype=new t.Container;return l.Container_initialize=l.initialize,l.initialize=function(){this.Container_initialize()},l.isVisible=function(){return!0},l.setLimits=function(t,e){this.limits={width:t,height:e}},l.getAvailableSpace=function(){return null!==this.limits?this.limits:(this.parent?(e=this.parent.getBounds().width,i=this.parent.getBounds().height):this.getBounds()?(e=this.getBounds().width,i=this.getBounds().height):(e=100,i=100),{width:e,height:i})},l.Container_draw=l.draw,l.getLocationHash=function(){return n=this.getAvailableSpace(),n.width+":"+n.height},l.hasChanged=function(){return n=this.getLocationHash(),o=this.lastHash!=n,this.lastHash=n,o},l.center=function(t){this.displayobject&&(this.displayobject.x=(t.width-this.displayobject.getBounds().width*this.displayobject.scaleX)/2,this.displayobject.y=(t.height-this.displayobject.getBounds().height*this.displayobject.scaleY)/2)},l.draw=function(e,i){if(this.initialized&&!this.hasChanged())return this.Container_draw(e,i);this.initialized=!0,this.removeAllChildren();var n=this.getAvailableSpace();if(this.color){var s=new t.Shape;s.graphics.setStrokeStyle(0),s.graphics.beginFill(this.color),s.graphics.beginStroke(this.color),s.snapToPixel=!0,s.graphics.drawRect(0,0,n.width,n.height),this.addChild(s)}else if(this.displayobject){if(!this.displayobject.getBounds())return void(this.initialized=!1);switch(a={x:n.width/this.displayobject.getBounds().width,y:n.height/this.displayobject.getBounds().height},this.fillOptions.zoom){case"minimum":this.displayobject.scaleX=this.displayobject.scaleY=Math.min(a.x,a.y),this.center(n);break;case"maximum":this.displayobject.scaleX=this.displayobject.scaleY=Math.max(a.x,a.y),this.center(n);break;case"stretch":case"default":this.displayobject.scaleX=a.x,this.displayobject.scaleY=a.y}this.addChild(this.displayobject)}return this.Container_draw(e,i)},t.Background=r,r}),define("CatLab/Easelbone/EaselJS/DisabledButtonHelper",["EaselJS"],function(t){var e=function(t,e,i,n,s,o,a){this.initialize(t,e,i,n,s,o,a)},i=e.prototype;i.target=null,i.overLabel=null,i.outLabel=null,i.downLabel=null,i.play=!1,i.setEnabled=function(t){},i.getEnabled=function(){return this._enabled};try{Object.defineProperties(i,{enabled:{get:i.getEnabled,set:i.setEnabled}})}catch(n){}return i._isPressed=!1,i._isOver=!1,i._enabled=!1,i.initialize=function(t,e,i,n,s,o,a){t.addEventListener&&(this.target=t,t.mouseChildren=!1,this.overLabel=null==i?"over":i,this.outLabel=null==e?"out":e,this.downLabel=null==n?"down":n,this.play=s,this.setEnabled(!0),this.handleEvent({}),o&&(a&&(o.actionsEnabled=!1,o.gotoAndStop&&o.gotoAndStop(a)),t.hitArea=o))},i.toString=function(){return"[DisabledButtonHelper]"},i.handleEvent=function(t){var e,i=this.target,n=t.type;"mousedown"==n?(this._isPressed=!0,e=this.downLabel):"pressup"==n?(this._isPressed=!1,e=this._isOver?this.overLabel:this.outLabel):"rollover"==n?(this._isOver=!0,e=this._isPressed?this.downLabel:this.overLabel):(this._isOver=!1,e=this._isPressed?this.overLabel:this.outLabel),this.play?i.gotoAndPlay&&i.gotoAndPlay(e):i.gotoAndStop&&i.gotoAndStop(e)},e}),define("CatLab/FakeWebremote/Models/User",[],function(){return function(t){var e,i,n,s=t;this.getAccessToken=function(){return s},this.setId=function(t){n=t},this.getId=function(){return n},this.setName=function(t){e=t},this.getName=function(){return e},this.setAvatar=function(t){i=t},this.getAvatar=function(){return i}}}),define("CatLab/FakeWebremote/Models/Control",[],function(){return function(t,e){var i,n,s=0,o={},a=t,r=[];this.id=t,this.pushed=function(){return 0===s},this.scale=function(){return s},this.update=function(t){s>0&&0==t&&this.trigger("click"),s=t},this.getLabel=function(){return'<span class="control-label '+n+'">'+a+"</span>"},this.setStaticLabel=function(t,e){return a=t,n=e,this},this.setLabel=function(i,n){return e.emit("button:label",{id:t,label:i}),this},this.click=function(t){return this.on("click",t),this},this.on=function(t,e){return"undefined"==typeof o[t]&&(o[t]=[]),o[t].push(e),this},this.trigger=function(t){var e=[];if("undefined"!=typeof o[t])for(i=0;i<o[t].length;i++)e.push(o[t][i]);for(i=0;i<e.length;i++)try{e[i]()}catch(n){console.log(n)}return this},this.off=function(t){return o[t]=[],this},this.clearEvents=function(){return o={},this},this.addDomElement=function(t){var e=this,i=[];return i.push(t.addEventListener("click",function(){e.trigger("click")})),r.push({element:t,listeners:i}),this},this.clearDomElements=function(){for(var t=0;t<r.length;t++)for(var e=0;e<r[t].listeners.length;e++)r[t].element.removeEventListener("click",r[t].listeners[e]);return r=[],this},this.isLocalAuthentication=function(){return!1},this.log=function(t){e.log("["+this.id+"] "+t)}}}),define("CatLab/FakeWebremote/Models/ControlUser",["CatLab/FakeWebremote/Models/User","CatLab/FakeWebremote/Models/Control"],function(t,e){var i=function(t){this.initialize(t)};return i.prototype=t,i.prototype.setWebcontrol=function(t){this.Webcontrol=t},i.prototype.initialize=function(t){this.controls={},this.currentView=null,this.color="orange",this.colorName="orange",this.tmpid=null,this.active=!1,this.userdata=t,this.profiledata={},this.access_token=null},i.prototype.clearControls=function(){if(null!=this.currentView)for(var t=this.Webcontrol.getViewLabels(this.currentView),e=0;e<t.length;e++)this.control(t[e].id).setStaticLabel(t[e].label,"mobile")},i.prototype.clearEvents=function(){for(this.tmpid in this.controls)this.controls.hasOwnProperty(this.tmpid)&&this.controls[this.tmpid].clearEvents()},i.prototype.trigger=function(t,e){"button:down"==t?this.control(e.id).update(1):"button:up"==t?this.control(e.id).update(0):"user:login"==t?this.login(e):"user:logout"==t&&this.logout(e)},i.prototype.emit=function(t,e){return this.Webcontrol._playerEmit(this,t,e),!0},i.prototype.control=function(t){var i=this;return"undefined"==typeof this.controls[t]&&(this.controls[t]=new e(t,i)),this.controls[t]},i.prototype.getId=function(){return this.userdata.id},i.prototype.getName=function(){return"User "+this.getId()},i.prototype.getType=function(){return"mobile"},i.prototype.getIcon=function(){return"fa fa-mobile-phone"},i.prototype.login=function(t){var e=this;this.access_token=t.access_token,this.Webcontrol.getOAuthClient(function(t){t.profile(e.access_token,function(t){e.profiledata=t.user})})},i.prototype.getData=function(){return this.profiledata},i.prototype.logout=function(t){this.profiledata=null,this.access_token=null},i.prototype.setColor=function(t,e){this.color=t,this.colorName=e,this.emit("color:set",{color:t,name:e})},i.prototype.getColor=function(){return this.color},i.prototype.getColorName=function(){return this.colorName},i.prototype.isActive=function(){return this.active},i.prototype.toggleActive=function(){this.active=!this.active,this.setLabel()},i.prototype.setActive=function(t){this.active=t,this.setLabel()},i.prototype.setLabel=function(){1==this.active?this.control("join-game").setLabel("LEAVE"):this.control("join-game").setLabel("JOIN")},i.prototype.setView=function(t){this.currentView=t,this.clearControls(),this.emit("view:set",{id:t})},i.prototype.setUserData=function(t,e){console.log("Setting user data: ",t,e)},i.prototype.isLocalAuthentication=function(){return!0},i.prototype.log=function(t){console.log("[u:"+this.getId()+"] "+t)},i}),define("CatLab/FakeWebremote/Models/KeyboardUser",["CatLab/FakeWebremote/Models/ControlUser"],function(t){var e=function(t){function e(e){for(s=0;s<t.length;s++)if(t[s].key==e)return i=n.control(t[s].id);return null}"undefined"==typeof t&&(t=[{id:"up",label:"↑",key:38},{id:"down",label:"↓",key:40},{id:"right",label:"→",key:39},{id:"left",label:"←",
key:37},{id:"a",label:"A",key:65},{id:"b",label:"B",key:66},{id:"x",label:"X",key:88},{id:"y",label:"Y",key:89},{id:"join-game",label:"SPACE",key:32},{id:"start-game",label:"ENTER",key:13}]),this.keys=t,this.initialize({id:"keyboard"});var i,n=this,s=0;document.addEventListener("keydown",function(t){i=e(t.keyCode),i&&i.update(1)}),document.addEventListener("keyup",function(t){i=e(t.keyCode),i&&i.update(0)}),this.clearControls=function(){for(var e=0;e<t.length;e++)this.control(t[e].id).setStaticLabel(t[e].label,"keyboard")},this.getType=function(){return"keyboard"},this.getIcon=function(){return"fa fa-keyboard-o"},this.setView=function(t){this.clearControls()},this.emit=function(t,e){return!1},this.isLocalAuthentication=function(){return!1},this.clearControls()};return e.prototype=new t,e.prototype.constructor=e,e}),define("CatLab/Easelbone/FrontController",["CatLab/Easelbone/Utilities/Loader","CatLab/Easelbone/Views/Root","CatLab/Easelbone/Views/Base","CatLab/Easelbone/Views/Layer","CatLab/Easelbone/Views/Navigatable","CatLab/Easelbone/Controls/Slider","CatLab/Easelbone/Controls/Checkbox","CatLab/Easelbone/Controls/Button","CatLab/Easelbone/Controls/Selectbox","CatLab/Easelbone/Controls/ScrollBar","CatLab/Easelbone/Controls/ScrollArea","CatLab/Easelbone/Controls/List","CatLab/Easelbone/Controls/FloatContainer","CatLab/Easelbone/EaselJS/DisplayObjects/BigText","CatLab/Easelbone/EaselJS/DisplayObjects/Placeholder","CatLab/Easelbone/EaselJS/DisplayObjects/Background","CatLab/Easelbone/EaselJS/DisabledButtonHelper","CatLab/Easelbone/Utilities/GlobalProperties","CatLab/FakeWebremote/Models/KeyboardUser"],function(t,e,i,n,s,o,a,r,l,h,c,u,d,f,p,g,b,y,v){return{initialize:function(){},setProperties:function(t){y.set(t)},Views:{Root:e,Base:i,Layer:n,Navigatable:s},Controls:{Slider:o,Checkbox:a,Button:r,Selectbox:l,ScrollBar:h,ScrollArea:c,List:u,FloatContainer:d},EaselJS:{BigText:f,Placeholder:p,Fill:g,DisabledButtonHelper:b},FakeWebremote:{KeyboardUser:v},Loader:new t}}),define("easelbone",["CatLab/Easelbone/FrontController"],function(t){return t});
//# sourceMappingURL=easelbone.js.map