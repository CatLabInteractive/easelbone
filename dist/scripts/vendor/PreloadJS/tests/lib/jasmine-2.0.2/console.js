/*
Copyright (c) 2008-2014 Pivotal Labs

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

function getJasmineRequireObj(){return typeof module!="undefined"&&module.exports?exports:(window.jasmineRequire=window.jasmineRequire||{},window.jasmineRequire)}getJasmineRequireObj().console=function(e,t){t.ConsoleReporter=e.ConsoleReporter()},getJasmineRequireObj().ConsoleReporter=function(){function t(t){function c(){n("\n")}function h(e,t){return r?l[e]+t+l.none:t}function p(e,t){return t==1?e:e+"s"}function d(e,t){var n=[];for(var r=0;r<t;r++)n.push(e);return n}function v(e,t){var n=(e||"").split("\n"),r=[];for(var i=0;i<n.length;i++)r.push(d(" ",t).join("")+n[i]);return r.join("\n")}function m(e){c(),n(e.fullName);for(var t=0;t<e.failedExpectations.length;t++){var r=e.failedExpectations[t];c(),n(v(r.message,2)),n(v(r.stack,2))}c()}var n=t.print,r=t.showColors||!1,i=t.onComplete||function(){},s=t.timer||e,o,u,a=[],f,l={green:"[32m",red:"[31m",yellow:"[33m",none:"[0m"};return this.jasmineStarted=function(){o=0,u=0,f=0,n("Started"),c(),s.start()},this.jasmineDone=function(){c();for(var e=0;e<a.length;e++)m(a[e]);if(o>0){c();var t=o+" "+p("spec",o)+", "+u+" "+p("failure",u);f&&(t+=", "+f+" pending "+p("spec",f)),n(t)}else n("No specs found");c();var r=s.elapsed()/1e3;n("Finished in "+r+" "+p("second",r)),c(),i(u===0)},this.specDone=function(e){o++;if(e.status=="pending"){f++,n(h("yellow","*"));return}if(e.status=="passed"){n(h("green","."));return}e.status=="failed"&&(u++,a.push(e),n(h("red","F")))},this}var e={start:function(){},elapsed:function(){return 0}};return t};