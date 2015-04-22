define(["./core","./data/var/data_priv","./deferred","./callbacks"],function(e,u){return e.extend({queue:function(t,n,r){var i;return t?(n=(n||"fx")+"queue",i=u.get(t,n),r&&(!i||e.isArray(r)?i=u.access(t,n,e.makeArray(r)):i.push(r)),i||[]):void 0},dequeue:function(u,t){t=t||"fx";var n=e.queue(u,t),r=n.length,i=n.shift(),o=e._queueHooks(u,t),s=function(){e.dequeue(u,t)};"inprogress"===i&&(i=n.shift(),r--),i&&("fx"===t&&n.unshift("inprogress"),delete o.stop,i.call(u,s,o)),!r&&o&&o.empty.fire()},_queueHooks:function(t,n){var r=n+"queueHooks";return u.get(t,r)||u.access(t,r,{empty:e.Callbacks("once memory").add(function(){u.remove(t,[n+"queue",r])})})}}),e.fn.extend({queue:function(u,t){var n=2;return"string"!=typeof u&&(t=u,u="fx",n--),arguments.length<n?e.queue(this[0],u):void 0===t?this:this.each(function(){var n=e.queue(this,u,t);e._queueHooks(this,u),"fx"===u&&"inprogress"!==n[0]&&e.dequeue(this,u)})},dequeue:function(u){return this.each(function(){e.dequeue(this,u)})},clearQueue:function(e){return this.queue(e||"fx",[])},promise:function(t,n){var r,i=1,o=e.Deferred(),s=this,f=this.length,a=function(){--i||o.resolveWith(s,[s])};for("string"!=typeof t&&(n=t,t=void 0),t=t||"fx";f--;)r=u.get(s[f],t+"queueHooks"),r&&r.empty&&(i++,r.empty.add(a));return a(),o.promise(n)}}),e});
//# sourceMappingURL=queue.js
//# sourceMappingURL=queue.js.map