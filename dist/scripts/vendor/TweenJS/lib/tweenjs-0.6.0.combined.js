/*!
* TweenJS
* Visit http://createjs.com/ for documentation, updates and examples.
*
* Copyright (c) 2010 gskinner.com, inc.
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/

this.createjs=this.createjs||{},createjs.extend=function(e,t){"use strict";function n(){this.constructor=e}return n.prototype=t.prototype,e.prototype=new n},this.createjs=this.createjs||{},createjs.promote=function(e,t){"use strict";var n=e.prototype,r=Object.getPrototypeOf&&Object.getPrototypeOf(n)||n.__proto__;if(r){n[(t+="_")+"constructor"]=r.constructor;for(var i in r)n.hasOwnProperty(i)&&typeof r[i]=="function"&&(n[t+i]=r[i])}return e},this.createjs=this.createjs||{},function(){"use strict";function e(e,t,n){this.type=e,this.target=null,this.currentTarget=null,this.eventPhase=0,this.bubbles=!!t,this.cancelable=!!n,this.timeStamp=(new Date).getTime(),this.defaultPrevented=!1,this.propagationStopped=!1,this.immediatePropagationStopped=!1,this.removed=!1}var t=e.prototype;t.preventDefault=function(){this.defaultPrevented=this.cancelable&&!0},t.stopPropagation=function(){this.propagationStopped=!0},t.stopImmediatePropagation=function(){this.immediatePropagationStopped=this.propagationStopped=!0},t.remove=function(){this.removed=!0},t.clone=function(){return new e(this.type,this.bubbles,this.cancelable)},t.set=function(e){for(var t in e)this[t]=e[t];return this},t.toString=function(){return"[Event (type="+this.type+")]"},createjs.Event=e}(),this.createjs=this.createjs||{},function(){"use strict";function e(){this._listeners=null,this._captureListeners=null}var t=e.prototype;e.initialize=function(e){e.addEventListener=t.addEventListener,e.on=t.on,e.removeEventListener=e.off=t.removeEventListener,e.removeAllEventListeners=t.removeAllEventListeners,e.hasEventListener=t.hasEventListener,e.dispatchEvent=t.dispatchEvent,e._dispatchEvent=t._dispatchEvent,e.willTrigger=t.willTrigger},t.addEventListener=function(e,t,n){var r;n?r=this._captureListeners=this._captureListeners||{}:r=this._listeners=this._listeners||{};var i=r[e];return i&&this.removeEventListener(e,t,n),i=r[e],i?i.push(t):r[e]=[t],t},t.on=function(e,t,n,r,i,s){return t.handleEvent&&(n=n||t,t=t.handleEvent),n=n||this,this.addEventListener(e,function(e){t.call(n,e,i),r&&e.remove()},s)},t.removeEventListener=function(e,t,n){var r=n?this._captureListeners:this._listeners;if(!r)return;var i=r[e];if(!i)return;for(var s=0,o=i.length;s<o;s++)if(i[s]==t){o==1?delete r[e]:i.splice(s,1);break}},t.off=t.removeEventListener,t.removeAllEventListeners=function(e){e?(this._listeners&&delete this._listeners[e],this._captureListeners&&delete this._captureListeners[e]):this._listeners=this._captureListeners=null},t.dispatchEvent=function(e){if(typeof e=="string"){var t=this._listeners;if(!t||!t[e])return!1;e=new createjs.Event(e)}else e.target&&e.clone&&(e=e.clone());try{e.target=this}catch(n){}if(!e.bubbles||!this.parent)this._dispatchEvent(e,2);else{var r=this,i=[r];while(r.parent)i.push(r=r.parent);var s,o=i.length;for(s=o-1;s>=0&&!e.propagationStopped;s--)i[s]._dispatchEvent(e,1+(s==0));for(s=1;s<o&&!e.propagationStopped;s++)i[s]._dispatchEvent(e,3)}return e.defaultPrevented},t.hasEventListener=function(e){var t=this._listeners,n=this._captureListeners;return!!(t&&t[e]||n&&n[e])},t.willTrigger=function(e){var t=this;while(t){if(t.hasEventListener(e))return!0;t=t.parent}return!1},t.toString=function(){return"[EventDispatcher]"},t._dispatchEvent=function(e,t){var n,r=t==1?this._captureListeners:this._listeners;if(e&&r){var i=r[e.type];if(!i||!(n=i.length))return;try{e.currentTarget=this}catch(s){}try{e.eventPhase=t}catch(s){}e.removed=!1,i=i.slice();for(var o=0;o<n&&!e.immediatePropagationStopped;o++){var u=i[o];u.handleEvent?u.handleEvent(e):u(e),e.removed&&(this.off(e.type,u,t==1),e.removed=!1)}}},createjs.EventDispatcher=e}(),this.createjs=this.createjs||{},function(){"use strict";function e(){throw"Ticker cannot be instantiated."}e.RAF_SYNCHED="synched",e.RAF="raf",e.TIMEOUT="timeout",e.useRAF=!1,e.timingMode=null,e.maxDelta=0,e.paused=!1,e.removeEventListener=null,e.removeAllEventListeners=null,e.dispatchEvent=null,e.hasEventListener=null,e._listeners=null,createjs.EventDispatcher.initialize(e),e._addEventListener=e.addEventListener,e.addEventListener=function(){return!e._inited&&e.init(),e._addEventListener.apply(e,arguments)},e._inited=!1,e._startTime=0,e._pausedTime=0,e._ticks=0,e._pausedTicks=0,e._interval=50,e._lastTime=0,e._times=null,e._tickTimes=null,e._timerId=null,e._raf=!0,e.setInterval=function(t){e._interval=t;if(!e._inited)return;e._setupTick()},e.getInterval=function(){return e._interval},e.setFPS=function(t){e.setInterval(1e3/t)},e.getFPS=function(){return 1e3/e._interval};try{Object.defineProperties(e,{interval:{get:e.getInterval,set:e.setInterval},framerate:{get:e.getFPS,set:e.setFPS}})}catch(t){console.log(t)}e.init=function(){if(e._inited)return;e._inited=!0,e._times=[],e._tickTimes=[],e._startTime=e._getTime(),e._times.push(e._lastTime=0),e.interval=e._interval},e.reset=function(){if(e._raf){var t=window.cancelAnimationFrame||window.webkitCancelAnimationFrame||window.mozCancelAnimationFrame||window.oCancelAnimationFrame||window.msCancelAnimationFrame;t&&t(e._timerId)}else clearTimeout(e._timerId);e.removeAllEventListeners("tick"),e._timerId=e._times=e._tickTimes=null,e._startTime=e._lastTime=e._ticks=0,e._inited=!1},e.getMeasuredTickTime=function(t){var n=0,r=e._tickTimes;if(!r||r.length<1)return-1;t=Math.min(r.length,t||e.getFPS()|0);for(var i=0;i<t;i++)n+=r[i];return n/t},e.getMeasuredFPS=function(t){var n=e._times;return!n||n.length<2?-1:(t=Math.min(n.length-1,t||e.getFPS()|0),1e3/((n[0]-n[t])/t))},e.setPaused=function(t){e.paused=t},e.getPaused=function(){return e.paused},e.getTime=function(t){return e._startTime?e._getTime()-(t?e._pausedTime:0):-1},e.getEventTime=function(t){return e._startTime?(e._lastTime||e._startTime)-(t?e._pausedTime:0):-1},e.getTicks=function(t){return e._ticks-(t?e._pausedTicks:0)},e._handleSynch=function(){e._timerId=null,e._setupTick(),e._getTime()-e._lastTime>=(e._interval-1)*.97&&e._tick()},e._handleRAF=function(){e._timerId=null,e._setupTick(),e._tick()},e._handleTimeout=function(){e._timerId=null,e._setupTick(),e._tick()},e._setupTick=function(){if(e._timerId!=null)return;var t=e.timingMode||e.useRAF&&e.RAF_SYNCHED;if(t==e.RAF_SYNCHED||t==e.RAF){var n=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame;if(n){e._timerId=n(t==e.RAF?e._handleRAF:e._handleSynch),e._raf=!0;return}}e._raf=!1,e._timerId=setTimeout(e._handleTimeout,e._interval)},e._tick=function(){var t=e.paused,n=e._getTime(),r=n-e._lastTime;e._lastTime=n,e._ticks++,t&&(e._pausedTicks++,e._pausedTime+=r);if(e.hasEventListener("tick")){var i=new createjs.Event("tick"),s=e.maxDelta;i.delta=s&&r>s?s:r,i.paused=t,i.time=n,i.runTime=n-e._pausedTime,e.dispatchEvent(i)}e._tickTimes.unshift(e._getTime()-n);while(e._tickTimes.length>100)e._tickTimes.pop();e._times.unshift(n);while(e._times.length>100)e._times.pop()};var n=window.performance&&(performance.now||performance.mozNow||performance.msNow||performance.oNow||performance.webkitNow);e._getTime=function(){return(n&&n.call(performance)||(new Date).getTime())-e._startTime},createjs.Ticker=e}(),this.createjs=this.createjs||{},function(){"use strict";function e(t,n,r){this.ignoreGlobalPause=!1,this.loop=!1,this.duration=0,this.pluginData=r||{},this.target=t,this.position=null,this.passive=!1,this._paused=!1,this._curQueueProps={},this._initQueueProps={},this._steps=[],this._actions=[],this._prevPosition=0,this._stepPosition=0,this._prevPos=-1,this._target=t,this._useTicks=!1,this._inited=!1,n&&(this._useTicks=n.useTicks,this.ignoreGlobalPause=n.ignoreGlobalPause,this.loop=n.loop,n.onChange&&this.addEventListener("change",n.onChange),n.override&&e.removeTweens(t)),n&&n.paused?this._paused=!0:createjs.Tween._register(this,!0),n&&n.position!=null&&this.setPosition(n.position,e.NONE)}var t=createjs.extend(e,createjs.EventDispatcher);e.NONE=0,e.LOOP=1,e.REVERSE=2,e.IGNORE={},e._tweens=[],e._plugins={},e.get=function(t,n,r,i){return i&&e.removeTweens(t),new e(t,n,r)},e.tick=function(t,n){var r=e._tweens.slice();for(var i=r.length-1;i>=0;i--){var s=r[i];if(n&&!s.ignoreGlobalPause||s._paused)continue;s.tick(s._useTicks?1:t)}},e.handleEvent=function(e){e.type=="tick"&&this.tick(e.delta,e.paused)},e.removeTweens=function(t){if(!t.tweenjs_count)return;var n=e._tweens;for(var r=n.length-1;r>=0;r--){var i=n[r];i._target==t&&(i._paused=!0,n.splice(r,1))}t.tweenjs_count=0},e.removeAllTweens=function(){var t=e._tweens;for(var n=0,r=t.length;n<r;n++){var i=t[n];i._paused=!0,i.target.tweenjs_count=0}t.length=0},e.hasActiveTweens=function(t){return t?t.tweenjs_count:e._tweens&&!!e._tweens.length},e.installPlugin=function(t,n){var r=t.priority;r==null&&(t.priority=r=0);for(var i=0,s=n.length,o=e._plugins;i<s;i++){var u=n[i];if(!o[u])o[u]=[t];else{var a=o[u];for(var f=0,l=a.length;f<l;f++)if(r<a[f].priority)break;o[u].splice(f,0,t)}}},e._register=function(t,n){var r=t._target,i=e._tweens;if(n)r&&(r.tweenjs_count=r.tweenjs_count?r.tweenjs_count+1:1),i.push(t),!e._inited&&createjs.Ticker&&(createjs.Ticker.addEventListener("tick",e),e._inited=!0);else{r&&r.tweenjs_count--;var s=i.length;while(s--)if(i[s]==t){i.splice(s,1);return}}},t.wait=function(e,t){if(e==null||e<=0)return this;var n=this._cloneProps(this._curQueueProps);return this._addStep({d:e,p0:n,e:this._linearEase,p1:n,v:t})},t.to=function(e,t,n){if(isNaN(t)||t<0)t=0;return this._addStep({d:t||0,p0:this._cloneProps(this._curQueueProps),e:n,p1:this._cloneProps(this._appendQueueProps(e))})},t.call=function(e,t,n){return this._addAction({f:e,p:t?t:[this],o:n?n:this._target})},t.set=function(e,t){return this._addAction({f:this._set,o:this,p:[e,t?t:this._target]})},t.play=function(e){return e||(e=this),this.call(e.setPaused,[!1],e)},t.pause=function(e){return e||(e=this),this.call(e.setPaused,[!0],e)},t.setPosition=function(e,t){e<0&&(e=0),t==null&&(t=1);var n=e,r=!1;n>=this.duration&&(this.loop?n%=this.duration:(n=this.duration,r=!0));if(n==this._prevPos)return r;var i=this._prevPos;this.position=this._prevPos=n,this._prevPosition=e;if(this._target)if(r)this._updateTargetProps(null,1);else if(this._steps.length>0){for(var s=0,o=this._steps.length;s<o;s++)if(this._steps[s].t>n)break;var u=this._steps[s-1];this._updateTargetProps(u,(this._stepPosition=n-u.t)/u.d)}return t!=0&&this._actions.length>0&&(this._useTicks?this._runActions(n,n):t==1&&n<i?(i!=this.duration&&this._runActions(i,this.duration),this._runActions(0,n,!0)):this._runActions(i,n)),r&&this.setPaused(!0),this.dispatchEvent("change"),r},t.tick=function(e){if(this._paused)return;this.setPosition(this._prevPosition+e)},t.setPaused=function(t){return this._paused===!!t?this:(this._paused=!!t,e._register(this,!t),this)},t.w=t.wait,t.t=t.to,t.c=t.call,t.s=t.set,t.toString=function(){return"[Tween]"},t.clone=function(){throw"Tween can not be cloned."},t._updateTargetProps=function(t,n){var r,i,s,o,u,a;if(!t&&n==1)this.passive=!1,r=i=this._curQueueProps;else{this.passive=!!t.v;if(this.passive)return;t.e&&(n=t.e(n,0,1,1)),r=t.p0,i=t.p1}for(var f in this._initQueueProps){(o=r[f])==null&&(r[f]=o=this._initQueueProps[f]),(u=i[f])==null&&(i[f]=u=o),o==u||n==0||n==1||typeof o!="number"?s=n==1?u:o:s=o+(u-o)*n;var l=!1;if(a=e._plugins[f])for(var c=0,h=a.length;c<h;c++){var p=a[c].tween(this,f,s,r,i,n,!!t&&r==i,!t);p==e.IGNORE?l=!0:s=p}l||(this._target[f]=s)}},t._runActions=function(e,t,n){var r=e,i=t,s=-1,o=this._actions.length,u=1;e>t&&(r=t,i=e,s=o,o=u=-1);while((s+=u)!=o){var a=this._actions[s],f=a.t;(f==i||f>r&&f<i||n&&f==e)&&a.f.apply(a.o,a.p)}},t._appendQueueProps=function(t){var n,r,i,s,o;for(var u in t)if(this._initQueueProps[u]===undefined){r=this._target[u];if(n=e._plugins[u])for(i=0,s=n.length;i<s;i++)r=n[i].init(this,u,r);this._initQueueProps[u]=this._curQueueProps[u]=r===undefined?null:r}else r=this._curQueueProps[u];for(var u in t){r=this._curQueueProps[u];if(n=e._plugins[u]){o=o||{};for(i=0,s=n.length;i<s;i++)n[i].step&&n[i].step(this,u,r,t[u],o)}this._curQueueProps[u]=t[u]}return o&&this._appendQueueProps(o),this._curQueueProps},t._cloneProps=function(e){var t={};for(var n in e)t[n]=e[n];return t},t._addStep=function(e){return e.d>0&&(this._steps.push(e),e.t=this.duration,this.duration+=e.d),this},t._addAction=function(e){return e.t=this.duration,this._actions.push(e),this},t._set=function(e,t){for(var n in e)t[n]=e[n]},createjs.Tween=createjs.promote(e,"EventDispatcher")}(),this.createjs=this.createjs||{},function(){"use strict";function e(e,t,n){this.EventDispatcher_constructor(),this.ignoreGlobalPause=!1,this.duration=0,this.loop=!1,this.position=null,this._paused=!1,this._tweens=[],this._labels=null,this._labelList=null,this._prevPosition=0,this._prevPos=-1,this._useTicks=!1,n&&(this._useTicks=n.useTicks,this.loop=n.loop,this.ignoreGlobalPause=n.ignoreGlobalPause,n.onChange&&this.addEventListener("change",n.onChange)),e&&this.addTween.apply(this,e),this.setLabels(t),n&&n.paused?this._paused=!0:createjs.Tween._register(this,!0),n&&n.position!=null&&this.setPosition(n.position,createjs.Tween.NONE)}var t=createjs.extend(e,createjs.EventDispatcher);t.addTween=function(e){var t=arguments.length;if(t>1){for(var n=0;n<t;n++)this.addTween(arguments[n]);return arguments[0]}return t==0?null:(this.removeTween(e),this._tweens.push(e),e.setPaused(!0),e._paused=!1,e._useTicks=this._useTicks,e.duration>this.duration&&(this.duration=e.duration),this._prevPos>=0&&e.setPosition(this._prevPos,createjs.Tween.NONE),e)},t.removeTween=function(e){var t=arguments.length;if(t>1){var n=!0;for(var r=0;r<t;r++)n=n&&this.removeTween(arguments[r]);return n}if(t==0)return!1;var i=this._tweens,r=i.length;while(r--)if(i[r]==e)return i.splice(r,1),e.duration>=this.duration&&this.updateDuration(),!0;return!1},t.addLabel=function(e,t){this._labels[e]=t;var n=this._labelList;if(n){for(var r=0,i=n.length;r<i;r++)if(t<n[r].position)break;n.splice(r,0,{label:e,position:t})}},t.setLabels=function(e){this._labels=e?e:{}},t.getLabels=function(){var e=this._labelList;if(!e){e=this._labelList=[];var t=this._labels;for(var n in t)e.push({label:n,position:t[n]});e.sort(function(e,t){return e.position-t.position})}return e},t.getCurrentLabel=function(){var e=this.getLabels(),t=this.position,n=e.length;if(n){for(var r=0;r<n;r++)if(t<e[r].position)break;return r==0?null:e[r-1].label}return null},t.gotoAndPlay=function(e){this.setPaused(!1),this._goto(e)},t.gotoAndStop=function(e){this.setPaused(!0),this._goto(e)},t.setPosition=function(e,t){e<0&&(e=0);var n=this.loop?e%this.duration:e,r=!this.loop&&e>=this.duration;if(n==this._prevPos)return r;this._prevPosition=e,this.position=this._prevPos=n;for(var i=0,s=this._tweens.length;i<s;i++){this._tweens[i].setPosition(n,t);if(n!=this._prevPos)return!1}return r&&this.setPaused(!0),this.dispatchEvent("change"),r},t.setPaused=function(e){this._paused=!!e,createjs.Tween._register(this,!e)},t.updateDuration=function(){this.duration=0;for(var e=0,t=this._tweens.length;e<t;e++){var n=this._tweens[e];n.duration>this.duration&&(this.duration=n.duration)}},t.tick=function(e){this.setPosition(this._prevPosition+e)},t.resolve=function(e){var t=Number(e);return isNaN(t)&&(t=this._labels[e]),t},t.toString=function(){return"[Timeline]"},t.clone=function(){throw"Timeline can not be cloned."},t._goto=function(e){var t=this.resolve(e);t!=null&&this.setPosition(t)},createjs.Timeline=createjs.promote(e,"EventDispatcher")}(),this.createjs=this.createjs||{},function(){"use strict";function e(){throw"Ease cannot be instantiated."}e.linear=function(e){return e},e.none=e.linear,e.get=function(e){return e<-1&&(e=-1),e>1&&(e=1),function(t){return e==0?t:e<0?t*(t*-e+1+e):t*((2-t)*e+(1-e))}},e.getPowIn=function(e){return function(t){return Math.pow(t,e)}},e.getPowOut=function(e){return function(t){return 1-Math.pow(1-t,e)}},e.getPowInOut=function(e){return function(t){return(t*=2)<1?.5*Math.pow(t,e):1-.5*Math.abs(Math.pow(2-t,e))}},e.quadIn=e.getPowIn(2),e.quadOut=e.getPowOut(2),e.quadInOut=e.getPowInOut(2),e.cubicIn=e.getPowIn(3),e.cubicOut=e.getPowOut(3),e.cubicInOut=e.getPowInOut(3),e.quartIn=e.getPowIn(4),e.quartOut=e.getPowOut(4),e.quartInOut=e.getPowInOut(4),e.quintIn=e.getPowIn(5),e.quintOut=e.getPowOut(5),e.quintInOut=e.getPowInOut(5),e.sineIn=function(e){return 1-Math.cos(e*Math.PI/2)},e.sineOut=function(e){return Math.sin(e*Math.PI/2)},e.sineInOut=function(e){return-0.5*(Math.cos(Math.PI*e)-1)},e.getBackIn=function(e){return function(t){return t*t*((e+1)*t-e)}},e.backIn=e.getBackIn(1.7),e.getBackOut=function(e){return function(t){return--t*t*((e+1)*t+e)+1}},e.backOut=e.getBackOut(1.7),e.getBackInOut=function(e){return e*=1.525,function(t){return(t*=2)<1?.5*t*t*((e+1)*t-e):.5*((t-=2)*t*((e+1)*t+e)+2)}},e.backInOut=e.getBackInOut(1.7),e.circIn=function(e){return-(Math.sqrt(1-e*e)-1)},e.circOut=function(e){return Math.sqrt(1- --e*e)},e.circInOut=function(e){return(e*=2)<1?-0.5*(Math.sqrt(1-e*e)-1):.5*(Math.sqrt(1-(e-=2)*e)+1)},e.bounceIn=function(t){return 1-e.bounceOut(1-t)},e.bounceOut=function(e){return e<1/2.75?7.5625*e*e:e<2/2.75?7.5625*(e-=1.5/2.75)*e+.75:e<2.5/2.75?7.5625*(e-=2.25/2.75)*e+.9375:7.5625*(e-=2.625/2.75)*e+.984375},e.bounceInOut=function(t){return t<.5?e.bounceIn(t*2)*.5:e.bounceOut(t*2-1)*.5+.5},e.getElasticIn=function(e,t){var n=Math.PI*2;return function(r){if(r==0||r==1)return r;var i=t/n*Math.asin(1/e);return-(e*Math.pow(2,10*(r-=1))*Math.sin((r-i)*n/t))}},e.elasticIn=e.getElasticIn(1,.3),e.getElasticOut=function(e,t){var n=Math.PI*2;return function(r){if(r==0||r==1)return r;var i=t/n*Math.asin(1/e);return e*Math.pow(2,-10*r)*Math.sin((r-i)*n/t)+1}},e.elasticOut=e.getElasticOut(1,.3),e.getElasticInOut=function(e,t){var n=Math.PI*2;return function(r){var i=t/n*Math.asin(1/e);return(r*=2)<1?-0.5*e*Math.pow(2,10*(r-=1))*Math.sin((r-i)*n/t):e*Math.pow(2,-10*(r-=1))*Math.sin((r-i)*n/t)*.5+1}},e.elasticInOut=e.getElasticInOut(1,.3*1.5),createjs.Ease=e}(),this.createjs=this.createjs||{},function(){"use strict";function e(){throw"MotionGuidePlugin cannot be instantiated."}e.priority=0,e._rotOffS,e._rotOffE,e._rotNormS,e._rotNormE,e.install=function(){return createjs.Tween.installPlugin(e,["guide","x","y","rotation"]),createjs.Tween.IGNORE},e.init=function(e,t,n){var r=e.target;return r.hasOwnProperty("x")||(r.x=0),r.hasOwnProperty("y")||(r.y=0),r.hasOwnProperty("rotation")||(r.rotation=0),t=="rotation"&&(e.__needsRot=!0),t=="guide"?null:n},e.step=function(t,n,r,i,s){n=="rotation"&&(t.__rotGlobalS=r,t.__rotGlobalE=i,e.testRotData(t,s));if(n!="guide")return i;var o,u=i;u.hasOwnProperty("path")||(u.path=[]);var a=u.path;u.hasOwnProperty("end")||(u.end=1),u.hasOwnProperty("start")||(u.start=r&&r.hasOwnProperty("end")&&r.path===a?r.end:0);if(u.hasOwnProperty("_segments")&&u._length)return i;var f=a.length,l=10;if(f>=6&&(f-2)%4==0){u._segments=[],u._length=0;for(var c=2;c<f;c+=4){var h=a[c-2],p=a[c-1],d=a[c+0],v=a[c+1],m=a[c+2],g=a[c+3],y=h,b=p,w,E,S=0,x=[];for(var T=1;T<=l;T++){var N=T/l,C=1-N;w=C*C*h+2*C*N*d+N*N*m,E=C*C*p+2*C*N*v+N*N*g,S+=x[x.push(Math.sqrt((o=w-y)*o+(o=E-b)*o))-1],y=w,b=E}u._segments.push(S),u._segments.push(x),u._length+=S}o=u.orient,u.orient=!0;var k={};return e.calc(u,u.start,k),t.__rotPathS=Number(k.rotation.toFixed(5)),e.calc(u,u.end,k),t.__rotPathE=Number(k.rotation.toFixed(5)),u.orient=!1,e.calc(u,u.end,s),u.orient=o,u.orient?(t.__guideData=u,e.testRotData(t,s),i):i}throw"invalid 'path' data, please see documentation for valid paths"},e.testRotData=function(e,t){if(e.__rotGlobalS===undefined||e.__rotGlobalE===undefined){if(e.__needsRot)return;e._curQueueProps.rotation!==undefined?e.__rotGlobalS=e.__rotGlobalE=e._curQueueProps.rotation:e.__rotGlobalS=e.__rotGlobalE=t.rotation=e.target.rotation||0}if(e.__guideData===undefined)return;var n=e.__guideData,r=e.__rotGlobalE-e.__rotGlobalS,i=e.__rotPathE-e.__rotPathS,s=r-i;if(n.orient=="auto")s>180?s-=360:s<-180&&(s+=360);else if(n.orient=="cw"){while(s<0)s+=360;s==0&&r>0&&r!=180&&(s+=360)}else if(n.orient=="ccw"){s=r-(i>180?360-i:i);while(s>0)s-=360;s==0&&r<0&&r!=-180&&(s-=360)}n.rotDelta=s,n.rotOffS=e.__rotGlobalS-e.__rotPathS,e.__rotGlobalS=e.__rotGlobalE=e.__guideData=e.__needsRot=undefined},e.tween=function(t,n,r,i,s,o,u,a){var f=s.guide;if(f==undefined||f===i.guide)return r;if(f.lastRatio!=o){var l=(f.end-f.start)*(u?f.end:o)+f.start;e.calc(f,l,t.target);switch(f.orient){case"cw":case"ccw":case"auto":t.target.rotation+=f.rotOffS+f.rotDelta*o;break;case"fixed":default:t.target.rotation+=f.rotOffS}f.lastRatio=o}return n!="rotation"||!!f.orient&&f.orient!="false"?t.target[n]:r},e.calc=function(t,n,r){t._segments==undefined&&e.validate(t),r==undefined&&(r={x:0,y:0,rotation:0});var i=t._segments,s=t.path,o=t._length*n,u=i.length-2,a=0;while(o>i[a]&&a<u)o-=i[a],a+=2;var f=i[a+1],l=0;u=f.length-1;while(o>f[l]&&l<u)o-=f[l],l++;var c=l/++u+o/(u*f[l]);a=a*2+2;var h=1-c;return r.x=h*h*s[a-2]+2*h*c*s[a+0]+c*c*s[a+2],r.y=h*h*s[a-1]+2*h*c*s[a+1]+c*c*s[a+3],t.orient&&(r.rotation=57.2957795*Math.atan2((s[a+1]-s[a-1])*h+(s[a+3]-s[a+1])*c,(s[a+0]-s[a-2])*h+(s[a+2]-s[a+0])*c)),r},createjs.MotionGuidePlugin=e}(),this.createjs=this.createjs||{},function(){"use strict";var e=createjs.TweenJS=createjs.TweenJS||{};e.version="0.6.0",e.buildDate="Thu, 11 Dec 2014 23:32:09 GMT"}();