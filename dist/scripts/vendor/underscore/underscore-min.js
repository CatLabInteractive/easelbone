//     Underscore.js 1.8.2
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function(){function e(e){function t(t,n,r,i,s,o){for(;s>=0&&o>s;s+=e){var u=i?i[s]:s;r=n(r,t[u],u,t)}return r}return function(n,r,i,s){r=y(r,s,4);var o=!x(n)&&g.keys(n),u=(o||n).length,a=e>0?0:u-1;return arguments.length<3&&(i=n[o?o[a]:a],a+=e),t(n,r,i,o,a,u)}}function t(e){return function(t,n,r){n=b(n,r);for(var i=null!=t&&t.length,s=e>0?0:i-1;s>=0&&i>s;s+=e)if(n(t[s],s,t))return s;return-1}}function n(e,t){var n=L.length,r=e.constructor,i=g.isFunction(r)&&r.prototype||o,s="constructor";for(g.has(e,s)&&!g.contains(t,s)&&t.push(s);n--;)s=L[n],s in e&&e[s]!==i[s]&&!g.contains(t,s)&&t.push(s)}var r=this,i=r._,s=Array.prototype,o=Object.prototype,u=Function.prototype,a=s.push,f=s.slice,l=o.toString,c=o.hasOwnProperty,h=Array.isArray,p=Object.keys,d=u.bind,v=Object.create,m=function(){},g=function(e){return e instanceof g?e:this instanceof g?void (this._wrapped=e):new g(e)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=g),exports._=g):r._=g,g.VERSION="1.8.2";var y=function(e,t,n){if(t===void 0)return e;switch(null==n?3:n){case 1:return function(n){return e.call(t,n)};case 2:return function(n,r){return e.call(t,n,r)};case 3:return function(n,r,i){return e.call(t,n,r,i)};case 4:return function(n,r,i,s){return e.call(t,n,r,i,s)}}return function(){return e.apply(t,arguments)}},b=function(e,t,n){return null==e?g.identity:g.isFunction(e)?y(e,t,n):g.isObject(e)?g.matcher(e):g.property(e)};g.iteratee=function(e,t){return b(e,t,1/0)};var w=function(e,t){return function(n){var r=arguments.length;if(2>r||null==n)return n;for(var i=1;r>i;i++)for(var s=arguments[i],o=e(s),u=o.length,a=0;u>a;a++){var f=o[a];t&&n[f]!==void 0||(n[f]=s[f])}return n}},E=function(e){if(!g.isObject(e))return{};if(v)return v(e);m.prototype=e;var t=new m;return m.prototype=null,t},S=Math.pow(2,53)-1,x=function(e){var t=e&&e.length;return"number"==typeof t&&t>=0&&S>=t};g.each=g.forEach=function(e,t,n){t=y(t,n);var r,i;if(x(e))for(r=0,i=e.length;i>r;r++)t(e[r],r,e);else{var s=g.keys(e);for(r=0,i=s.length;i>r;r++)t(e[s[r]],s[r],e)}return e},g.map=g.collect=function(e,t,n){t=b(t,n);for(var r=!x(e)&&g.keys(e),i=(r||e).length,s=Array(i),o=0;i>o;o++){var u=r?r[o]:o;s[o]=t(e[u],u,e)}return s},g.reduce=g.foldl=g.inject=e(1),g.reduceRight=g.foldr=e(-1),g.find=g.detect=function(e,t,n){var r;return r=x(e)?g.findIndex(e,t,n):g.findKey(e,t,n),r!==void 0&&r!==-1?e[r]:void 0},g.filter=g.select=function(e,t,n){var r=[];return t=b(t,n),g.each(e,function(e,n,i){t(e,n,i)&&r.push(e)}),r},g.reject=function(e,t,n){return g.filter(e,g.negate(b(t)),n)},g.every=g.all=function(e,t,n){t=b(t,n);for(var r=!x(e)&&g.keys(e),i=(r||e).length,s=0;i>s;s++){var o=r?r[s]:s;if(!t(e[o],o,e))return!1}return!0},g.some=g.any=function(e,t,n){t=b(t,n);for(var r=!x(e)&&g.keys(e),i=(r||e).length,s=0;i>s;s++){var o=r?r[s]:s;if(t(e[o],o,e))return!0}return!1},g.contains=g.includes=g.include=function(e,t,n){return x(e)||(e=g.values(e)),g.indexOf(e,t,"number"==typeof n&&n)>=0},g.invoke=function(e,t){var n=f.call(arguments,2),r=g.isFunction(t);return g.map(e,function(e){var i=r?t:e[t];return null==i?i:i.apply(e,n)})},g.pluck=function(e,t){return g.map(e,g.property(t))},g.where=function(e,t){return g.filter(e,g.matcher(t))},g.findWhere=function(e,t){return g.find(e,g.matcher(t))},g.max=function(e,t,n){var r,i,s=-1/0,o=-1/0;if(null==t&&null!=e){e=x(e)?e:g.values(e);for(var u=0,a=e.length;a>u;u++)r=e[u],r>s&&(s=r)}else t=b(t,n),g.each(e,function(e,n,r){i=t(e,n,r),(i>o||i===-1/0&&s===-1/0)&&(s=e,o=i)});return s},g.min=function(e,t,n){var r,i,s=1/0,o=1/0;if(null==t&&null!=e){e=x(e)?e:g.values(e);for(var u=0,a=e.length;a>u;u++)r=e[u],s>r&&(s=r)}else t=b(t,n),g.each(e,function(e,n,r){i=t(e,n,r),(o>i||1/0===i&&1/0===s)&&(s=e,o=i)});return s},g.shuffle=function(e){for(var t,n=x(e)?e:g.values(e),r=n.length,i=Array(r),s=0;r>s;s++)t=g.random(0,s),t!==s&&(i[s]=i[t]),i[t]=n[s];return i},g.sample=function(e,t,n){return null==t||n?(x(e)||(e=g.values(e)),e[g.random(e.length-1)]):g.shuffle(e).slice(0,Math.max(0,t))},g.sortBy=function(e,t,n){return t=b(t,n),g.pluck(g.map(e,function(e,n,r){return{value:e,index:n,criteria:t(e,n,r)}}).sort(function(e,t){var n=e.criteria,r=t.criteria;if(n!==r){if(n>r||n===void 0)return 1;if(r>n||r===void 0)return-1}return e.index-t.index}),"value")};var T=function(e){return function(t,n,r){var i={};return n=b(n,r),g.each(t,function(r,s){var o=n(r,s,t);e(i,r,o)}),i}};g.groupBy=T(function(e,t,n){g.has(e,n)?e[n].push(t):e[n]=[t]}),g.indexBy=T(function(e,t,n){e[n]=t}),g.countBy=T(function(e,t,n){g.has(e,n)?e[n]++:e[n]=1}),g.toArray=function(e){return e?g.isArray(e)?f.call(e):x(e)?g.map(e,g.identity):g.values(e):[]},g.size=function(e){return null==e?0:x(e)?e.length:g.keys(e).length},g.partition=function(e,t,n){t=b(t,n);var r=[],i=[];return g.each(e,function(e,n,s){(t(e,n,s)?r:i).push(e)}),[r,i]},g.first=g.head=g.take=function(e,t,n){return null==e?void 0:null==t||n?e[0]:g.initial(e,e.length-t)},g.initial=function(e,t,n){return f.call(e,0,Math.max(0,e.length-(null==t||n?1:t)))},g.last=function(e,t,n){return null==e?void 0:null==t||n?e[e.length-1]:g.rest(e,Math.max(0,e.length-t))},g.rest=g.tail=g.drop=function(e,t,n){return f.call(e,null==t||n?1:t)},g.compact=function(e){return g.filter(e,g.identity)};var N=function(e,t,n,r){for(var i=[],s=0,o=r||0,u=e&&e.length;u>o;o++){var a=e[o];if(x(a)&&(g.isArray(a)||g.isArguments(a))){t||(a=N(a,t,n));var f=0,l=a.length;for(i.length+=l;l>f;)i[s++]=a[f++]}else n||(i[s++]=a)}return i};g.flatten=function(e,t){return N(e,t,!1)},g.without=function(e){return g.difference(e,f.call(arguments,1))},g.uniq=g.unique=function(e,t,n,r){if(null==e)return[];g.isBoolean(t)||(r=n,n=t,t=!1),null!=n&&(n=b(n,r));for(var i=[],s=[],o=0,u=e.length;u>o;o++){var a=e[o],f=n?n(a,o,e):a;t?(o&&s===f||i.push(a),s=f):n?g.contains(s,f)||(s.push(f),i.push(a)):g.contains(i,a)||i.push(a)}return i},g.union=function(){return g.uniq(N(arguments,!0,!0))},g.intersection=function(e){if(null==e)return[];for(var t=[],n=arguments.length,r=0,i=e.length;i>r;r++){var s=e[r];if(!g.contains(t,s)){for(var o=1;n>o&&g.contains(arguments[o],s);o++);o===n&&t.push(s)}}return t},g.difference=function(e){var t=N(arguments,!0,!0,1);return g.filter(e,function(e){return!g.contains(t,e)})},g.zip=function(){return g.unzip(arguments)},g.unzip=function(e){for(var t=e&&g.max(e,"length").length||0,n=Array(t),r=0;t>r;r++)n[r]=g.pluck(e,r);return n},g.object=function(e,t){for(var n={},r=0,i=e&&e.length;i>r;r++)t?n[e[r]]=t[r]:n[e[r][0]]=e[r][1];return n},g.indexOf=function(e,t,n){var r=0,i=e&&e.length;if("number"==typeof n)r=0>n?Math.max(0,i+n):n;else if(n&&i)return r=g.sortedIndex(e,t),e[r]===t?r:-1;if(t!==t)return g.findIndex(f.call(e,r),g.isNaN);for(;i>r;r++)if(e[r]===t)return r;return-1},g.lastIndexOf=function(e,t,n){var r=e?e.length:0;if("number"==typeof n&&(r=0>n?r+n+1:Math.min(r,n+1)),t!==t)return g.findLastIndex(f.call(e,0,r),g.isNaN);for(;--r>=0;)if(e[r]===t)return r;return-1},g.findIndex=t(1),g.findLastIndex=t(-1),g.sortedIndex=function(e,t,n,r){n=b(n,r,1);for(var i=n(t),s=0,o=e.length;o>s;){var u=Math.floor((s+o)/2);n(e[u])<i?s=u+1:o=u}return s},g.range=function(e,t,n){arguments.length<=1&&(t=e||0,e=0),n=n||1;for(var r=Math.max(Math.ceil((t-e)/n),0),i=Array(r),s=0;r>s;s++,e+=n)i[s]=e;return i};var C=function(e,t,n,r,i){if(r instanceof t){var s=E(e.prototype),o=e.apply(s,i);return g.isObject(o)?o:s}return e.apply(n,i)};g.bind=function(e,t){if(d&&e.bind===d)return d.apply(e,f.call(arguments,1));if(!g.isFunction(e))throw new TypeError("Bind must be called on a function");var n=f.call(arguments,2),r=function(){return C(e,r,t,this,n.concat(f.call(arguments)))};return r},g.partial=function(e){var t=f.call(arguments,1),n=function(){for(var r=0,i=t.length,s=Array(i),o=0;i>o;o++)s[o]=t[o]===g?arguments[r++]:t[o];for(;r<arguments.length;)s.push(arguments[r++]);return C(e,n,this,this,s)};return n},g.bindAll=function(e){var t,n,r=arguments.length;if(1>=r)throw new Error("bindAll must be passed function names");for(t=1;r>t;t++)n=arguments[t],e[n]=g.bind(e[n],e);return e},g.memoize=function(e,t){var n=function(r){var i=n.cache,s=""+(t?t.apply(this,arguments):r);return g.has(i,s)||(i[s]=e.apply(this,arguments)),i[s]};return n.cache={},n},g.delay=function(e,t){var n=f.call(arguments,2);return setTimeout(function(){return e.apply(null,n)},t)},g.defer=g.partial(g.delay,g,1),g.throttle=function(e,t,n){var r,i,s,o=null,u=0;n||(n={});var a=function(){u=n.leading===!1?0:g.now(),o=null,s=e.apply(r,i),o||(r=i=null)};return function(){var f=g.now();u||n.leading!==!1||(u=f);var l=t-(f-u);return r=this,i=arguments,0>=l||l>t?(o&&(clearTimeout(o),o=null),u=f,s=e.apply(r,i),o||(r=i=null)):o||n.trailing===!1||(o=setTimeout(a,l)),s}},g.debounce=function(e,t,n){var r,i,s,o,u,a=function(){var f=g.now()-o;t>f&&f>=0?r=setTimeout(a,t-f):(r=null,n||(u=e.apply(s,i),r||(s=i=null)))};return function(){s=this,i=arguments,o=g.now();var f=n&&!r;return r||(r=setTimeout(a,t)),f&&(u=e.apply(s,i),s=i=null),u}},g.wrap=function(e,t){return g.partial(t,e)},g.negate=function(e){return function(){return!e.apply(this,arguments)}},g.compose=function(){var e=arguments,t=e.length-1;return function(){for(var n=t,r=e[t].apply(this,arguments);n--;)r=e[n].call(this,r);return r}},g.after=function(e,t){return function(){return--e<1?t.apply(this,arguments):void 0}},g.before=function(e,t){var n;return function(){return--e>0&&(n=t.apply(this,arguments)),1>=e&&(t=null),n}},g.once=g.partial(g.before,2);var k=!{toString:null}.propertyIsEnumerable("toString"),L=["valueOf","isPrototypeOf","toString","propertyIsEnumerable","hasOwnProperty","toLocaleString"];g.keys=function(e){if(!g.isObject(e))return[];if(p)return p(e);var t=[];for(var r in e)g.has(e,r)&&t.push(r);return k&&n(e,t),t},g.allKeys=function(e){if(!g.isObject(e))return[];var t=[];for(var r in e)t.push(r);return k&&n(e,t),t},g.values=function(e){for(var t=g.keys(e),n=t.length,r=Array(n),i=0;n>i;i++)r[i]=e[t[i]];return r},g.mapObject=function(e,t,n){t=b(t,n);for(var r,i=g.keys(e),s=i.length,o={},u=0;s>u;u++)r=i[u],o[r]=t(e[r],r,e);return o},g.pairs=function(e){for(var t=g.keys(e),n=t.length,r=Array(n),i=0;n>i;i++)r[i]=[t[i],e[t[i]]];return r},g.invert=function(e){for(var t={},n=g.keys(e),r=0,i=n.length;i>r;r++)t[e[n[r]]]=n[r];return t},g.functions=g.methods=function(e){var t=[];for(var n in e)g.isFunction(e[n])&&t.push(n);return t.sort()},g.extend=w(g.allKeys),g.extendOwn=g.assign=w(g.keys),g.findKey=function(e,t,n){t=b(t,n);for(var r,i=g.keys(e),s=0,o=i.length;o>s;s++)if(r=i[s],t(e[r],r,e))return r},g.pick=function(e,t,n){var r,i,s={},o=e;if(null==o)return s;g.isFunction(t)?(i=g.allKeys(o),r=y(t,n)):(i=N(arguments,!1,!1,1),r=function(e,t,n){return t in n},o=Object(o));for(var u=0,a=i.length;a>u;u++){var f=i[u],l=o[f];r(l,f,o)&&(s[f]=l)}return s},g.omit=function(e,t,n){if(g.isFunction(t))t=g.negate(t);else{var r=g.map(N(arguments,!1,!1,1),String);t=function(e,t){return!g.contains(r,t)}}return g.pick(e,t,n)},g.defaults=w(g.allKeys,!0),g.clone=function(e){return g.isObject(e)?g.isArray(e)?e.slice():g.extend({},e):e},g.tap=function(e,t){return t(e),e},g.isMatch=function(e,t){var n=g.keys(t),r=n.length;if(null==e)return!r;for(var i=Object(e),s=0;r>s;s++){var o=n[s];if(t[o]!==i[o]||!(o in i))return!1}return!0};var A=function(e,t,n,r){if(e===t)return 0!==e||1/e===1/t;if(null==e||null==t)return e===t;e instanceof g&&(e=e._wrapped),t instanceof g&&(t=t._wrapped);var i=l.call(e);if(i!==l.call(t))return!1;switch(i){case"[object RegExp]":case"[object String]":return""+e==""+t;case"[object Number]":return+e!==+e?+t!==+t:0===+e?1/+e===1/t:+e===+t;case"[object Date]":case"[object Boolean]":return+e===+t}var s="[object Array]"===i;if(!s){if("object"!=typeof e||"object"!=typeof t)return!1;var o=e.constructor,u=t.constructor;if(o!==u&&!(g.isFunction(o)&&o instanceof o&&g.isFunction(u)&&u instanceof u)&&"constructor"in e&&"constructor"in t)return!1}n=n||[],r=r||[];for(var a=n.length;a--;)if(n[a]===e)return r[a]===t;if(n.push(e),r.push(t),s){if(a=e.length,a!==t.length)return!1;for(;a--;)if(!A(e[a],t[a],n,r))return!1}else{var f,c=g.keys(e);if(a=c.length,g.keys(t).length!==a)return!1;for(;a--;)if(f=c[a],!g.has(t,f)||!A(e[f],t[f],n,r))return!1}return n.pop(),r.pop(),!0};g.isEqual=function(e,t){return A(e,t)},g.isEmpty=function(e){return null==e?!0:x(e)&&(g.isArray(e)||g.isString(e)||g.isArguments(e))?0===e.length:0===g.keys(e).length},g.isElement=function(e){return!!e&&1===e.nodeType},g.isArray=h||function(e){return"[object Array]"===l.call(e)},g.isObject=function(e){var t=typeof e;return"function"===t||"object"===t&&!!e},g.each(["Arguments","Function","String","Number","Date","RegExp","Error"],function(e){g["is"+e]=function(t){return l.call(t)==="[object "+e+"]"}}),g.isArguments(arguments)||(g.isArguments=function(e){return g.has(e,"callee")}),"function"!=typeof /./&&"object"!=typeof Int8Array&&(g.isFunction=function(e){return"function"==typeof e||!1}),g.isFinite=function(e){return isFinite(e)&&!isNaN(parseFloat(e))},g.isNaN=function(e){return g.isNumber(e)&&e!==+e},g.isBoolean=function(e){return e===!0||e===!1||"[object Boolean]"===l.call(e)},g.isNull=function(e){return null===e},g.isUndefined=function(e){return e===void 0},g.has=function(e,t){return null!=e&&c.call(e,t)},g.noConflict=function(){return r._=i,this},g.identity=function(e){return e},g.constant=function(e){return function(){return e}},g.noop=function(){},g.property=function(e){return function(t){return null==t?void 0:t[e]}},g.propertyOf=function(e){return null==e?function(){}:function(t){return e[t]}},g.matcher=g.matches=function(e){return e=g.extendOwn({},e),function(t){return g.isMatch(t,e)}},g.times=function(e,t,n){var r=Array(Math.max(0,e));t=y(t,n,1);for(var i=0;e>i;i++)r[i]=t(i);return r},g.random=function(e,t){return null==t&&(t=e,e=0),e+Math.floor(Math.random()*(t-e+1))},g.now=Date.now||function(){return(new Date).getTime()};var O={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},M=g.invert(O),_=function(e){var t=function(t){return e[t]},n="(?:"+g.keys(e).join("|")+")",r=RegExp(n),i=RegExp(n,"g");return function(e){return e=null==e?"":""+e,r.test(e)?e.replace(i,t):e}};g.escape=_(O),g.unescape=_(M),g.result=function(e,t,n){var r=null==e?void 0:e[t];return r===void 0&&(r=n),g.isFunction(r)?r.call(e):r};var D=0;g.uniqueId=function(e){var t=++D+"";return e?e+t:t},g.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var P=/(.)^/,H={"'":"'","\\":"\\","\r":"r","\n":"n","\u2028":"u2028","\u2029":"u2029"},B=/\\|'|\r|\n|\u2028|\u2029/g,j=function(e){return"\\"+H[e]};g.template=function(e,t,n){!t&&n&&(t=n),t=g.defaults({},t,g.templateSettings);var r=RegExp([(t.escape||P).source,(t.interpolate||P).source,(t.evaluate||P).source].join("|")+"|$","g"),i=0,s="__p+='";e.replace(r,function(t,n,r,o,u){return s+=e.slice(i,u).replace(B,j),i=u+t.length,n?s+="'+\n((__t=("+n+"))==null?'':_.escape(__t))+\n'":r?s+="'+\n((__t=("+r+"))==null?'':__t)+\n'":o&&(s+="';\n"+o+"\n__p+='"),t}),s+="';\n",t.variable||(s="with(obj||{}){\n"+s+"}\n"),s="var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n"+s+"return __p;\n";try{var o=new Function(t.variable||"obj","_",s)}catch(u){throw u.source=s,u}var a=function(e){return o.call(this,e,g)},f=t.variable||"obj";return a.source="function("+f+"){\n"+s+"}",a},g.chain=function(e){var t=g(e);return t._chain=!0,t};var F=function(e,t){return e._chain?g(t).chain():t};g.mixin=function(e){g.each(g.functions(e),function(t){var n=g[t]=e[t];g.prototype[t]=function(){var e=[this._wrapped];return a.apply(e,arguments),F(this,n.apply(g,e))}})},g.mixin(g),g.each(["pop","push","reverse","shift","sort","splice","unshift"],function(e){var t=s[e];g.prototype[e]=function(){var n=this._wrapped;return t.apply(n,arguments),"shift"!==e&&"splice"!==e||0!==n.length||delete n[0],F(this,n)}}),g.each(["concat","join","slice"],function(e){var t=s[e];g.prototype[e]=function(){return F(this,t.apply(this._wrapped,arguments))}}),g.prototype.value=function(){return this._wrapped},g.prototype.valueOf=g.prototype.toJSON=g.prototype.value,g.prototype.toString=function(){return""+this._wrapped},"function"==typeof define&&define.amd&&define("underscore",[],function(){return g})}).call(this);