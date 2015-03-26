/*
* Copyright (c) 2014 gskinner.com, inc.
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

module.exports=function(e){function o(){if(!r.length){e.option(_portName,-1),s();return}u(r.shift(),function(t,n){if(!t)o();else{var r=Array.isArray(i.configName)?i.configName:[i.configName];r.forEach(function(t){e.config.set(t,n)}),s()}})}function u(e,n){var r=t.createServer();r.on("error",function(t){n(!1,e)}),r.listen(e,function(){n(!0,e),r.close()})}var t=require("net"),n,r,i,s;e.registerMultiTask("findopenport","Prints a list of active ips.",function(){i=this.options(),s=this.async(),r=i.ports||[80,8888,9e3,9999,9001],o()})};