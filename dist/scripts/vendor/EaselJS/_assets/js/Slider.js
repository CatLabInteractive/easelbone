/*
* Slider
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

(function(){function e(e,t,n,r){this.Shape_constructor(),this.min=this.value=e||0,this.max=t||100,this.width=n||100,this.height=r||20,this.values={},this.trackColor="#EEE",this.thumbColor="#666",this.cursor="pointer",this.on("mousedown",this._handleInput,this),this.on("pressmove",this._handleInput,this)}var t=createjs.extend(e,createjs.Shape);t.isVisible=function(){return!0},t.draw=function(e,t){if(this._checkChange()){var n=(this.width-this.height)*Math.max(0,Math.min(1,(this.value-this.min)/(this.max-this.min)));this.graphics.clear().beginFill(this.trackColor).drawRect(0,0,this.width,this.height).beginFill(this.thumbColor).drawRect(n,0,this.height,this.height)}this.Shape_draw(e,!0)},t._checkChange=function(){var e=this,t=e.values;return e.value!==t.value||e.min!==t.min||e.max!==t.max||e.width!==t.width||e.height!==t.height?(t.min=e.min,t.max=e.max,t.value=e.value,t.width=e.width,t.height=e.height,!0):!1},t._handleInput=function(e){var t=(e.localX-this.height/2)/(this.width-this.height)*(this.max-this.min)+this.min;t=Math.max(this.min,Math.min(this.max,t));if(t==this.value)return;this.value=t,this.dispatchEvent("change")},window.Slider=createjs.promote(e,"Shape")})();