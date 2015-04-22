define(["./core","./var/concat","./var/push","./core/access","./manipulation/var/rcheckableType","./manipulation/support","./data/var/data_priv","./data/var/data_user","./core/init","./data/accepts","./traversing","./selector","./event"],function(e,t,n,r,i,a,o,c){function l(t,n){return e.nodeName(t,"table")&&e.nodeName(11!==n.nodeType?n:n.firstChild,"tr")?t.getElementsByTagName("tbody")[0]||t.appendChild(t.ownerDocument.createElement("tbody")):t}function s(e){return e.type=(null!==e.getAttribute("type"))+"/"+e.type,e}function p(e){var t=C.exec(e.type);return t?e.type=t[1]:e.removeAttribute("type"),e}function h(e,t){for(var n=0,r=e.length;r>n;n++)o.set(e[n],"globalEval",!t||o.get(t[n],"globalEval"))}function d(t,n){var r,i,a,l,s,p,h,d;if(1===n.nodeType){if(o.hasData(t)&&(l=o.access(t),s=o.set(n,l),d=l.events)){delete s.handle,s.events={};for(a in d)for(r=0,i=d[a].length;i>r;r++)e.event.add(n,a,d[a][r])}c.hasData(t)&&(p=c.access(t),h=e.extend({},p),c.set(n,h))}}function u(t,n){var r=t.getElementsByTagName?t.getElementsByTagName(n||"*"):t.querySelectorAll?t.querySelectorAll(n||"*"):[];return void 0===n||n&&e.nodeName(t,n)?e.merge([t],r):r}function f(e,t){var n=t.nodeName.toLowerCase();"input"===n&&i.test(e.type)?t.checked=e.checked:("input"===n||"textarea"===n)&&(t.defaultValue=e.defaultValue)}var m=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,g=/<([\w:]+)/,v=/<|&#?\w+;/,y=/<(?:script|style|link)/i,b=/checked\s*(?:[^=]|=\s*.checked.)/i,T=/^$|\/(?:java|ecma)script/i,C=/^true\/(.*)/,x=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,N={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};return N.optgroup=N.option,N.tbody=N.tfoot=N.colgroup=N.caption=N.thead,N.th=N.td,e.extend({clone:function(t,n,r){var i,o,c,l,s=t.cloneNode(!0),p=e.contains(t.ownerDocument,t);if(!(a.noCloneChecked||1!==t.nodeType&&11!==t.nodeType||e.isXMLDoc(t)))for(l=u(s),c=u(t),i=0,o=c.length;o>i;i++)f(c[i],l[i]);if(n)if(r)for(c=c||u(t),l=l||u(s),i=0,o=c.length;o>i;i++)d(c[i],l[i]);else d(t,s);return l=u(s,"script"),l.length>0&&h(l,!p&&u(t,"script")),s},buildFragment:function(t,n,r,i){for(var a,o,c,l,s,p,d=n.createDocumentFragment(),f=[],y=0,b=t.length;b>y;y++)if(a=t[y],a||0===a)if("object"===e.type(a))e.merge(f,a.nodeType?[a]:a);else if(v.test(a)){for(o=o||d.appendChild(n.createElement("div")),c=(g.exec(a)||["",""])[1].toLowerCase(),l=N[c]||N._default,o.innerHTML=l[1]+a.replace(m,"<$1></$2>")+l[2],p=l[0];p--;)o=o.lastChild;e.merge(f,o.childNodes),o=d.firstChild,o.textContent=""}else f.push(n.createTextNode(a));for(d.textContent="",y=0;a=f[y++];)if((!i||-1===e.inArray(a,i))&&(s=e.contains(a.ownerDocument,a),o=u(d.appendChild(a),"script"),s&&h(o),r))for(p=0;a=o[p++];)T.test(a.type||"")&&r.push(a);return d},cleanData:function(t){for(var n,r,i,a,l=e.event.special,s=0;void 0!==(r=t[s]);s++){if(e.acceptData(r)&&(a=r[o.expando],a&&(n=o.cache[a]))){if(n.events)for(i in n.events)l[i]?e.event.remove(r,i):e.removeEvent(r,i,n.handle);o.cache[a]&&delete o.cache[a]}delete c.cache[r[c.expando]]}}}),e.fn.extend({text:function(t){return r(this,function(t){return void 0===t?e.text(this):this.empty().each(function(){(1===this.nodeType||11===this.nodeType||9===this.nodeType)&&(this.textContent=t)})},null,t,arguments.length)},append:function(){return this.domManip(arguments,function(e){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var t=l(this,e);t.appendChild(e)}})},prepend:function(){return this.domManip(arguments,function(e){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var t=l(this,e);t.insertBefore(e,t.firstChild)}})},before:function(){return this.domManip(arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this)})},after:function(){return this.domManip(arguments,function(e){this.parentNode&&this.parentNode.insertBefore(e,this.nextSibling)})},remove:function(t,n){for(var r,i=t?e.filter(t,this):this,a=0;null!=(r=i[a]);a++)n||1!==r.nodeType||e.cleanData(u(r)),r.parentNode&&(n&&e.contains(r.ownerDocument,r)&&h(u(r,"script")),r.parentNode.removeChild(r));return this},empty:function(){for(var t,n=0;null!=(t=this[n]);n++)1===t.nodeType&&(e.cleanData(u(t,!1)),t.textContent="");return this},clone:function(t,n){return t=null==t?!1:t,n=null==n?t:n,this.map(function(){return e.clone(this,t,n)})},html:function(t){return r(this,function(t){var n=this[0]||{},r=0,i=this.length;if(void 0===t&&1===n.nodeType)return n.innerHTML;if("string"==typeof t&&!y.test(t)&&!N[(g.exec(t)||["",""])[1].toLowerCase()]){t=t.replace(m,"<$1></$2>");try{for(;i>r;r++)n=this[r]||{},1===n.nodeType&&(e.cleanData(u(n,!1)),n.innerHTML=t);n=0}catch(a){}}n&&this.empty().append(t)},null,t,arguments.length)},replaceWith:function(){var t=arguments[0];return this.domManip(arguments,function(n){t=this.parentNode,e.cleanData(u(this)),t&&t.replaceChild(n,this)}),t&&(t.length||t.nodeType)?this:this.remove()},detach:function(e){return this.remove(e,!0)},domManip:function(n,r){n=t.apply([],n);var i,c,l,h,d,f,m=0,g=this.length,v=this,y=g-1,C=n[0],N=e.isFunction(C);if(N||g>1&&"string"==typeof C&&!a.checkClone&&b.test(C))return this.each(function(e){var t=v.eq(e);N&&(n[0]=C.call(this,e,t.html())),t.domManip(n,r)});if(g&&(i=e.buildFragment(n,this[0].ownerDocument,!1,this),c=i.firstChild,1===i.childNodes.length&&(i=c),c)){for(l=e.map(u(i,"script"),s),h=l.length;g>m;m++)d=i,m!==y&&(d=e.clone(d,!0,!0),h&&e.merge(l,u(d,"script"))),r.call(this[m],d,m);if(h)for(f=l[l.length-1].ownerDocument,e.map(l,p),m=0;h>m;m++)d=l[m],T.test(d.type||"")&&!o.access(d,"globalEval")&&e.contains(f,d)&&(d.src?e._evalUrl&&e._evalUrl(d.src):e.globalEval(d.textContent.replace(x,"")))}return this}}),e.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(t,r){e.fn[t]=function(t){for(var i,a=[],o=e(t),c=o.length-1,l=0;c>=l;l++)i=l===c?this:this.clone(!0),e(o[l])[r](i),n.apply(a,i.get());return this.pushStack(a)}}),e});
//# sourceMappingURL=manipulation.js
//# sourceMappingURL=manipulation.js.map