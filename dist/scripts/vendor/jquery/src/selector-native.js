define(["./core"],function(e){var t,n=window.document.documentElement,o=n.matches||n.webkitMatchesSelector||n.mozMatchesSelector||n.oMatchesSelector||n.msMatchesSelector,r=function(n,o){if(n===o)return t=!0,0;var r=o.compareDocumentPosition&&n.compareDocumentPosition&&n.compareDocumentPosition(o);return r?1&r?n===document||e.contains(document,n)?-1:o===document||e.contains(document,o)?1:0:4&r?-1:1:n.compareDocumentPosition?-1:1};e.extend({find:function(t,n,o,r){var c,u,i=0;if(o=o||[],n=n||document,!t||"string"!=typeof t)return o;if(1!==(u=n.nodeType)&&9!==u)return[];if(r)for(;c=r[i++];)e.find.matchesSelector(c,t)&&o.push(c);else e.merge(o,n.querySelectorAll(t));return o},unique:function(e){var n,o=[],c=0,u=0;if(t=!1,e.sort(r),t){for(;n=e[c++];)n===e[c]&&(u=o.push(c));for(;u--;)e.splice(o[u],1)}return e},text:function(t){var n,o="",r=0,c=t.nodeType;if(c){if(1===c||9===c||11===c)return t.textContent;if(3===c||4===c)return t.nodeValue}else for(;n=t[r++];)o+=e.text(n);return o},contains:function(e,t){var n=9===e.nodeType?e.documentElement:e,o=t&&t.parentNode;return e===o||!(!o||1!==o.nodeType||!n.contains(o))},isXMLDoc:function(e){return"HTML"!==(e.ownerDocument||e).documentElement.nodeName},expr:{attrHandle:{},match:{bool:/^(?:checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped)$/i,needsContext:/^[\x20\t\r\n\f]*[>+~]/}}}),e.extend(e.find,{matches:function(t,n){return e.find(t,null,null,n)},matchesSelector:function(e,t){return o.call(e,t)},attr:function(e,t){return e.getAttribute(t)}})});
//# sourceMappingURL=selector-native.js
//# sourceMappingURL=selector-native.js.map