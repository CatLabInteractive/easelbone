define(["../core","./var/rnumnonpx","./var/rmargin","./var/getStyles","../selector"],function(t,i,e,n){function r(r,d,a){var h,o,m,s,u=r.style;return a=a||n(r),a&&(s=a.getPropertyValue(d)||a[d]),a&&(""!==s||t.contains(r.ownerDocument,r)||(s=t.style(r,d)),i.test(s)&&e.test(d)&&(h=u.width,o=u.minWidth,m=u.maxWidth,u.minWidth=u.maxWidth=u.width=s,s=a.width,u.width=h,u.minWidth=o,u.maxWidth=m)),void 0!==s?s+"":s}return r});
//# sourceMappingURL=curCSS.js
//# sourceMappingURL=curCSS.js.map