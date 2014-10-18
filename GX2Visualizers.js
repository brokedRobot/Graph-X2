
var ebVisualizer = {

	init: function(audio){
	
		audio.VOL_SENS = 2;
		////////INIT audio in
		audio.freqByteData = new Uint8Array(audio.analyser.frequencyBinCount);
		audio.timeByteData = new Uint8Array(audio.analyser.frequencyBinCount);
		
		audio.updating = true;
			
	},
	update: function(audio){
	
		audio.analyser.smoothingTimeConstant = 0.1;
		audio.analyser.getByteFrequencyData(audio.freqByteData);
		audio.analyser.getByteTimeDomainData(audio.timeByteData);

		//get average level
		//treble 16,448
		var divide = 32;
		var start = 448-256-64-64;
		var length = audio.freqByteData.length/divide;
		//console.log(length);
		var sum = 0;
		for(var j = 0; j < 4; ++j) {
			sum += audio.freqByteData[j];
		}
		var aveLevel = sum / 4;
		
		//aveLevel = this.freqByteData[0];
		aveLevel2 = audio.freqByteData[448-128];
		//aveLevel2 = this.timeByteData[448-64];
		console.log(aveLevel2);
		//var scaled_average = (aveLevel / 256) * this.VOL_SENS;
		var scaled_average = (aveLevel / (256*2)) * audio.VOL_SENS;
		var scaled_average2 = (aveLevel2 / (256*2)) * audio.VOL_SENS;
		
		ebEngine.effect1.setAmplitude(bg.amplitude * scaled_average);
		ebEngine.effect2.setAmplitude(bg.amplitude2 * scaled_average2);
		//console.log(scaled_average);
		
	}
}

var loopVisualizer = {

	init: function(audio){

		audio.rings = [];
		audio.geoms = [];
		audio.materials = [];
		audio.levels = [];
		audio.waves = [];
		audio.colors = [];
		audio.loopHolder = new THREE.Object3D();
		audio.perlin = new ImprovedNoise();
		audio.noisePos = 0;
		
		audio.RINGCOUNT = 90;
		audio.SEPARATION = 30;
		audio.INIT_RADIUS = 0.1;
		audio.SEGMENTS = 256/2;
		audio.VOL_SENS = 2;

		//audio.system.currentarea.graph.add(audio.loopHolder);

		var scale = 500;
		var alt = 0;

		var emptyBinData = [];
		for(var j = 0; j < audio.SEGMENTS; j++) {
			emptyBinData.push(0);
		}

		var arcShape = new THREE.Shape();
		arcShape.moveTo( 0, 0 );
		arcShape.arc( 0, 0, audio.INIT_RADIUS, 0, Math.PI*2+((Math.PI*2)/256), false );

		//create rings
		for(var i = 0; i < audio.RINGCOUNT; i++) {

			var m = new THREE.LineBasicMaterial( { color: 0xffffff,
				linewidth: 1,
				opacity : 0.7,
				blending : THREE.AdditiveBlending,
				depthTest : false,
				transparent : true

			});
			var circlePoints = arcShape.createPointsGeometry(128);
			circlePoints.vertices.pop();
			circlePoints.vertices.shift();
			var line = new THREE.Line(circlePoints, m);
			if(i==0)console.log(circlePoints);

			audio.rings.push(line);
			audio.geoms.push(circlePoints);
			audio.materials.push(m);
			scale *= 1.05;
			line.scale.x = scale;
			line.scale.y = scale;

			audio.loopHolder.add(line);

			audio.levels.push(0);
			audio.waves.push(emptyBinData);
			audio.colors.push(0);

		}
			
	},
	update: function(audio){
		
		audio.analyser.smoothingTimeConstant = 0.1;
		
		var info = audio.info();
		//if (undef(info.freq)) return;
		//get average level
		var length = info.freq.length;
		var sum = 0;
		for(var j = 0; j < length; ++j) {
			sum += info.freq[j];
		}
		var aveLevel = sum / length;
		var scaled_average = (aveLevel / 256) * audio.VOL_SENS; //256 the highest a level can be?

		//get noise color posn
		audio.noisePos += 0.005;
		var n = Math.abs(audio.perlin.noise(audio.noisePos, 0, 0));

		audio.levels.push(scaled_average);
		//levels.push(binData);
		audio.waves.push(audio.timeByteData);
		audio.colors.push(n);

		audio.levels.shift(1);
		audio.waves.shift(1);
		audio.colors.shift(1);

		for (var ii = 0; ii < audio.RINGCOUNT; ii++){

			var ringId = audio.RINGCOUNT - ii - 1;

			for (var jj = 0; jj < audio.SEGMENTS; jj++){
				audio.geoms[ii].vertices[jj].z = (audio.waves[ringId][jj])*2;
			}

			audio.geoms[ii].vertices[audio.SEGMENTS].z = audio.geoms[ii].vertices[0].z;

			var normLevel = audio.levels[ringId];
			var hue = audio.colors[ringId];

			THREE.ColorConverter.setHSV(audio.materials[ii].color,hue, 1, normLevel);
			//audio.materials[ii].linewidth = normLevel*3;
			audio.materials[ii].opacity = normLevel ;
			audio.geoms[ii].verticesNeedUpdate = true;
			audio.geoms[ii].colorsNeedUpdate = true;
			//audio.rings[ii].scale.z = normLevel;
		}
	},
	remove: function(){
		if (audio.loopHolder){
			for(var i = 0; i < RINGCOUNT; i++) {
				audio.loopHolder.remove(rings[i]);
			}
		}
	}
}
