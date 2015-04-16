/*!
* EaselJS
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

this.createjs=this.createjs||{},function(){"use strict";function e(t,n,r,i){this.Container_constructor(),this.mode=t||e.INDEPENDENT,this.startPosition=n||0,this.loop=r,this.currentFrame=0,this.timeline=new createjs.Timeline(null,i,{paused:!0,position:n,useTicks:!0}),this.paused=!1,this.actionsEnabled=!0,this.autoReset=!0,this.frameBounds=this.frameBounds||null,this.framerate=null,this._synchOffset=0,this._prevPos=-1,this._prevPosition=0,this._t=0,this._managed={}}function r(){throw"MovieClipPlugin cannot be instantiated."}var t=createjs.extend(e,createjs.Container);e.INDEPENDENT="independent",e.SINGLE_FRAME="single",e.SYNCHED="synched",t.getLabels=function(){return this.timeline.getLabels()},t.getCurrentLabel=function(){return this._updateTimeline(),this.timeline.getCurrentLabel()};try{Object.defineProperties(t,{labels:{get:t.getLabels},currentLabel:{get:t.getCurrentLabel}})}catch(n){}t.initialize=e,t.isVisible=function(){return!!(this.visible&&this.alpha>0&&this.scaleX!=0&&this.scaleY!=0)},t.draw=function(e,t){return this.DisplayObject_draw(e,t)?!0:(this._updateTimeline(),this.Container_draw(e,t),!0)},t.play=function(){this.paused=!1},t.stop=function(){this.paused=!0},t.gotoAndPlay=function(e){this.paused=!1,this._goto(e)},t.gotoAndStop=function(e){this.paused=!0,this._goto(e)},t.advance=function(t){var n=e.INDEPENDENT;if(this.mode!=n)return;var r=this,i=r.framerate;while((r=r.parent)&&i==null)r.mode==n&&(i=r._framerate);this._framerate=i;var s=i!=null&&i!=-1&&t!=null?t/(1e3/i)+this._t:1,o=s|0;this._t=s-o;while(!this.paused&&o--)this._prevPosition=this._prevPos<0?0:this._prevPosition+1,this._updateTimeline()},t.clone=function(){throw"MovieClip cannot be cloned."},t.toString=function(){return"[MovieClip (name="+this.name+")]"},t._tick=function(e){this.advance(e&&e.delta),this.Container__tick(e)},t._goto=function(e){var t=this.timeline.resolve(e);if(t==null)return;this._prevPos==-1&&(this._prevPos=NaN),this._prevPosition=t,this._t=0,this._updateTimeline()},t._reset=function(){this._prevPos=-1,this._t=0,this.currentFrame=0},t._updateTimeline=function(){var t=this.timeline,n=this.mode!=e.INDEPENDENT;t.loop=this.loop==null?!0:this.loop,n?t.setPosition(this.startPosition+(this.mode==e.SINGLE_FRAME?0:this._synchOffset),createjs.Tween.NONE):t.setPosition(this._prevPos<0?0:this._prevPosition,this.actionsEnabled?null:createjs.Tween.NONE),this._prevPosition=t._prevPosition;if(this._prevPos==t._prevPos)return;this.currentFrame=this._prevPos=t._prevPos;for(var r in this._managed)this._managed[r]=1;var i=t._tweens;for(var s=0,o=i.length;s<o;s++){var u=i[s],a=u._target;if(a==this||u.passive)continue;var f=u._stepPosition;a instanceof createjs.DisplayObject?this._addManagedChild(a,f):this._setState(a.state,f)}var l=this.children;for(s=l.length-1;s>=0;s--){var c=l[s].id;this._managed[c]==1&&(this.removeChildAt(s),delete this._managed[c])}},t._setState=function(e,t){if(!e)return;for(var n=e.length-1;n>=0;n--){var r=e[n],i=r.t,s=r.p;for(var o in s)i[o]=s[o];this._addManagedChild(i,t)}},t._addManagedChild=function(t,n){if(t._off)return;this.addChildAt(t,0),t instanceof e&&(t._synchOffset=n,t.mode==e.INDEPENDENT&&t.autoReset&&!this._managed[t.id]&&t._reset()),this._managed[t.id]=2},t._getBounds=function(e,t){var n=this.DisplayObject_getBounds();return n||(this._updateTimeline(),this.frameBounds&&(n=this._rectangle.copy(this.frameBounds[this.currentFrame]))),n?this._transformBounds(n,e,t):this.Container__getBounds(e,t)},createjs.MovieClip=createjs.promote(e,"Container"),r.priority=100,r.install=function(){createjs.Tween.installPlugin(r,["startPosition"])},r.init=function(e,t,n){return n},r.step=function(){},r.tween=function(t,n,r,i,s,o,u,a){return t.target instanceof e?o==1?s[n]:i[n]:r},r.install()}(),this.createjs=this.createjs||{},function(){"use strict";var e=createjs.MovieClip=createjs.MovieClip||{};e.version="0.8.0",e.buildDate="Fri, 12 Dec 2014 17:32:57 GMT"}();