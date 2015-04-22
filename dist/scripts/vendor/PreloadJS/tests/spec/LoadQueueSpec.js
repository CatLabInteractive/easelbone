describe("PreloadJS.LoadQueue",function(){beforeEach(function(){jasmine.DEFAULT_TIMEOUT_INTERVAL=1e3,this.queue=new createjs.LoadQueue;var e=this;this.loadFile=function(t,i){(i===!1||i===!0)&&(e.queue.useXHR=i),"string"==typeof t?e.queue.loadFile(this.getFilePath(t)):(t.src=this.getFilePath(t.src),e.queue.loadFile(t))}}),describe("Tag Loading",function(){it("should load JSONp",function(e){this.queue.addEventListener("fileload",function(t){expect(t.result instanceof Object).toBe(!0),e()}),this.loadFile({src:"static/jsonpSample.json",callback:"x",type:createjs.LoadQueue.JSONP},!1)}),it("should load and execute Javascript (tag)",function(e){this.queue.addEventListener("fileload",function(){expect(window.foo).toBe(!0),e()}),this.loadFile("static/scriptExample.js",!1)}),it("should load svg",function(e){this.queue.addEventListener("fileload",function(t){expect(typeof t.result).toBe("object"),e()}),this.loadFile("art/gbot.svg",!1)}),it("should load sounds",function(e){this.queue.addEventListener("fileload",function(t){expect(t.result instanceof HTMLMediaElement).toBe(!0),e()}),this.loadFile({src:"audio/Thunder.mp3",type:createjs.AbstractLoader.SOUND},!1)}),it("should load video",function(e){this.queue.addEventListener("fileload",function(t){expect(t.result instanceof HTMLMediaElement).toBe(!0),e()}),this.loadFile({src:"static/video.mp4",type:createjs.AbstractLoader.VIDEO},!1)}),it("should load an existing video tag",function(e){this.queue.addEventListener("fileload",function(i){expect(i.result==t).toBe(!0),e()});var t=document.createElement("video");t.src="static/video.mp4",this.queue.loadFile(t)}),it("should load an existing sound tag",function(e){this.queue.addEventListener("fileload",function(i){expect(i.result==t).toBe(!0),e()});var t=document.createElement("audio");t.src="audio/Thunder.mp3",this.queue.loadFile(t)}),it("tag sound loading send progress events.",function(e){var t=function(){expect(!0).toBe(!0),i.removeEventListener("progress",t),e()},i=new createjs.SoundLoader({src:"audio/Thunder.mp3",type:createjs.LoadQueue.SOUND});i.addEventListener("progress",t),i.load()}),it("should load images (tag)",function(e){this.queue.addEventListener("fileload",function(t){expect(t.result instanceof HTMLImageElement).toBe(!0),e()}),this.loadFile("art/image0.jpg",!1)}),it("should load an existing image tag",function(e){this.queue.addEventListener("fileload",function(i){expect(i.result===t).toBe(!0),e()});var t=document.createElement("img");t.src="art/image0.jpg",this.queue.loadFile(t)})}),describe("XHR Loading",function(){it("should load XML",function(e){this.queue.addEventListener("fileload",function(t){expect(t.result instanceof Document).toBe(!0),e()}),this.loadFile("static/grant.xml")}),it("should load JSON",function(e){this.queue.addEventListener("fileload",function(t){expect(t.result instanceof Object).toBe(!0),e()}),this.loadFile("static/grant.json")}),it("should load and execute Javascript (xhr)",function(e){this.queue.addEventListener("fileload",function(){expect(window.foo).toBe(!0),e()}),this.loadFile("static/scriptExample.js",!0)}),it("should load css",function(e){this.queue.addEventListener("fileload",function(t){expect(t.result instanceof HTMLElement).toBe(!0),e()}),this.loadFile("static/font.css")}),it("should load images (xhr)",function(e){this.queue.addEventListener("fileload",function(t){expect(t.result instanceof HTMLImageElement).toBe(!0),e()}),this.loadFile("art/Autumn.png",!0)}),it("should load binary data",function(e){this.queue.addEventListener("fileload",function(t){expect(t.result instanceof ArrayBuffer).toBe(!0),e()}),this.loadFile({src:"audio/Thunder.mp3",type:createjs.AbstractLoader.BINARY})}),it("should load svg (xhr)",function(e){this.queue.addEventListener("fileload",function(t){expect(typeof t.result).toBe("object"),e()}),this.loadFile("art/gbot.svg",!0)}),it("should load text",function(e){this.queue.addEventListener("fileload",function(t){expect(typeof t.result).toBe("string"),e()}),this.loadFile({src:"art/gbot.svg",type:createjs.LoadQueue.TEXT})}),it("should load sounds (xhr)",function(e){this.queue.addEventListener("fileload",function(t){expect(t.result instanceof HTMLMediaElement).toBe(!0),e()}),this.loadFile({src:"audio/Thunder.mp3",type:createjs.AbstractLoader.SOUND},!0)})}),it("images should allow crossOrigin access",function(e){this.queue.addEventListener("fileload",function(t){var i=document.createElement("canvas"),o=new createjs.Stage(i),n=new createjs.Bitmap(t.result);o.addChild(n),o.update(),expect(o.hitTest(35,25)).toBe(!0),e()}),this.queue._crossOrigin=!0,this.queue.loadFile({src:"http://dev.gskinner.com/createjs/cors/daisy.png",crossOrigin:!0})}),xit("should load a manifest and its children",function(e){var t=0;this.queue.addEventListener("fileload",function(){t++}),this.queue.addEventListener("complete",function(){expect(t).toBe(10),e()}),this.loadFile({src:"static/ManifestTest.json",callback:"maps",type:createjs.LoadQueue.MANIFEST})}),it("should send progress events.",function(e){var t=this,i=function(){expect(!0).toBe(!0),t.queue.removeEventListener("progress",i),e()};this.queue.addEventListener("progress",i),this.loadFile({src:"audio/Thunder.mp3",type:createjs.LoadQueue.BINARY})}),it("should error on a 404",function(e){this.queue.addEventListener("error",function(t){expect(t.title).toBe("FILE_LOAD_ERROR"),e()}),this.loadFile("This_file_does_not_EXIST_.no")}),it("should pass data through to the complete handler",function(e){this.queue.addEventListener("fileload",function(t){expect(t.item.data).toBe("foo"),e()}),this.loadFile({src:"art/gbot.svg",type:createjs.LoadQueue.TEXT,data:"foo"})}),it("should have custom plugins",function(e){var t=function(){},i=t;i.getPreloadHandlers=function(){return{callback:i.preloadHandler,types:[createjs.LoadQueue.JSON],extensions:["json"]}},i.preloadHandler=function(e){var t={};return t.stopDownload?!1:t.doNothing?!0:(e.id="foo",e.data="foo",!0)},this.queue.installPlugin(t),this.queue.addEventListener("fileload",function(t){expect(t.item.id).toBe("foo"),expect(t.item.data).toBe("foo"),e()}),this.loadFile("static/grant.json")}),it("should POST data.",function(e){var t={foo:"bar"};this.queue.addEventListener("fileload",function(i){expect(i.result).toBe(JSON.stringify(t)),e()}),this.loadFile({src:"",method:createjs.LoadQueue.POST,values:t})}),it("destory() should remove all references in a LoadQueue",function(){this.queue.addEventListener("fileload",function(){}),this.loadFile({src:"art/gbot.svg",type:createjs.LoadQueue.TEXT,data:"foo"}),this.queue.destroy(),expect(this.queue.hasEventListener("fileload")).toBe(!1),expect(this.queue.getItem()).not.toBeDefined(),expect(this.queue.getItem(!0)).not.toBeDefined()}),it("removeAll() should remove all the items in a LoadQueue",function(){this.queue.loadFile("foo.baz",!1),this.queue.loadFile("baz.foo",!1),this.queue.removeAll(),this.queue.load(),expect(this.queue._numItems).toBe(0)})});
//# sourceMappingURL=LoadQueueSpec.js
//# sourceMappingURL=LoadQueueSpec.js.map