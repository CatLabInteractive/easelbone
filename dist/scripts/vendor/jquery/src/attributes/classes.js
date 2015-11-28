define(["../core","../var/rnotwhite","../var/strundefined","../data/var/data_priv","../core/init"],function(s,a,e,t){var i=/[\t\r\n\f]/g;s.fn.extend({addClass:function(e){var t,n,r,l,c,h,o="string"==typeof e&&e,f=0,m=this.length;if(s.isFunction(e))return this.each(function(a){s(this).addClass(e.call(this,a,this.className))});if(o)for(t=(e||"").match(a)||[];m>f;f++)if(n=this[f],r=1===n.nodeType&&(n.className?(" "+n.className+" ").replace(i," "):" ")){for(c=0;l=t[c++];)r.indexOf(" "+l+" ")<0&&(r+=l+" ");h=s.trim(r),n.className!==h&&(n.className=h)}return this},removeClass:function(e){var t,n,r,l,c,h,o=0===arguments.length||"string"==typeof e&&e,f=0,m=this.length;if(s.isFunction(e))return this.each(function(a){s(this).removeClass(e.call(this,a,this.className))});if(o)for(t=(e||"").match(a)||[];m>f;f++)if(n=this[f],r=1===n.nodeType&&(n.className?(" "+n.className+" ").replace(i," "):"")){for(c=0;l=t[c++];)for(;r.indexOf(" "+l+" ")>=0;)r=r.replace(" "+l+" "," ");h=e?s.trim(r):"",n.className!==h&&(n.className=h)}return this},toggleClass:function(i,n){var r=typeof i;return"boolean"==typeof n&&"string"===r?n?this.addClass(i):this.removeClass(i):s.isFunction(i)?this.each(function(a){s(this).toggleClass(i.call(this,a,this.className,n),n)}):this.each(function(){if("string"===r)for(var n,l=0,c=s(this),h=i.match(a)||[];n=h[l++];)c.hasClass(n)?c.removeClass(n):c.addClass(n);else(r===e||"boolean"===r)&&(this.className&&t.set(this,"__className__",this.className),this.className=this.className||i===!1?"":t.get(this,"__className__")||"")})},hasClass:function(s){for(var a=" "+s+" ",e=0,t=this.length;t>e;e++)if(1===this[e].nodeType&&(" "+this[e].className+" ").replace(i," ").indexOf(a)>=0)return!0;return!1}})});
//# sourceMappingURL=classes.js.map