(function(){function e(){window.top!=window&&(document.body.className+=" embedded")}document.body?e():document.addEventListener("DOMContentLoaded",e);var t=window.examples={};t.showDistractor=function(e){var t=e?document.getElementById(e):document.querySelector("div canvas").parentNode;t.className+=" loading"},t.hideDistractor=function(){var e=document.querySelector(".loading");e.className=e.className.replace(/\bloading\b/)}})();