define(["../core","../var/rnotwhite","./accepts"],function(e,t){function i(){Object.defineProperty(this.cache={},0,{get:function(){return{}}}),this.expando=e.expando+i.uid++}return i.uid=1,i.accepts=e.acceptData,i.prototype={key:function(t){if(!i.accepts(t))return 0;var c={},n=t[this.expando];if(!n){n=i.uid++;try{c[this.expando]={value:n},Object.defineProperties(t,c)}catch(a){c[this.expando]=n,e.extend(t,c)}}return this.cache[n]||(this.cache[n]={}),n},set:function(t,i,c){var n,a=this.key(t),s=this.cache[a];if("string"==typeof i)s[i]=c;else if(e.isEmptyObject(s))e.extend(this.cache[a],i);else for(n in i)s[n]=i[n];return s},get:function(e,t){var i=this.cache[this.key(e)];return void 0===t?i:i[t]},access:function(t,i,c){var n;return void 0===i||i&&"string"==typeof i&&void 0===c?(n=this.get(t,i),void 0!==n?n:this.get(t,e.camelCase(i))):(this.set(t,i,c),void 0!==c?c:i)},remove:function(i,c){var n,a,s,h=this.key(i),r=this.cache[h];if(void 0===c)this.cache[h]={};else{e.isArray(c)?a=c.concat(c.map(e.camelCase)):(s=e.camelCase(c),c in r?a=[c,s]:(a=s,a=a in r?[a]:a.match(t)||[])),n=a.length;for(;n--;)delete r[a[n]]}},hasData:function(t){return!e.isEmptyObject(this.cache[t[this.expando]]||{})},discard:function(e){e[this.expando]&&delete this.cache[e[this.expando]]}},i});
//# sourceMappingURL=Data.js
//# sourceMappingURL=Data.js.map