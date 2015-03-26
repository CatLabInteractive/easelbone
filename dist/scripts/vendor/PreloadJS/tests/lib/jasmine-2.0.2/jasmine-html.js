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

jasmineRequire.html=function(e){e.ResultsNode=jasmineRequire.ResultsNode(),e.HtmlReporter=jasmineRequire.HtmlReporter(e),e.QueryString=jasmineRequire.QueryString(),e.HtmlSpecFilter=jasmineRequire.HtmlSpecFilter()},jasmineRequire.HtmlReporter=function(e){function n(n){function w(e){return i().querySelector(".jasmine_html-reporter "+e)}function E(){var e=w("");e&&i().removeChild(e)}function S(e,t,n){var r=s(e);for(var i=2;i<arguments.length;i++){var u=arguments[i];typeof u=="string"?r.appendChild(o(u)):u&&r.appendChild(u)}for(var a in t)a=="className"?r[a]=t[a]:r.setAttribute(a,t[a]);return r}function x(e,t){var n=t==1?e:e+"s";return""+t+" "+n}function T(e){return"?spec="+encodeURIComponent(e.fullName)}function N(e){p.setAttribute("class","jasmine_html-reporter "+e)}function C(e){return e.failedExpectations.length+e.passedExpectations.length===0&&e.status==="passed"}var r=n.env||{},i=n.getContainer,s=n.createElement,o=n.createTextNode,u=n.onRaiseExceptionsClick||function(){},a=n.timer||t,f=[],l=0,c=0,h=0,p,d;this.initialize=function(){E(),p=S("div",{className:"jasmine_html-reporter"},S("div",{className:"banner"},S("a",{className:"title",href:"http://jasmine.github.io/",target:"_blank"}),S("span",{className:"version"},e.version)),S("ul",{className:"symbol-summary"}),S("div",{className:"alert"}),S("div",{className:"results"},S("div",{className:"failures"}))),i().appendChild(p),d=w(".symbol-summary")};var v;this.jasmineStarted=function(e){v=e.totalSpecsDefined||0,a.start()};var m=S("div",{className:"summary"}),g=new e.ResultsNode({},"",null),y=g;this.suiteStarted=function(e){y.addChild(e,"suite"),y=y.last()},this.suiteDone=function(e){if(y==g)return;y=y.parent},this.specStarted=function(e){y.addChild(e,"spec")};var b=[];return this.specDone=function(e){C(e)&&console&&console.error&&console.error("Spec '"+e.fullName+"' has no expectations."),e.status!="disabled"&&l++,d.appendChild(S("li",{className:C(e)?"empty":e.status,id:"spec_"+e.id,title:e.fullName}));if(e.status=="failed"){c++;var t=S("div",{className:"spec-detail failed"},S("div",{className:"description"},S("a",{title:e.fullName,href:T(e)},e.fullName)),S("div",{className:"messages"})),n=t.childNodes[1];for(var r=0;r<e.failedExpectations.length;r++){var i=e.failedExpectations[r];n.appendChild(S("div",{className:"result-message"},i.message)),n.appendChild(S("div",{className:"stack-trace"},i.stack))}b.push(t)}e.status=="pending"&&h++},this.jasmineDone=function(){function p(e,t){var n;for(var r=0;r<e.children.length;r++){var i=e.children[r];if(i.type=="suite"){var s=S("ul",{className:"suite",id:"suite-"+i.result.id},S("li",{className:"suite-detail"},S("a",{href:T(i.result)},i.result.description)));p(i,s),t.appendChild(s)}if(i.type=="spec"){t.getAttribute("class")!="specs"&&(n=S("ul",{className:"specs"}),t.appendChild(n));var o=i.result.description;C(i.result)&&(o="SPEC HAS NO EXPECTATIONS "+o),n.appendChild(S("li",{className:i.result.status,id:"spec-"+i.result.id},S("a",{href:T(i.result)},o)))}}}var e=w(".banner");e.appendChild(S("span",{className:"duration"},"finished in "+a.elapsed()/1e3+"s"));var t=w(".alert");t.appendChild(S("span",{className:"exceptions"},S("label",{className:"label","for":"raise-exceptions"},"raise exceptions"),S("input",{className:"raise",id:"raise-exceptions",type:"checkbox"})));var n=w("#raise-exceptions");n.checked=!r.catchingExceptions(),n.onclick=u;if(l<v){var i="Ran "+l+" of "+v+" specs - run all";t.appendChild(S("span",{className:"bar skipped"},S("a",{href:"?",title:"Run all specs"},i)))}var s="",o="bar ";v>0?(s+=x("spec",l)+", "+x("failure",c),h&&(s+=", "+x("pending spec",h)),o+=c>0?"failed":"passed"):(o+="skipped",s+="No specs found"),t.appendChild(S("span",{className:o},s));var f=w(".results");f.appendChild(m),p(g,m);if(b.length){t.appendChild(S("span",{className:"menu bar spec-list"},S("span",{},"Spec List | "),S("a",{className:"failures-menu",href:"#"},"Failures"))),t.appendChild(S("span",{className:"menu bar failure-list"},S("a",{className:"spec-list-menu",href:"#"},"Spec List"),S("span",{}," | Failures "))),w(".failures-menu").onclick=function(){N("failure-list")},w(".spec-list-menu").onclick=function(){N("spec-list")},N("failure-list");var d=w(".failures");for(var y=0;y<b.length;y++)d.appendChild(b[y])}},this}var t={start:function(){},elapsed:function(){return 0}};return n},jasmineRequire.HtmlSpecFilter=function(){function e(e){var t=e&&e.filterString()&&e.filterString().replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&"),n=new RegExp(t);this.matches=function(e){return n.test(e)}}return e},jasmineRequire.ResultsNode=function(){function e(t,n,r){this.result=t,this.type=n,this.parent=r,this.children=[],this.addChild=function(t,n){this.children.push(new e(t,n,this))},this.last=function(){return this.children[this.children.length-1]}}return e},jasmineRequire.QueryString=function(){function e(e){function t(e){var t=[];for(var n in e)t.push(encodeURIComponent(n)+"="+encodeURIComponent(e[n]));return"?"+t.join("&")}function n(){var t=e.getWindowLocation().search.substring(1),n=[],r={};if(t.length>0){n=t.split("&");for(var i=0;i<n.length;i++){var s=n[i].split("="),o=decodeURIComponent(s[1]);if(o==="true"||o==="false")o=JSON.parse(o);r[decodeURIComponent(s[0])]=o}}return r}return this.setParam=function(r,i){var s=n();s[r]=i,e.getWindowLocation().search=t(s)},this.getParam=function(e){return n()[e]},this}return e};