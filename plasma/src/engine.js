define(function(require, exports, module) {

	var BackgroundLayer = require("romlib/backgroundLayer");
	//console.log(BackgroundLayer.BackgroundLayer.prototype.getDistorter());
	
	var frameId = -1;
	
	var Engine = exports.Engine = function(){};

	(function() {
	
		// the animation loop
		exports.start = function(layer1, layer2, fps, aspectRatio, frameskip, alpha, canvas) {
			
			//todo: define opts here
			this.layer1 = layer1;
			this.distorter1 = layer1.getDistorter();
			this.effect1 = this.distorter1.getEffect();
			//this.distorter1a = this.distorter1.dist[0];
			this.layer2 = layer2;
			this.distorter2 = layer2.getDistorter();
			this.effect2 = this.distorter2.getEffect();
			this.fps = fps;
			this.aspect = aspectRatio;
			this.frameskip = frameskip;
			this.alpha = alpha;
			this.canvas = canvas;
			
			//console.log(this);
			
			var tick = 0,
				then = Date.now(), startTime = then, elapsed,
				fpsInterval = 1000 / this.fps;
				
			this.bitmap;

			//var canvas = document.getElementById("ebbb-holder");
			this.ctx = this.canvas.getContext("2d");

			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

			this.canvasWidth = 256; this.canvasHeight = 256;
			this.imageData = this.ctx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);

			this.krakenFrame = function(){
			 
				frameId = requestAnimationFrame(this.krakenFrame);

				var now = Date.now();
				elapsed = now - then;
				
				//console.log(exports.updating);
				if (!exports.updating) return;

				// console.log("Rendering tick " + tick);
				if (elapsed > fpsInterval) {
				
					then = now - (elapsed % fpsInterval);

					this.bitmap = this.layer1.overlayFrame(this.imageData.data, this.aspect, tick, this.alpha, true);
					this.bitmap = this.layer2.overlayFrame(this.bitmap, this.aspect, tick, parseFloat(0.5), false);

					tick += (this.frameskip);

					this.imageData.data.set(this.bitmap);

					this.ctx.putImageData(this.imageData, 0, 0);
					
				}
				
			}.bind(this);

			if (frameId > 0)
				window.cancelAnimationFrame(frameId);
				
			this.krakenFrame();
		}

	}).call(Engine.prototype);

});
