define(["../core","../manipulation"],function(e){function t(t,n){var o,a=e(n.createElement(t)).appendTo(n.body),d=window.getDefaultComputedStyle&&(o=window.getDefaultComputedStyle(a[0]))?o.display:e.css(a[0],"display");return a.detach(),d}function n(n){var d=document,r=a[n];return r||(r=t(n,d),"none"!==r&&r||(o=(o||e("<iframe frameborder='0' width='0' height='0'/>")).appendTo(d.documentElement),d=o[0].contentDocument,d.write(),d.close(),r=t(n,d),o.detach()),a[n]=r),r}var o,a={};return n});
//# sourceMappingURL=defaultDisplay.js.map