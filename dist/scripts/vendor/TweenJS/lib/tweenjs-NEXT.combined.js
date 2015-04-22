this.createjs=this.createjs||{},createjs.extend=function(t,e){function n(){this.constructor=t}return n.prototype=e.prototype,t.prototype=new n},this.createjs=this.createjs||{},createjs.promote=function(t,e){var n=t.prototype,i=Object.getPrototypeOf&&Object.getPrototypeOf(n)||n.__proto__;if(i){n[(e+="_")+"constructor"]=i.constructor;for(var r in i)n.hasOwnProperty(r)&&"function"==typeof i[r]&&(n[e+r]=i[r])}return t},this.createjs=this.createjs||{},function(){function t(t,e,n){this.type=t,this.target=null,this.currentTarget=null,this.eventPhase=0,this.bubbles=!!e,this.cancelable=!!n,this.timeStamp=(new Date).getTime(),this.defaultPrevented=!1,this.propagationStopped=!1,this.immediatePropagationStopped=!1,this.removed=!1}var e=t.prototype;e.preventDefault=function(){this.defaultPrevented=this.cancelable&&!0},e.stopPropagation=function(){this.propagationStopped=!0},e.stopImmediatePropagation=function(){this.immediatePropagationStopped=this.propagationStopped=!0},e.remove=function(){this.removed=!0},e.clone=function(){return new t(this.type,this.bubbles,this.cancelable)},e.set=function(t){for(var e in t)this[e]=t[e];return this},e.toString=function(){return"[Event (type="+this.type+")]"},createjs.Event=t}(),this.createjs=this.createjs||{},function(){function t(){this._listeners=null,this._captureListeners=null}var e=t.prototype;t.initialize=function(t){t.addEventListener=e.addEventListener,t.on=e.on,t.removeEventListener=t.off=e.removeEventListener,t.removeAllEventListeners=e.removeAllEventListeners,t.hasEventListener=e.hasEventListener,t.dispatchEvent=e.dispatchEvent,t._dispatchEvent=e._dispatchEvent,t.willTrigger=e.willTrigger},e.addEventListener=function(t,e,n){var i;i=n?this._captureListeners=this._captureListeners||{}:this._listeners=this._listeners||{};var r=i[t];return r&&this.removeEventListener(t,e,n),r=i[t],r?r.push(e):i[t]=[e],e},e.on=function(t,e,n,i,r,s){return e.handleEvent&&(n=n||e,e=e.handleEvent),n=n||this,this.addEventListener(t,function(t){e.call(n,t,r),i&&t.remove()},s)},e.removeEventListener=function(t,e,n){var i=n?this._captureListeners:this._listeners;if(i){var r=i[t];if(r)for(var s=0,o=r.length;o>s;s++)if(r[s]==e){1==o?delete i[t]:r.splice(s,1);break}}},e.off=e.removeEventListener,e.removeAllEventListeners=function(t){t?(this._listeners&&delete this._listeners[t],this._captureListeners&&delete this._captureListeners[t]):this._listeners=this._captureListeners=null},e.dispatchEvent=function(t){if("string"==typeof t){var e=this._listeners;if(!e||!e[t])return!1;t=new createjs.Event(t)}else t.target&&t.clone&&(t=t.clone());try{t.target=this}catch(n){}if(t.bubbles&&this.parent){for(var i=this,r=[i];i.parent;)r.push(i=i.parent);var s,o=r.length;for(s=o-1;s>=0&&!t.propagationStopped;s--)r[s]._dispatchEvent(t,1+(0==s));for(s=1;o>s&&!t.propagationStopped;s++)r[s]._dispatchEvent(t,3)}else this._dispatchEvent(t,2);return t.defaultPrevented},e.hasEventListener=function(t){var e=this._listeners,n=this._captureListeners;return!!(e&&e[t]||n&&n[t])},e.willTrigger=function(t){for(var e=this;e;){if(e.hasEventListener(t))return!0;e=e.parent}return!1},e.toString=function(){return"[EventDispatcher]"},e._dispatchEvent=function(t,e){var n,i=1==e?this._captureListeners:this._listeners;if(t&&i){var r=i[t.type];if(!r||!(n=r.length))return;try{t.currentTarget=this}catch(s){}try{t.eventPhase=e}catch(s){}t.removed=!1,r=r.slice();for(var o=0;n>o&&!t.immediatePropagationStopped;o++){var a=r[o];a.handleEvent?a.handleEvent(t):a(t),t.removed&&(this.off(t.type,a,1==e),t.removed=!1)}}},createjs.EventDispatcher=t}(),this.createjs=this.createjs||{},function(){function t(){throw"Ticker cannot be instantiated."}t.RAF_SYNCHED="synched",t.RAF="raf",t.TIMEOUT="timeout",t.useRAF=!1,t.timingMode=null,t.maxDelta=0,t.paused=!1,t.removeEventListener=null,t.removeAllEventListeners=null,t.dispatchEvent=null,t.hasEventListener=null,t._listeners=null,createjs.EventDispatcher.initialize(t),t._addEventListener=t.addEventListener,t.addEventListener=function(){return!t._inited&&t.init(),t._addEventListener.apply(t,arguments)},t._inited=!1,t._startTime=0,t._pausedTime=0,t._ticks=0,t._pausedTicks=0,t._interval=50,t._lastTime=0,t._times=null,t._tickTimes=null,t._timerId=null,t._raf=!0,t.setInterval=function(e){t._interval=e,t._inited&&t._setupTick()},t.getInterval=function(){return t._interval},t.setFPS=function(e){t.setInterval(1e3/e)},t.getFPS=function(){return 1e3/t._interval};try{Object.defineProperties(t,{interval:{get:t.getInterval,set:t.setInterval},framerate:{get:t.getFPS,set:t.setFPS}})}catch(e){console.log(e)}t.init=function(){t._inited||(t._inited=!0,t._times=[],t._tickTimes=[],t._startTime=t._getTime(),t._times.push(t._lastTime=0),t.interval=t._interval)},t.reset=function(){if(t._raf){var e=window.cancelAnimationFrame||window.webkitCancelAnimationFrame||window.mozCancelAnimationFrame||window.oCancelAnimationFrame||window.msCancelAnimationFrame;e&&e(t._timerId)}else clearTimeout(t._timerId);t.removeAllEventListeners("tick"),t._timerId=t._times=t._tickTimes=null,t._startTime=t._lastTime=t._ticks=0,t._inited=!1},t.getMeasuredTickTime=function(e){var n=0,i=t._tickTimes;if(!i||i.length<1)return-1;e=Math.min(i.length,e||0|t.getFPS());for(var r=0;e>r;r++)n+=i[r];return n/e},t.getMeasuredFPS=function(e){var n=t._times;return!n||n.length<2?-1:(e=Math.min(n.length-1,e||0|t.getFPS()),1e3/((n[0]-n[e])/e))},t.setPaused=function(e){t.paused=e},t.getPaused=function(){return t.paused},t.getTime=function(e){return t._startTime?t._getTime()-(e?t._pausedTime:0):-1},t.getEventTime=function(e){return t._startTime?(t._lastTime||t._startTime)-(e?t._pausedTime:0):-1},t.getTicks=function(e){return t._ticks-(e?t._pausedTicks:0)},t._handleSynch=function(){t._timerId=null,t._setupTick(),t._getTime()-t._lastTime>=.97*(t._interval-1)&&t._tick()},t._handleRAF=function(){t._timerId=null,t._setupTick(),t._tick()},t._handleTimeout=function(){t._timerId=null,t._setupTick(),t._tick()},t._setupTick=function(){if(null==t._timerId){var e=t.timingMode||t.useRAF&&t.RAF_SYNCHED;if(e==t.RAF_SYNCHED||e==t.RAF){var n=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame;if(n)return t._timerId=n(e==t.RAF?t._handleRAF:t._handleSynch),void(t._raf=!0)}t._raf=!1,t._timerId=setTimeout(t._handleTimeout,t._interval)}},t._tick=function(){var e=t.paused,n=t._getTime(),i=n-t._lastTime;if(t._lastTime=n,t._ticks++,e&&(t._pausedTicks++,t._pausedTime+=i),t.hasEventListener("tick")){var r=new createjs.Event("tick"),s=t.maxDelta;r.delta=s&&i>s?s:i,r.paused=e,r.time=n,r.runTime=n-t._pausedTime,t.dispatchEvent(r)}for(t._tickTimes.unshift(t._getTime()-n);t._tickTimes.length>100;)t._tickTimes.pop();for(t._times.unshift(n);t._times.length>100;)t._times.pop()};var n=window.performance&&(performance.now||performance.mozNow||performance.msNow||performance.oNow||performance.webkitNow);t._getTime=function(){return(n&&n.call(performance)||(new Date).getTime())-t._startTime},createjs.Ticker=t}(),this.createjs=this.createjs||{},function(){function t(e,n,i){this.ignoreGlobalPause=!1,this.loop=!1,this.duration=0,this.pluginData=i||{},this.target=e,this.position=null,this.passive=!1,this._paused=!1,this._curQueueProps={},this._initQueueProps={},this._steps=[],this._actions=[],this._prevPosition=0,this._stepPosition=0,this._prevPos=-1,this._target=e,this._useTicks=!1,this._inited=!1,n&&(this._useTicks=n.useTicks,this.ignoreGlobalPause=n.ignoreGlobalPause,this.loop=n.loop,n.onChange&&this.addEventListener("change",n.onChange),n.override&&t.removeTweens(e)),n&&n.paused?this._paused=!0:createjs.Tween._register(this,!0),n&&null!=n.position&&this.setPosition(n.position,t.NONE)}var e=createjs.extend(t,createjs.EventDispatcher);t.NONE=0,t.LOOP=1,t.REVERSE=2,t.IGNORE={},t._tweens=[],t._plugins={},t.get=function(e,n,i,r){return r&&t.removeTweens(e),new t(e,n,i)},t.tick=function(e,n){for(var i=t._tweens.slice(),r=i.length-1;r>=0;r--){var s=i[r];n&&!s.ignoreGlobalPause||s._paused||s.tick(s._useTicks?1:e)}},t.handleEvent=function(t){"tick"==t.type&&this.tick(t.delta,t.paused)},t.removeTweens=function(e){if(e.tweenjs_count){for(var n=t._tweens,i=n.length-1;i>=0;i--){var r=n[i];r._target==e&&(r._paused=!0,n.splice(i,1))}e.tweenjs_count=0}},t.removeAllTweens=function(){for(var e=t._tweens,n=0,i=e.length;i>n;n++){var r=e[n];r._paused=!0,r.target.tweenjs_count=0}e.length=0},t.hasActiveTweens=function(e){return e?e.tweenjs_count:t._tweens&&!!t._tweens.length},t.installPlugin=function(e,n){var i=e.priority;null==i&&(e.priority=i=0);for(var r=0,s=n.length,o=t._plugins;s>r;r++){var a=n[r];if(o[a]){for(var u=o[a],c=0,h=u.length;h>c&&!(i<u[c].priority);c++);o[a].splice(c,0,e)}else o[a]=[e]}},t._register=function(e,n){var i=e._target,r=t._tweens;if(n)i&&(i.tweenjs_count=i.tweenjs_count?i.tweenjs_count+1:1),r.push(e),!t._inited&&createjs.Ticker&&(createjs.Ticker.addEventListener("tick",t),t._inited=!0);else{i&&i.tweenjs_count--;for(var s=r.length;s--;)if(r[s]==e)return void r.splice(s,1)}},e.wait=function(t,e){if(null==t||0>=t)return this;var n=this._cloneProps(this._curQueueProps);return this._addStep({d:t,p0:n,e:this._linearEase,p1:n,v:e})},e.to=function(t,e,n){return(isNaN(e)||0>e)&&(e=0),this._addStep({d:e||0,p0:this._cloneProps(this._curQueueProps),e:n,p1:this._cloneProps(this._appendQueueProps(t))})},e.call=function(t,e,n){return this._addAction({f:t,p:e?e:[this],o:n?n:this._target})},e.set=function(t,e){return this._addAction({f:this._set,o:this,p:[t,e?e:this._target]})},e.play=function(t){return t||(t=this),this.call(t.setPaused,[!1],t)},e.pause=function(t){return t||(t=this),this.call(t.setPaused,[!0],t)},e.setPosition=function(t,e){0>t&&(t=0),null==e&&(e=1);var n=t,i=!1;if(n>=this.duration&&(this.loop?n%=this.duration:(n=this.duration,i=!0)),n==this._prevPos)return i;var r=this._prevPos;if(this.position=this._prevPos=n,this._prevPosition=t,this._target)if(i)this._updateTargetProps(null,1);else if(this._steps.length>0){for(var s=0,o=this._steps.length;o>s&&!(this._steps[s].t>n);s++);var a=this._steps[s-1];this._updateTargetProps(a,(this._stepPosition=n-a.t)/a.d)}return 0!=e&&this._actions.length>0&&(this._useTicks?this._runActions(n,n):1==e&&r>n?(r!=this.duration&&this._runActions(r,this.duration),this._runActions(0,n,!0)):this._runActions(r,n)),i&&this.setPaused(!0),this.dispatchEvent("change"),i},e.tick=function(t){this._paused||this.setPosition(this._prevPosition+t)},e.setPaused=function(e){return this._paused===!!e?this:(this._paused=!!e,t._register(this,!e),this)},e.w=e.wait,e.t=e.to,e.c=e.call,e.s=e.set,e.toString=function(){return"[Tween]"},e.clone=function(){throw"Tween can not be cloned."},e._updateTargetProps=function(e,n){var i,r,s,o,a,u;if(e||1!=n){if(this.passive=!!e.v,this.passive)return;e.e&&(n=e.e(n,0,1,1)),i=e.p0,r=e.p1}else this.passive=!1,i=r=this._curQueueProps;for(var c in this._initQueueProps){null==(o=i[c])&&(i[c]=o=this._initQueueProps[c]),null==(a=r[c])&&(r[c]=a=o),s=o==a||0==n||1==n||"number"!=typeof o?1==n?a:o:o+(a-o)*n;var h=!1;if(u=t._plugins[c])for(var l=0,_=u.length;_>l;l++){var p=u[l].tween(this,c,s,i,r,n,!!e&&i==r,!e);p==t.IGNORE?h=!0:s=p}h||(this._target[c]=s)}},e._runActions=function(t,e,n){var i=t,r=e,s=-1,o=this._actions.length,a=1;for(t>e&&(i=e,r=t,s=o,o=a=-1);(s+=a)!=o;){var u=this._actions[s],c=u.t;(c==r||c>i&&r>c||n&&c==t)&&u.f.apply(u.o,u.p)}},e._appendQueueProps=function(e){var n,i,r,s,o;for(var a in e)if(void 0===this._initQueueProps[a]){if(i=this._target[a],n=t._plugins[a])for(r=0,s=n.length;s>r;r++)i=n[r].init(this,a,i);this._initQueueProps[a]=this._curQueueProps[a]=void 0===i?null:i}else i=this._curQueueProps[a];for(var a in e){if(i=this._curQueueProps[a],n=t._plugins[a])for(o=o||{},r=0,s=n.length;s>r;r++)n[r].step&&n[r].step(this,a,i,e[a],o);this._curQueueProps[a]=e[a]}return o&&this._appendQueueProps(o),this._curQueueProps},e._cloneProps=function(t){var e={};for(var n in t)e[n]=t[n];return e},e._addStep=function(t){return t.d>0&&(this._steps.push(t),t.t=this.duration,this.duration+=t.d),this},e._addAction=function(t){return t.t=this.duration,this._actions.push(t),this},e._set=function(t,e){for(var n in t)e[n]=t[n]},createjs.Tween=createjs.promote(t,"EventDispatcher")}(),this.createjs=this.createjs||{},function(){function t(t,e,n){this.EventDispatcher_constructor(),this.ignoreGlobalPause=!1,this.duration=0,this.loop=!1,this.position=null,this._paused=!1,this._tweens=[],this._labels=null,this._labelList=null,this._prevPosition=0,this._prevPos=-1,this._useTicks=!1,n&&(this._useTicks=n.useTicks,this.loop=n.loop,this.ignoreGlobalPause=n.ignoreGlobalPause,n.onChange&&this.addEventListener("change",n.onChange)),t&&this.addTween.apply(this,t),this.setLabels(e),n&&n.paused?this._paused=!0:createjs.Tween._register(this,!0),n&&null!=n.position&&this.setPosition(n.position,createjs.Tween.NONE)}var e=createjs.extend(t,createjs.EventDispatcher);e.addTween=function(t){var e=arguments.length;if(e>1){for(var n=0;e>n;n++)this.addTween(arguments[n]);return arguments[0]}return 0==e?null:(this.removeTween(t),this._tweens.push(t),t.setPaused(!0),t._paused=!1,t._useTicks=this._useTicks,t.duration>this.duration&&(this.duration=t.duration),this._prevPos>=0&&t.setPosition(this._prevPos,createjs.Tween.NONE),t)},e.removeTween=function(t){var e=arguments.length;if(e>1){for(var n=!0,i=0;e>i;i++)n=n&&this.removeTween(arguments[i]);return n}if(0==e)return!1;for(var r=this._tweens,i=r.length;i--;)if(r[i]==t)return r.splice(i,1),t.duration>=this.duration&&this.updateDuration(),!0;return!1},e.addLabel=function(t,e){this._labels[t]=e;var n=this._labelList;if(n){for(var i=0,r=n.length;r>i&&!(e<n[i].position);i++);n.splice(i,0,{label:t,position:e})}},e.setLabels=function(t){this._labels=t?t:{}},e.getLabels=function(){var t=this._labelList;if(!t){t=this._labelList=[];var e=this._labels;for(var n in e)t.push({label:n,position:e[n]});t.sort(function(t,e){return t.position-e.position})}return t},e.getCurrentLabel=function(){var t=this.getLabels(),e=this.position,n=t.length;if(n){for(var i=0;n>i&&!(e<t[i].position);i++);return 0==i?null:t[i-1].label}return null},e.gotoAndPlay=function(t){this.setPaused(!1),this._goto(t)},e.gotoAndStop=function(t){this.setPaused(!0),this._goto(t)},e.setPosition=function(t,e){0>t&&(t=0);var n=this.loop?t%this.duration:t,i=!this.loop&&t>=this.duration;if(n==this._prevPos)return i;this._prevPosition=t,this.position=this._prevPos=n;for(var r=0,s=this._tweens.length;s>r;r++)if(this._tweens[r].setPosition(n,e),n!=this._prevPos)return!1;return i&&this.setPaused(!0),this.dispatchEvent("change"),i},e.setPaused=function(t){this._paused=!!t,createjs.Tween._register(this,!t)},e.updateDuration=function(){this.duration=0;for(var t=0,e=this._tweens.length;e>t;t++){var n=this._tweens[t];n.duration>this.duration&&(this.duration=n.duration)}},e.tick=function(t){this.setPosition(this._prevPosition+t)},e.resolve=function(t){var e=Number(t);return isNaN(e)&&(e=this._labels[t]),e},e.toString=function(){return"[Timeline]"},e.clone=function(){throw"Timeline can not be cloned."},e._goto=function(t){var e=this.resolve(t);null!=e&&this.setPosition(e)},createjs.Timeline=createjs.promote(t,"EventDispatcher")}(),this.createjs=this.createjs||{},function(){function t(){throw"Ease cannot be instantiated."}t.linear=function(t){return t},t.none=t.linear,t.get=function(t){return-1>t&&(t=-1),t>1&&(t=1),function(e){return 0==t?e:0>t?e*(e*-t+1+t):e*((2-e)*t+(1-t))}},t.getPowIn=function(t){return function(e){return Math.pow(e,t)}},t.getPowOut=function(t){return function(e){return 1-Math.pow(1-e,t)}},t.getPowInOut=function(t){return function(e){return(e*=2)<1?.5*Math.pow(e,t):1-.5*Math.abs(Math.pow(2-e,t))}},t.quadIn=t.getPowIn(2),t.quadOut=t.getPowOut(2),t.quadInOut=t.getPowInOut(2),t.cubicIn=t.getPowIn(3),t.cubicOut=t.getPowOut(3),t.cubicInOut=t.getPowInOut(3),t.quartIn=t.getPowIn(4),t.quartOut=t.getPowOut(4),t.quartInOut=t.getPowInOut(4),t.quintIn=t.getPowIn(5),t.quintOut=t.getPowOut(5),t.quintInOut=t.getPowInOut(5),t.sineIn=function(t){return 1-Math.cos(t*Math.PI/2)},t.sineOut=function(t){return Math.sin(t*Math.PI/2)},t.sineInOut=function(t){return-.5*(Math.cos(Math.PI*t)-1)},t.getBackIn=function(t){return function(e){return e*e*((t+1)*e-t)}},t.backIn=t.getBackIn(1.7),t.getBackOut=function(t){return function(e){return--e*e*((t+1)*e+t)+1}},t.backOut=t.getBackOut(1.7),t.getBackInOut=function(t){return t*=1.525,function(e){return(e*=2)<1?.5*e*e*((t+1)*e-t):.5*((e-=2)*e*((t+1)*e+t)+2)}},t.backInOut=t.getBackInOut(1.7),t.circIn=function(t){return-(Math.sqrt(1-t*t)-1)},t.circOut=function(t){return Math.sqrt(1- --t*t)},t.circInOut=function(t){return(t*=2)<1?-.5*(Math.sqrt(1-t*t)-1):.5*(Math.sqrt(1-(t-=2)*t)+1)},t.bounceIn=function(e){return 1-t.bounceOut(1-e)},t.bounceOut=function(t){return 1/2.75>t?7.5625*t*t:2/2.75>t?7.5625*(t-=1.5/2.75)*t+.75:2.5/2.75>t?7.5625*(t-=2.25/2.75)*t+.9375:7.5625*(t-=2.625/2.75)*t+.984375},t.bounceInOut=function(e){return.5>e?.5*t.bounceIn(2*e):.5*t.bounceOut(2*e-1)+.5},t.getElasticIn=function(t,e){var n=2*Math.PI;return function(i){if(0==i||1==i)return i;var r=e/n*Math.asin(1/t);return-(t*Math.pow(2,10*(i-=1))*Math.sin((i-r)*n/e))}},t.elasticIn=t.getElasticIn(1,.3),t.getElasticOut=function(t,e){var n=2*Math.PI;return function(i){if(0==i||1==i)return i;var r=e/n*Math.asin(1/t);return t*Math.pow(2,-10*i)*Math.sin((i-r)*n/e)+1}},t.elasticOut=t.getElasticOut(1,.3),t.getElasticInOut=function(t,e){var n=2*Math.PI;return function(i){var r=e/n*Math.asin(1/t);return(i*=2)<1?-.5*t*Math.pow(2,10*(i-=1))*Math.sin((i-r)*n/e):t*Math.pow(2,-10*(i-=1))*Math.sin((i-r)*n/e)*.5+1}},t.elasticInOut=t.getElasticInOut(1,.3*1.5),createjs.Ease=t}(),this.createjs=this.createjs||{},function(){function t(){throw"MotionGuidePlugin cannot be instantiated."}t.priority=0,t._rotOffS,t._rotOffE,t._rotNormS,t._rotNormE,t.install=function(){return createjs.Tween.installPlugin(t,["guide","x","y","rotation"]),createjs.Tween.IGNORE},t.init=function(t,e,n){var i=t.target;return i.hasOwnProperty("x")||(i.x=0),i.hasOwnProperty("y")||(i.y=0),i.hasOwnProperty("rotation")||(i.rotation=0),"rotation"==e&&(t.__needsRot=!0),"guide"==e?null:n},t.step=function(e,n,i,r,s){if("rotation"==n&&(e.__rotGlobalS=i,e.__rotGlobalE=r,t.testRotData(e,s)),"guide"!=n)return r;var o,a=r;a.hasOwnProperty("path")||(a.path=[]);var u=a.path;if(a.hasOwnProperty("end")||(a.end=1),a.hasOwnProperty("start")||(a.start=i&&i.hasOwnProperty("end")&&i.path===u?i.end:0),a.hasOwnProperty("_segments")&&a._length)return r;var c=u.length,h=10;if(!(c>=6&&(c-2)%4==0))throw"invalid 'path' data, please see documentation for valid paths";a._segments=[],a._length=0;for(var l=2;c>l;l+=4){for(var _,p,f=u[l-2],d=u[l-1],v=u[l+0],g=u[l+1],m=u[l+2],w=u[l+3],P=f,T=d,E=0,b=[],O=1;h>=O;O++){var k=O/h,I=1-k;_=I*I*f+2*I*k*v+k*k*m,p=I*I*d+2*I*k*g+k*k*w,E+=b[b.push(Math.sqrt((o=_-P)*o+(o=p-T)*o))-1],P=_,T=p}a._segments.push(E),a._segments.push(b),a._length+=E}o=a.orient,a.orient=!0;var j={};return t.calc(a,a.start,j),e.__rotPathS=Number(j.rotation.toFixed(5)),t.calc(a,a.end,j),e.__rotPathE=Number(j.rotation.toFixed(5)),a.orient=!1,t.calc(a,a.end,s),a.orient=o,a.orient?(e.__guideData=a,t.testRotData(e,s),r):r},t.testRotData=function(t,e){if(void 0===t.__rotGlobalS||void 0===t.__rotGlobalE){if(t.__needsRot)return;t.__rotGlobalS=t.__rotGlobalE=void 0!==t._curQueueProps.rotation?t._curQueueProps.rotation:e.rotation=t.target.rotation||0}if(void 0!==t.__guideData){var n=t.__guideData,i=t.__rotGlobalE-t.__rotGlobalS,r=t.__rotPathE-t.__rotPathS,s=i-r;if("auto"==n.orient)s>180?s-=360:-180>s&&(s+=360);else if("cw"==n.orient){for(;0>s;)s+=360;0==s&&i>0&&180!=i&&(s+=360)}else if("ccw"==n.orient){for(s=i-(r>180?360-r:r);s>0;)s-=360;0==s&&0>i&&-180!=i&&(s-=360)}n.rotDelta=s,n.rotOffS=t.__rotGlobalS-t.__rotPathS,t.__rotGlobalS=t.__rotGlobalE=t.__guideData=t.__needsRot=void 0}},t.tween=function(e,n,i,r,s,o,a){var u=s.guide;if(void 0==u||u===r.guide)return i;if(u.lastRatio!=o){var c=(u.end-u.start)*(a?u.end:o)+u.start;switch(t.calc(u,c,e.target),u.orient){case"cw":case"ccw":case"auto":e.target.rotation+=u.rotOffS+u.rotDelta*o;break;case"fixed":default:e.target.rotation+=u.rotOffS}u.lastRatio=o}return"rotation"!=n||u.orient&&"false"!=u.orient?e.target[n]:i},t.calc=function(e,n,i){void 0==e._segments&&t.validate(e),void 0==i&&(i={x:0,y:0,rotation:0});for(var r=e._segments,s=e.path,o=e._length*n,a=r.length-2,u=0;o>r[u]&&a>u;)o-=r[u],u+=2;var c=r[u+1],h=0;for(a=c.length-1;o>c[h]&&a>h;)o-=c[h],h++;var l=h/++a+o/(a*c[h]);u=2*u+2;var _=1-l;return i.x=_*_*s[u-2]+2*_*l*s[u+0]+l*l*s[u+2],i.y=_*_*s[u-1]+2*_*l*s[u+1]+l*l*s[u+3],e.orient&&(i.rotation=57.2957795*Math.atan2((s[u+1]-s[u-1])*_+(s[u+3]-s[u+1])*l,(s[u+0]-s[u-2])*_+(s[u+2]-s[u+0])*l)),i},createjs.MotionGuidePlugin=t}(),this.createjs=this.createjs||{},function(){var t=createjs.TweenJS=createjs.TweenJS||{};t.version="NEXT",t.buildDate="Thu, 11 Dec 2014 23:16:15 GMT"}();
//# sourceMappingURL=tweenjs-NEXT.combined.js
//# sourceMappingURL=tweenjs-NEXT.combined.js.map