/*  2D graphics system by brokedRobot
*   http://www.prismshards.com/
*   helper functions/classes for three.js to create 2D graphics/games
*/    

//**************  GLOBAL VARIABLES  *******************//
    var support = {};
	
	function audioSupport(){
		var a = document.createElement('audio');
		var mp3 = 
			!!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
		if (mp3) return 'mp3';
		var ogg = 
			!!(a.canPlayType && a.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ''));
		if (ogg) return 'ogg';
		else {
			console.log('Your browser does not support compressed audio.  No sound will be played.');
			return null;
		}
	}
		
    support.audio = audioSupport();
	
	try {
		window.webAudioContextClass = (window.AudioContext || 
			window.webkitAudioContext || 
			window.mozAudioContext || 
			window.oAudioContext || 
			window.msAudioContext);
		window.webAudioContext = new window.webAudioContextClass();
	}
	catch(e) {
		console.log("Web Audio API is not supported in this browser");
	}
	
	var Vec3 = THREE.Vector3;
	var Vec2 = THREE.Vector2;
	
	var canvas = document.createElement('canvas');
	
//**************  END GLOBAL VARIABLES  *******************//

//**************  GLOBAL CLASSES  *******************//	

//*************  GX2AREA CLASS  ***************//
	function GX2Area(opts) {
		this.loaded = false;
		this.system = ((opts['system']) ? opts['system'] : false);
		this.name = ((opts['name']) ? opts['name'] : null);
		this.graphscale = ((opts['graphscale']) ? opts['graphscale'] : 7.2);
		this.imagebuffers = ((opts['imagebuffers']) ? opts['imagebuffers'] : []);
		this.pictures = ((opts['pictures']) ? opts['pictures'] : []);
		this.sprites = ((opts['sprites']) ? opts['sprites'] : []);
		this.events = ((opts['events']) ? opts['events'] : []);
		this.map = opts.hasOwnProperty('map') ? opts.map : {
			top: false, maxtop: false,
			bottom: false, maxbottom: false,
			left: false, maxleft: false,
			right: false, maxright: false,
			center: new THREE.Vector3(0,0,0),
			collisionmap: false
		};
		this.texts = ((opts['texts']) ? opts['texts'] : []);
		this.textboxes = ((opts['textboxes']) ? opts['textboxes'] : []);
		this.textboxsequences = ((opts['textboxsequences']) ? opts['textboxsequences'] : []);
		this.particlesystems = ((opts['particlesystems']) ? opts['particlesystems'] : []);
		this.audiovisualizer = false;
		this.models = ((opts['models']) ? opts['models'] : []);
		this.sounds = ((opts['sounds']) ? opts['sounds'] : []);
		this.begin = ((opts['begin']) ? opts['begin'] : noop);
		this.currenttextbox = null;
		this.graph = new THREE.Object3D();
	}
	GX2Area.prototype = {
		init: function(delta){
		
			//console.log('init: ', this);

			if (typeof delta === 'undefined') delta = 0.015;
			this.initcount = 0;
			this.graph.scale = vec3(this.graphscale,this.graphscale,this.graphscale);
			this.system.scene.add(this.graph);
		  
			this.initInterval = runInterval(function(){
			
				//console.log('.');
				
				var picturesdone = false,
					spritesdone = false,
					modelsdone = false, 
					buffersdone = false;

				if (this.pictures){
					if (this.initcount < this.pictures.length){
						if (this.pictures[this.initcount].parent == 'scene')
							this.pictures[this.initcount].addTo(this.graph);
						if (this.pictures[this.initcount].parent == 'hud')
							this.pictures[this.initcount].addTo(this.system.hud);
					}
					if (this.initcount >= this.pictures.length-1) picturesdone = true;
				}
				else picturesdone = true;

				if (this.imagebuffers){
					if (this.initcount < this.imagebuffers.length){
						this.imagebuffers[this.initcount].init('red');
					}
					if (this.initcount >= this.imagebuffers.length-1) buffersdone = true;
				}
				else buffersdone = true;

				if (this.models){
					if (this.initcount < this.models.length){
						if (this.models[this.initcount].parent == 'scene')
							this.models[this.initcount].addTo(this.graph);
						if (this.models[this.initcount].parent == 'hud')
							this.models[this.initcount].addTo(this.system.hud);
					}
					if (this.initcount >= this.models.length-1) modelsdone = true;
				}
				else modelsdone = true;
				 
				if (this.map.collisionmap) this.map.collisionmap.init('red');

				this.initcount += 1;

				if (picturesdone && buffersdone && modelsdone){
					clearInterval(this.initInterval);
					this.system.loading = false;
					this.begin();
				}
					
			}.bind(this), delta);
		  
		},
		playTextboxSequence: function (name){
			for (var i = 0; i < this.textboxsequences.length; i++){
				if (this.textboxsequences[i].name == name){
					this.textboxsequences[i].play();
					return;
				}
			}
		},
		getPicture: function (name){
			for (var i = 0; i < this.pictures.length; i++){
				if (this.pictures[i].name === name) return this.pictures[i];
			}
			return null;
		},
		getSprite: function (name){
			for (var i = 0; i < this.sprites.length; i++){
				if (this.sprites[i].name === name) return this.sprites[i];
			}
			return null;
		},
		getModel: function (name){
			for (var i = 0; i < this.models.length; i++){
				if (this.models[i].name === name) return this.models[i];
			}
			return null;
		},
		getTextboxSequence: function (name){
			for (var i = 0; i < this.textboxsequences.length; i++){
				if (this.textboxsequences[i].name === name) return this.textboxsequences[i];
			}
			return null;
		},
		getParticleSystem: function (name){
			for (var i = 0; i < this.particlesystems.length; i++){
				if (this.particlesystems[i].name === name) return this.particlesystems[i];
			}
			return null;
		},
		getSound: function (name){
			for (var i = 0; i < this.sounds.length; i++){
				if (this.sounds[i].name === name) return this.sounds[i];
			}
			return null;
		},
		getMesh: function (name){
			for (var i=0; i < this.meshes.length; i++){
				if (name === this.meshes[i].name) return this.meshes[i];  
			}
			return null;
		},
		setLoaded: function (){
			this.loaded = true;
		},
		setBegin: function (newBeginFunc){
			this.begin = newBeginFunc;
		},
		addPicture: function (opts){
			if (!undef(opts)) opts.system = this.system;
			var newpicture = new Picture(opts);
			this.pictures.push(newpicture);
			return newpicture;
		},
		addSprite: function (opts){
			if (!undef(opts)) opts.system = this.system;
			var newsprite = new Sprite(opts);
			this.sprites.push(newsprite);
			return newsprite;
		},
		addFont: function (font){
			var tfont = new Textbox({
				string: 'font',
				textstyle: '22px '+font,
				type: 'scene'
			});
		},
		addModel: function (opts){
			if (!undef(opts)) opts.system = this.system;		
			var newmodel = new Model(opts);
			this.models.push(newmodel);
			return newmodel;
		},
		addAudio: function (opts){
			if (!undef(opts)) opts.system = this.system;
			var newsound = new AudioEffect(opts);
			this.sounds.push(newsound);
			return newsound;
		},
		addWebAudio: function (opts){
			if (!undef(opts)) opts.system = this.system;
			var newsound = new AudioBuffer(opts);
			this.sounds.push(newsound);
			return newsound;
		},
		addText: function (textArray, textStyle, lineHeightArray, 
								offsetArray, textColor, textPosition){
			var newtext = new Text(textArray, textStyle, lineHeightArray, 
								offsetArray, textColor, textPosition);
			this.texts.push(newtext);
			return newtext;
		},
		addTextbox: function (opts){
			if (!undef(opts)) opts.system = this.system;
			var newtextbox = new Text(opts);
			this.textboxes.push(newtextbox);
			return newtextbox;
		},
		addTextboxSequence: function (opts){
			if (!undef(opts)) opts.system = this.system;
			var newtextboxsequence = new TextboxSequence(opts);
			this.textboxsequences.push(newtextboxsequence);
			return newtextboxsequence;
		},
		addParticleSystem: function (opts){
			if (!undef(opts)) opts.system = this.system;
			var newparticlesystem = new ParticleSystem(opts);
			this.particlesystems.push(newparticlesystem);
			return newparticlesystem;
		},
		removePicture: function (name){
			for (var i = 0; i < this.pictures.length; i++){
				if (this.pictures[i].name == name){
					this.pictures[i].removeFrom(this.graph);
					this.pictures.splice(i, 1);
				}
			}
			return null;
		},
		loadNextArea: function(opts){
			this.loadnextarea(opts);
		},
		loadnextarea: function(opts){
		
			if (undef(opts)) opts = {};
			if (undef(opts.name)) return;
			else var name = opts.name;
			var time = !undef(opts.time) ? opts.time : 1.5;
			var delay = !undef(opts.delay) ? opts.delay : 0;
			var fade = !undef(opts.fade) ? opts.fade : true;

		    if (fade) fadeIn({object: this.system.blackout, delay: delay,
			    time: time, onComplete: function (){
					this.system.scene.remove(this.system.currentarea.graph);
					this.system.mouse.clearClickables();
					this.system.loadArea(name);
					//this.system.camera.position.set(0,0,800);
				}.bind(this)
		    }); 
			else {
				this.system.scene.remove(this.system.currentarea.graph);
				this.system.mouse.clearClickables();
				this.system.switchedarea = true;
				this.system.loadArea(name);
				//this.system.camera.position.set(0,0,800);
			}
		},
		grabPixels: function(img, xLoc, yLoc, pixelGrabWidth, pixelGrabHeight){
		
			canvas.width = img.width;
			canvas.height = img.height;
			canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
			pixelData = canvas.getContext('2d').getImageData(xLoc, yLoc,
														 pixelGrabWidth, pixelGrabHeight);
			return pixelData;
		  
		},
		grabPixelsOutline: function(image, xLoc, yLoc, pixelGrabWidth, pixelGrabHeight){
		
			var img = image;
			
			canvas.width = img.width;
			canvas.height = img.height;
			canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
			
			pixelDataTop = canvas.getContext('2d').getImageData(xLoc, yLoc,
														 pixelGrabWidth, 1);
			pixelDataLeft = canvas.getContext('2d').getImageData(xLoc, yLoc + 1,
														 1, pixelGrabHeight - 2);
			pixelDataRight = canvas.getContext('2d').getImageData(xLoc + 
								pixelGrabWidth - 1, yLoc,  1, pixelGrabHeight - 2);
			pixelDataBottom = canvas.getContext('2d').getImageData(xLoc, yLoc
								+ pixelGrabHeight - 1, pixelGrabWidth, 1);
			pixelData = pixelDataTop.concat(pixelDataLeft, pixelDataRight, pixelDataBottom);
			
			return pixelData;
			
		},
		grabPixels8Point: function(image, xLoc, yLoc, pixelGrabWidth, pixelGrabHeight){
		
			var img = image;

			canvas.width = img.width;
			canvas.height = img.height;
			canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);

			pixelDataTopLeft = canvas.getContext('2d').getImageData(xLoc, yLoc, 1, 1);
			pixelDataTopMiddle = canvas.getContext('2d').getImageData(xLoc + pixelGrabWidth/2, yLoc, 1, 1);
			pixelDataTopRight = canvas.getContext('2d').getImageData(xLoc + pixelGrabWidth - 1, yLoc, 1, 1);
			pixelDataBottomLeft = canvas.getContext('2d').getImageData(xLoc, yLoc
								+ pixelGrabHeight - 1, 1, 1);
			pixelDataBottomMiddle = canvas.getContext('2d').getImageData(xLoc, yLoc
								+ pixelGrabHeight - 1, 1, 1);
			pixelDataBottomRight = canvas.getContext('2d').getImageData(xLoc + pixelGrabWidth - 1,
								yLoc + pixelGrabHeight - 1, 1, 1);
			pixelDataMiddleLeft = canvas.getContext('2d').getImageData(xLoc + pixelGrabWidth - 1,
								yLoc + pixelGrabHeight - 1, 1, 1);
			pixelDataMiddleRight = canvas.getContext('2d').getImageData(xLoc + pixelGrabWidth - 1,
								yLoc + pixelGrabHeight - 1, 1, 1);
			pixelData = pixelDataTop.concat(pixelDataLeft, pixelDataRight, pixelDataBottom);
			
			return pixelData;
			
		},
		checkForEventCollision: function(object){
		
			var event;
			var dist = object.eventdistance;
			
			switch (object.facing){
				case 'l':
					event = isEventCollision(object, new Vec3(-dist, 0, 0));
					break;
				case 'r':
					event = isEventCollision(object, new Vec3(dist, 0, 0));
					break;
				case 'u':
					event = isEventCollision(object, new Vec3(0, dist, 0));
					break;
				case 'd':
					event = isEventCollision(object, new Vec3(0, -dist, 0));
					break;
				case 'ul':
					event = isEventCollision(object, new Vec3(-dist, dist, 0));
					break;
				case 'ur':
					event = isEventCollision(object, new Vec3(dist, dist, 0));
					break;
				case 'dl':
					event = isEventCollision(object, new Vec3(-dist, -dist, 0));
					break;
				case 'dr':
					event = isEventCollision(object, new Vec3(dist, -dist, 0));
					break;
				default:
			}
			if (event){
				if (event[0].click) event[0].click();
			} 
			
		},
		isEventCollision: function(object, offset){
		
			var collisions = [];
			var currentarea = this.system.currentarea;
			
			if (object.position) var objectpos = object.position;
			else var objectpos = object;            
				// check for an event at offset distance
				// need to create sister function for AABB vs AABB overlap
			for (var i = 0; i < currentarea.pictures.length; i++){
				if (object != currentarea.pictures[i]){
					if ( !(Math.abs(object.position.x + offset.x + object.eventoffset.x - 
						currentarea.pictures[i].position.x +
						currentarea.pictures[i].eventoffset.x) > 
						(Math.floor(object.eventwidth/2) + 
						Math.floor(currentarea.pictures[i].eventwidth/2))) ){
						if ( !(Math.abs(object.position.y + offset.y + object.eventoffset.y -
							currentarea.pictures[i].position.y +
							currentarea.pictures[i].eventoffset.y) >
							(object.eventheight/2 +
							currentarea.pictures[i].eventheight/2)) ){
								collisions.push(currentarea.pictures[i]);
							}
					}
				}
			}
			if (collisions.length < 1) return false;
			else return collisions;
			
		},
		isEventCollisionAtPoint: function(point){
		
			var collisions = []; 
			var currentarea = this.system.currentarea;
			          
			// check for an event at point
			for (var i = 0; i < currentarea.pictures.length; i++) {
				if ( !(Math.abs(point.x - 
						  currentarea.pictures[i].position.x +
						  currentarea.pictures[i].eventoffset.x) > 
						  (Math.floor(0/2) + 
						  Math.floor(currentarea.pictures[i].eventwidth/2))) ){
					if ( !(Math.abs(point.y -
						  currentarea.pictures[i].position.y +
						  currentarea.pictures[i].eventoffset.y) >
						  (0/2 + currentarea.pictures[i].eventheight/2)) ){
									collisions.push(currentarea.pictures[i]);
					}
				}
			}
			
			if (collisions.length < 1) return false;
			else return collisions;
			
		}

	}
//**************  END GX2AREA  ****************//

//*************  PICTURE CLASS  ***************//
	function Picture(opts){
	
		this.system = opts.hasOwnProperty('system') ? opts.system : false;
		this.filename = opts.hasOwnProperty('filename') ? opts.filename : false;
		this.name = opts.hasOwnProperty('name') ? opts.name : false;
		this.antialiased = opts.hasOwnProperty('antialiased') ? opts.antialiased : true;
		this.visible = opts.hasOwnProperty('visible') ? opts.visible : true;
		this.width = opts.hasOwnProperty('width') ? opts.width : 0;
		this.height = opts.hasOwnProperty('height') ? opts.height : 0;
		this.position = opts.hasOwnProperty('position') ? opts.position : v3(0,0,0);
		this.rotation = opts.hasOwnProperty('rotation') ? opts.rotation : new euler(0,0,0);
		this.opacity = opts.hasOwnProperty('opacity') ? opts.opacity : 1.0;
		this.scale = opts.hasOwnProperty('scale') ? v3(opts.scale, opts.scale, 1) : v3(1,1,1);
		this.sprite = opts.hasOwnProperty('sprite') ? opts.sprite : false;
		
		this.eventwidth = opts.hasOwnProperty('eventwidth') ? opts.eventwidth : null;
		this.eventheight = opts.hasOwnProperty('eventheight') ? opts.eventheight : null;
		this.eventdistance = opts.hasOwnProperty('eventdistance') ? opts.eventdistance : 300;
		
		this.eventoffset = opts.hasOwnProperty('eventoffset') ? opts.eventoffset : v3(0,0,0);
		this.pictureoffset = opts.hasOwnProperty('pictureoffset') ? opts.pictureoffset : v3(0,0,0);
		this.physicsoffset = opts.hasOwnProperty('physicsoffset') ? opts.physicsoffset : v3(0,0,0);
		this.zoffset = opts.hasOwnProperty('zoffset') ? opts.zoffset : v3(0,0,0);
		this.roffset = opts.hasOwnProperty('roffset') ? opts.roffset : v3(0,0,0);
										
		this.physicsbody = opts.hasOwnProperty('physicsbody') ? opts.physicsbody : null;
		this.restitution = opts.hasOwnProperty('restitution') ? opts.restitution : 0;
		this.physicsupdating = opts.hasOwnProperty('physicsupdating') ? opts.physicsupdating : false;
		this.position_0 = {x: 0, y: 0};
		this.position_1 = {x: 0, y: 0};
		this.physicsrotating = opts.hasOwnProperty('physicsrotating') ? opts.physicsrotating : false;
									
		this.eightway = opts.hasOwnProperty('eightway') ? opts.eightway : false;
		/*this.pathfinding = FixedQueue( 50, 
			[	
				null, null, null, null, null, null, null, null, null, null,
				null, null, null, null, null, null, null, null, null, null,
				null, null, null, null, null, null, null, null, null, null,
				null, null, null, null, null, null, null, null, null, null,
				null, null, null, null, null, null, null, null, null, null
			] 
		);*/
		this.directionfinding = ['r','l','u','d', 0, 0, 0, 0, 'forward'];
		this.direction = opts.hasOwnProperty('direction') ? opts.direction : null;
		this.facing = opts.hasOwnProperty('facing') ? opts.facing : null;
		this.passable = opts.hasOwnProperty('passable') ? opts.passable : false;
		this.collisioncolors = opts.hasOwnProperty('collisioncolors') ?
										opts.collisioncolors : [0];
		
		this.anchor = new THREE.Object3D();
		this.parent = opts.hasOwnProperty('parent') ? opts.parent : 'scene';
		
		this.blending = false;
		this.overdraw = false;
		
		if (opts.hasOwnProperty('blending')){
			switch (opts.blending){
			case 'add':
				this.blending = THREE.AdditiveBlending;
				this.overdraw = false;
				break;
			case 'sub':
				this.blending = THREE.SubtractiveBlending;
				this.overdraw = false;
				break;
			case 'multiply':
				this.blending = THREE.MultiplyBlending;
				this.overdraw = false;
				break;
			case 'normal':
				this.blending = THREE.NormalBlending;
				this.overdraw = true;
				break;
			default:
				this.blending = opts.blending;
				this.overdraw = true;
				break;
			}
		}
		else {
			this.blending = THREE.NormalBlending;
			this.overdraw = true;
		}
		this.animatorframes = opts.hasOwnProperty('animatorframes') ? opts.animatorframes : false;
		this.animating = opts.hasOwnProperty('animating') ? opts.animating : false;
		this.repeating = opts.hasOwnProperty('repeating') ? opts.repeating : true;
		this.framewidth = this.width;
		this.frameheight = this.height;
		this.loaded = false;
		this.animcycleframes = opts.hasOwnProperty('animcycleframes') ? opts.animcycleframes : 4;
		this.moving = false;
		this.rotating = false;
		this.fading = false;
		this.update = opts.hasOwnProperty('update') ? opts.update : function (delta){};
		this.updating = opts.hasOwnProperty('updating') ? opts.updating : false;
		this.zupdating = opts.hasOwnProperty('zupdating') ? opts.zupdating : false;
		this.onLoad = opts.hasOwnProperty('onLoad') ? opts.onLoad : noop;
		
		this.autoadd = opts.hasOwnProperty('autoadd') ? opts.autoadd : true;
		this.doublesided = opts.hasOwnProperty('doublesided') ? opts.doublesided : THREE.FrontSide;
		
		this.controls = false;
		this.controlstype = false;
		this.controlsresponsive = false;
		this.click = opts.hasOwnProperty('click') ? opts.click : noop;
		this.clickup = opts.hasOwnProperty('clickup') ? opts.clickup : noop;
		this.hoverin = opts.hasOwnProperty('hoverin') ? opts.hoverin : noop;
		this.hoverout = opts.hasOwnProperty('hoverout') ? opts.hoverout : noop;

		this.draggable = opts.hasOwnProperty('draggable') ? opts.draggable : false;
		this.dragging = opts.hasOwnProperty('dragging') ? opts.dragging : function(mousex, mousey){
			this.position.x = mousex + -this.system.hud.position.x; 
			this.position.y = mousey + -this.system.hud.position.y;
		};

		this.positiontweens = [];
		this.rotationtweens = [];
		this.opacitytweens = [];
		this.scaletweens = [];
		this.colortweens = [];
		this.huetween = false;
		this.hueyoyotween = false;
		
		this.shadowcopies = [];
		this.shadowcopyinfo = {fadeouttime: 0.3, resettime: 8, hueshift: false};
		this.paststates = [];
		
		this.collisiontype = false;
		this.altitude = opts.hasOwnProperty('altitude') ? opts.altitude : 0;
		this._altitude = this.altitude;
		
		this.onAnimComplete = false;
		if (opts.hasOwnProperty('walkframes')) this.walkframes = opts.walkframes;
		else {
			this.walkframes = {};
			this.walkframes.down = [1,2,3,4];
			this.walkframes.left = [5,6,7,8];
			this.walkframes.right = [9,10,11,12];
			this.walkframes.up = [13,14,15,16];
		}
		if (opts.hasOwnProperty('runframes')) this.runframes = opts.runframes;
		this.jumpheight = opts.hasOwnProperty('jumpheight') ? opts.jumpheight : 30;
		this.jumping = false;
		
		this.texture = opts.hasOwnProperty('texture') ? opts.texture : false;
		this.texturerepeat = opts.hasOwnProperty('texturerepeat') ? opts.texturerepeat : false;
		this.material = opts.hasOwnProperty('material') ? opts.material : false;
		
		this.loadFunc = function (texture){          
			this.init(texture);
			this.loaded = true;
			if (this.onLoad) this.onLoad();
		};

		if (this.texture) this.loadFunc(this.texture);
		else this.texture = THREE.ImageUtils.loadTexture(
			this.filename, {}, this.loadFunc.bind(this));	
    
	}
	Picture.prototype = {
		init: function(texture){
			
			if (typeof texture !== 'undefined') this.texture = texture;
			
			if (this.width === 0){
				this.width = this.framewidth = this.texture.image.width * this.scale.x;
			}
			if (this.height === 0){
				this.height = this.frameheight = this.texture.image.height * this.scale.y;
			}
			if (this.animatorframes){                  
				this.framewidth = Math.floor(this.width / this.animatorframes[0]);
				this.frameheight = Math.floor(this.height / this.animatorframes[1]);
				
				this.loops = 0;
				this.reverse = false;

				this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping; 
				this.texture.repeat.set( 1 / this.animatorframes[0], 1 / this.animatorframes[1] );
			  
				this.animtime = 0;
				this._frame = 0;
				this.startframe = 1;
				this.endframe = this.animatorframes[2];
			}
			if (this.texturerepeat){
				texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
				if (this.texturerepeat !== true){
					texture.repeat.set( this.texturerepeat[0], this.texturerepeat[1] );
				}
			}
			if (!this.antialiased){
				this.texture.magFilter = THREE.NearestFilter;
				this.texture.minFilter = THREE.NearestFilter;
			}
			if (!this.material)
				this.material = new THREE.MeshBasicMaterial({map: this.texture, 
					overdraw: this.overdraw, transparent: true, opacity: this.opacity,
					blending: this.blending, wireframe: false, visible: this.visible});
				
			this.geometry = new THREE.PlaneGeometry(this.framewidth, this.frameheight, 1, 1);
			this.mesh = new THREE.Mesh(this.geometry, this.material);
			this.anchor.add(this.mesh);
			this.anchor.position = this.position;
			this.anchor.rotation.x = this.rotation.x; 
			this.anchor.rotation.y = this.rotation.y; 
			this.anchor.rotation.z = this.rotation.z;
			this.rotation = this.anchor.rotation; 
			this.material.side = this.doublesided;
			
			if (this.name) this.mesh.name = this.anchor.name = this.name;
			if (!this.visible) this.material.visible = false;
			  
		},
		clone: function(opts){
		
			if (undef(opts)) var opts = {};
			
			var onload = opts.hasOwnProperty('onload') ? opts.onload : 
				function(){
					this.system.currentarea.pictures.push(this);
					this.addTo(this.system.currentarea.graph);
				};
				
			var newopts = {};
			
			newopts.onLoad = onload;
				
			if (opts.hasOwnProperty('scale')) newopts.scale = opts.scale;
			else {
				if (opts.hasOwnProperty('width')) newopts.width = opts.width;
				else newopts.width = this.width;
				if (opts.hasOwnProperty('height')) newopts.height = opts.height;
				else newopts.height = this.height;
			}

			if (opts.blending) var blending = opts.blending;
			else var blending = this.blending;
			
			newopts.filename = this.filename;
			newopts.antialiased = this.antialiased;
			if (opts.hasOwnProperty('position')) newopts.position = opts.position;
			else newopts.position = this.position.clone();
			if (opts.hasOwnProperty('rotation')) newopts.rotation = opts.rotation;
			else newopts.rotation = this.rotation.clone();
			if (opts.hasOwnProperty('visible')) newopts.visible = opts.visible;
			else newopts.visible = this.visible;
			newopts.opacity = this.opacity;
			newopts.blending = blending;
			newopts.animatorframes = this.animatorframes;
			newopts.system = this.system;
		
			var newpic = new Picture(newopts);
			
			return newpic;
		},
		jump: function(height, uptime, downtime, upease, downease){
			if (undef(height)) var height = 30;
			if (undef(uptime)) var uptime = 0.25;
			if (undef(downtime)) var downtime = 0.15;
			if (undef(upease)) var upease = TWEEN.Easing.Sine.Out;
			if (undef(downease)) var downease = TWEEN.Easing.Sine.In;
			tween({object: this, to: {altitude: this._altitude + height}, time: uptime,
				ease: upease}).start();
			tween({object: this.pictureoffset, to: {offsety: height}, time: uptime,
				ease: upease,
				onComplete: function(height, downtime, downease){
					tween({object: this, to: {altitude: this._altitude}, time: downtime,
						ease: downease}).start();
					tween({object: this.pictureoffset, to: {offsety: -height}, time: downtime,
						ease: downease}).start();
				}.bind(this, height, downtime, downease)}).start();
		},
		flyto: function(height, time, ease, picoffset){
			if (undef(height)) var height = 40;
			if (undef(time)) var uptime = 1.5;
			if (undef(ease)) var ease = TWEEN.Easing.Sine.Out;
			if (undef(picoffset)) var picoffset = 0;
			tween({object: this, to: {altitude: this._altitude + height}, time: time, ease: ease}).start();
			tween({object: this.pictureoffset, to: {offsety: height + picoffset}, time: time, ease: ease}).start();
		},
		addShadow: function(opts){
		
			if (undef(opts)) var opts = {};
			
			if (this.shadow) return;
			
			var newopts = {};
			
			if (opts.hasOwnProperty('scale')) newopts.scale = opts.scale;
			else {
				if (opts.hasOwnProperty('width')) newopts.width = opts.width;
				else newopts.width = this.width;
				if (opts.hasOwnProperty('height')) newopts.height = opts.height;
				else newopts.height = this.height;
			}
			newopts.onload = opts.hasOwnProperty('onload') ? opts.onload : noop;
		
			this.shadow = this.system.standardshadow.clone(newopts);
			this.shadow.addTo(this.system.currentarea.graph);
			this.shadowupdating = true;
			this.shadowupdate = function(){
				this.shadow.position.x = this.position.x;
				this.shadow.position.y = this.position.y - this.altitude;
				this.shadow.position.z = this.position.z - 0.01;
			}
		},
		addPhysics: function (opts){
		
			if (undef(opts)) var opts = {};
		
			var mass = opts.hasOwnProperty('mass') ? opts.mass : 1;
			var width = opts.hasOwnProperty('width') ? opts.width : 10;
			var height = opts.hasOwnProperty('height') ? opts.height : 10;
			var radius = opts.hasOwnProperty('radius') ? opts.radius : 7;
			var length = opts.hasOwnProperty('length') ? opts.length : 1;
			var ngon = opts.hasOwnProperty('ngon') ? opts.ngon : 0;
			var verts = opts.hasOwnProperty('verts') ? opts.verts : [];
			var offsetx = opts.hasOwnProperty('offsetx') ? opts.offsetx : 0;
			var offsety = opts.hasOwnProperty('offsety') ? opts.offsety : 0;

			var position = {x: (this.position.x + offsetx),
							y: (this.position.y - offsety)};
			
			var fixedrotation = opts.hasOwnProperty('fixedrotation') ? opts.fixedrotation : true;
			var parentobj = opts.hasOwnProperty('parentobj') ? opts.parentobj : this;
			
			var shape = opts.hasOwnProperty('shape') ? opts.shape : 'rect';
			var type = opts.hasOwnProperty('type') ? opts.type : false;
			
			if (type) shape = type;

			switch (shape){
				default: case 'rect': case 'square': case 'rectangle':
					this.physicsbody = p2Rectangle({
						mass: mass,
						width: width,
						height: height,
						position: position,
						fixedRotation: fixedrotation,
						parentobj: parentobj
					});
					break;
				case 'circ': case 'circle':
					this.physicsbody = p2Circle({
						mass: mass,
						radius: radius,
						position: position,
						parentobj: parentobj
					});
					break;
				case 'part': case 'particle':
					this.physicsbody = p2Particle({
						mass: mass,
						width: width,
						height: height,
						position: position,
						parentobj: parentobj
					});
					break;
				case 'conv': case 'convex': case 'vex':
					this.physicsbody = p2Convex({
						mass: mass,
						ngon: ngon,
						verts: verts,
						position: position,
						parentobj: parentobj
					});
					break;
				case 'conc': case 'concave': case 'cave':
					this.physicsbody = p2Concave({
						mass: mass,
						verts: verts,
						position: position,
						parentobj: parentobj
					});
					break;
				case 'cap': case 'caps': case 'capsule':
					this.physicsbody = p2Capsule({
						mass: mass,
						position: position,
						parentobj: parentobj
					});
					break;
				case 'line':
					this.physicsbody = p2Line({
						mass: mass,
						length: length,
						position: position,
						parentobj: parentobj
					});
					break;
				case 'plane':
					this.physicsbody = p2Plane({
						mass: mass,
						position: position,
						parentobj: parentobj
					});
					break;
			}

			this.physicsupdating = true;
			
			
		},
		setTexture: function(map, onLoad){
			if (typeof map === "string")
				this.material.map = THREE.ImageUtils.loadTexture(map, {}, function(onLoad){
					this.material.map.needsUpdate = true;
					this.loaded = true;
					if (onLoad) onLoad();
				}.bind(this, onLoad));
			else {
				this.material.map = map;
				map.needsUpdate = true;
				this.material.needsUpdate = true;
				map.needsUpdate = true;
				this.loaded = true;
				this.material.side = THREE.DoubleSide;
			}
		},
		show: function(){
			this.material.visible = true;
		},
		hide: function(){
			this.material.visible = false;
		},
		setBlending: function (newBlendType){
			switch (newBlendType){
				default: case 'normal':
					this.blending = THREE.NormalBlending;
					this.overdraw = true;
				break;
				case 'add':
					this.blending = THREE.AdditiveBlending;
					this.overdraw = false;
				break;
				case 'sub':
					this.blending = THREE.SubtractiveBlending;
					this.overdraw = false;
				break;
				case 'multiply':
					this.blending = THREE.MultiplyBlending;
					this.overdraw = false;
				break;
			}
			this.material.blending = this.blending;
		},
		setOverdraw: function (newOverdraw){
			this.overdraw = newOverdraw;
			this.material.overdraw = newOverdraw;
		},
		setAnimatorFrames: function (infoarray){

			this.animatorframes = infoarray;

			this.framewidth = Math.floor(this.width / infoarray[0]);
			this.frameheight = Math.floor(this.height / infoarray[1]);
			this.init();

		},
		setPosition: function (opts){
			if (opts.hasOwnProperty('x')){
				this.position.x = opts.x;
			}
			if (opts.hasOwnProperty('y')){
				this.position.y = opts.y;
			}
			if (opts.hasOwnProperty('z')){
				this.position.z = opts.z;
			}
		},
		getActualCenter: function (){
			var offset = new THREE.Vector3(0,0,0);
			offset.x = this.pictureoffset.x + this.position.x;
			offset.y = -this.pictureoffset.y + this.position.y;
			offset.z = this.pictureoffset.z + this.position.z;
			return offset;
		},
		set_p0: function(){
			this.position_0 =
				v2(this.physicsbody.position[0],
					this.physicsbody.position[1]); 
		},
		set_p1: function(){
			this.position_1 =
				v2(this.physicsbody.position[0],
					this.physicsbody.position[1]); 
		},
		getPhysicsCenter: function (){
			var offset = new THREE.Vector3(0,0,0);
			offset.x = this.physicsoffset.x + this.position.x;
			offset.y = -this.physicsoffset.y + this.position.y;
			offset.z = this.physicsoffset.z + this.position.z;
			return offset;
		},
		updatePhysics: function (){  
			
			var currentarea = systems[0].currentarea;
		
			var newpos0 = v2(this.position_0.x + ((this.physicsoffset.x)/100),
									this.position_0.y - ((this.physicsoffset.y)/100));
			var newpos1 = v2(this.position_1.x + ((this.physicsoffset.x)/100),
									this.position_1.y - ((this.physicsoffset.y)/100));
								  
			newpos0.x *= 100; newpos0.y *= 100;
			newpos1.x *= 100; newpos1.y *= 100;
			
			if (currentarea.map.collisionmap)
				var newposition = currentarea.map.collisionmap.preventColorCollision(
					newpos0, newpos1, this.physicsbody, this.collisioncolors);
			else var newposition = newpos1;
			
			if (newposition.x != newpos1.x || newposition.y != newpos1.y){
				
				var tvec = v2(
					newpos1.x - newpos0.x,
					newpos1.y - newpos0.y
				);
				
				if (Math.abs(tvec.x) >= Math.abs(tvec.y)){ tvec.y = 0; }
				else { tvec.x = 0; }
				
				this.physicsbody.applyForce([
					-tvec.x*this.restitution*50,
					-tvec.y*this.restitution*50
				],
				this.physicsbody.position);
				
			}
			
			var offsettemp = new Vec3(newpos1.x, newpos1.y, 0);
			var offset = offsettemp.sub(this.position);

			var eventcols = this.system.currentarea.isEventCollision(this, offset);
			var eventcolsx = this.system.currentarea.isEventCollision(this, new Vec3(offset.x, -this.pictureoffset.y, 0));
			var eventcolsy = this.system.currentarea.isEventCollision(this, new Vec3(-this.pictureoffset.x, offset.y, 0));
			
			if (eventcols && eventcolsy){
				for (var i=0; i < eventcolsy.length; i++){ 
					if (!eventcolsy[i].passable) {
						newposition.y = newpos0.y;
					}
				} 
			}
			if (eventcols && eventcolsx){
				for (var i=0; i < eventcolsx.length; i++){ 
					if (!eventcolsx[i].passable) {
						newposition.x = newpos0.x;
					}
				} 
			}
			if (eventcols && !(eventcolsx || eventcolsy)){
				for (var i=0; i < eventcols.length; i++){ 
					if (!eventcols[i].passable) newposition = newpos0;
				} 
			}
			
			this.physicsbody.position = [newposition.x/100 - this.physicsoffset.x/100,
											newposition.y/100 + this.physicsoffset.y/100];
			
			this.position.x = newposition.x + this.pictureoffset.x;
			this.position.y = newposition.y + this.pictureoffset.y;
			
			if (this.physicsrotating)
				this.rotation.z = this.roffset.z + this.physicsbody.angle;

		},
		removePhysics: function (){
			if (this.physicsbody){
				this.system.world.removeBody(this.physicsbody);
			}
		},
		addTo: function(obj){
			obj.add(this.anchor);
			if (this.animatorframes) this.frame(1);
		},
		removeFrom: function(obj){
			obj.remove(this.anchor);
		},
		switchParent: function(from, to){
			from.remove(this.anchor);
			to.add(this.anchor);
		},
		setLoaded: function(){
			this.loaded = true;
		},
		moveTo: function(opts){
			return this.moveto(opts);
		},
		moveto: function(opts){
			if (typeof opts === 'undefined') opts = {};
			opts.object = this.position;

			opts.extraOnComplete = function(object, tween){
				this.positiontweens.shift();
			}.bind(this);

			var positiontween = tween(opts);
			 
			if (this.positiontweens.length === 0){
				positiontween.start();
			}
			else{
				this.positiontweens[this.positiontweens.length - 1].chain(positiontween);          
			}

			this.positiontweens.push(positiontween);

			return this;
			
		},
		stopMoving: function(){
		
			for(var i = 0; i < this.positiontweens.length; i++){
				this.positiontweens[i].stop();
			}
			this.positiontweens = [];

			return this;
		},
		pauseMoving: function(){

			for(var i = 0; i < this.positiontweens.length; i++){
				this.positiontweens[i].pause();
			}
		  
			return this;      
		},
		resumeMoving: function(){
		
			for(var i = 0; i < this.positiontweens.length; i++){
				this.positiontweens[i].resume();
			}
		  
			return this;      
		},
		rotateTo: function(opts){
			return this.rotateto(opts);
		},
		rotateto: function(opts){
			if (typeof opts === 'undefined') opts = {};
			opts.object = this.rotation;

			opts.extraOnComplete = function(object, tween){
				this.rotationtweens.shift();
			}.bind(this);
		 
			var rotationtween = tween(opts);
			 
			if (this.rotationtweens.length === 0){
				rotationtween.start();
			}
			else{
				this.rotationtweens[this.rotationtweens.length - 1].chain(rotationtween);          
			}
		   
			this.rotationtweens.push(rotationtween);

			return this;
		},
		stopRotating: function(){
		 
			for(var i = 0; i < this.rotationtweens.length; i++){
				this.rotationtweens[i].stop();
			}
			this.rotationtweens = [];
		  
			return this;
		},
		pauseRotating: function(){
		 
			for(var i = 0; i < this.rotationtweens.length; i++){
				this.rotationtweens[i].pause();
			}
		  
			return this;      
		},
		resumeRotating: function(){
	 
			for(var i = 0; i < this.rotationtweens.length; i++){
				this.rotationtweens[i].resume();
			}
		  
			return this;
		},
		scaleTo: function(opts){
			return this.scaleto(opts);
		},
		scaleto: function(opts){
			if (typeof opts === 'undefined') opts = {};
			opts.object = this.mesh.scale;

			opts.extraOnComplete = function(object, tween){
				this.scaletweens.shift();
			}.bind(this);
		 
			var scaletween = tween(opts);
			 
			if (this.scaletweens.length === 0){
				scaletween.start();
			}
			else{
				this.scaletweens[this.scaletweens.length - 1].chain(scaletween);          
			}
		   
			this.scaletweens.push(scaletween);

			return this;
		},
		stopScaling: function(){
		
			for(var i = 0; i < this.scaletweens.length; i++){
				this.scaletweens[i].stop();
			}
			this.scaletweens = [];

			return this;
		},
		pauseScaling: function(){

			for(var i = 0; i < this.scaletweens.length; i++){
				this.scaletweens[i].pause();
			}
		  
			return this;      
		},
		resumeScaling: function(){
		
			for(var i = 0; i < this.scaletweens.length; i++){
				this.scaletweens[i].resume();
			}
		  
			return this;      
		},
		fadeIn: function(opts){
			return this.fadein(opts);
		},
		fadein: function(opts){
			if (typeof opts === 'undefined') opts = {};
			opts.object = this.material;
			opts.to = {opacity: 1};

			opts.extraOnComplete = function(object, tween){
				this.opacitytweens.shift();
			}.bind(this);
		 
			var opacitytween = tween(opts);
			 
			if (this.opacitytweens.length === 0){
				opacitytween.start();
			}
			else{
				this.opacitytweens[this.opacitytweens.length - 1].chain(opacitytween);          
			}
		   
			this.opacitytweens.push(opacitytween);

			return this;
		},
		fadeOut: function(opts){
			return this.fadeout(opts);
		},
		fadeout: function(opts){
			if (typeof opts === 'undefined') opts = {};
			opts.object = this.material;
			opts.to = {opacity: 0};

			opts.extraOnComplete = function(object, tween){
				this.opacitytweens.shift();
			}.bind(this);
		 
			var opacitytween = tween(opts);
			 
			if (this.opacitytweens.length === 0){
				opacitytween.start();
			}
			else{
				this.opacitytweens[this.opacitytweens.length - 1].chain(opacitytween);          
			}
		   
			this.opacitytweens.push(opacitytween);

			return this;
		},
		fadeTo: function(opts){
			return this.fade(opts);
		},
		fadeto: function(opts){
			return this.fade(opts);
		},
		fade: function(opts){
			if (typeof opts === 'undefined') opts = {};
			opts.object = this.material;

			opts.extraOnComplete = function(object, tween){
				this.opacitytweens.shift();
			}.bind(this);
		 
			var opacitytween = tween(opts);
			 
			if (this.opacitytweens.length === 0){
				opacitytween.start();
			}
			else{
				this.opacitytweens[this.opacitytweens.length - 1].chain(opacitytween);          
			}
		   
			this.opacitytweens.push(opacitytween);

			return this;
		},
		stopFading: function(){
		  
			for(var i = 0; i < this.opacitytweens.length; i++){
				this.opacitytweens[i].stop();
			}
			this.opacitytweens = [];
		  
			return this;
		},
		stopfading: function(){
			return this.stopFading();
		},
		pauseFading: function(){
		  
			for(var i = 0; i < this.opacitytweens.length; i++){
				this.opacitytweens[i].pause();
			}
		  
			return this;      
		},
		resumeFading: function(){
		  
			for(var i = 0; i < this.opacitytweens.length; i++){
				this.opacitytweens[i].pause();
			}
		  
			return this;      
		},
		killTweens: function(){
			//return killTweens(this);
			this.stopMoving();
			this.stopRotating();
			this.stopFading();
			return this;
		},
		pauseTweens: function(){
			this.pauseMoving();
			this.pauseRotating();
			this.pauseFading();
			return this;
			//return pauseTweens(this);
		},
		resumeTweens: function (){
			this.resumeMoving();
			this.resumeRotating();
			this.resumeFading();
			return this;
			//return resumeTweens(this);
		},
		playAnim: function(opts){
			//todo: implement onComplete, delay
			//if (!this.animator) return;
			//this.animatorframes[3] = (typeof opts.speed !== 'undefined') ? opts.speed : 100;
			if (!undef(opts.speed)) this.animatorframes[3] = opts.speed;
			this._frame = opts.startframe-1;
			this.startframe = opts.startframe;
			this.endframe = opts.endframe;
			//this.repeating = (typeof opts.repeating !== 'undefined') ? opts.repeating : false;
			this.reverse = (typeof opts.reverse !== 'undefined') ? opts.reverse : false;
			//if (this.startframe < this.endframe) this.reverse = false;
			//else this.reverse = true;
			
			if (this.reverse === true) this.toframe(this.endframe);
			this.animating = true;
			return this;
		},
		animpattern: function(arr, anim, ind){
			this._animpattern = arr;
			if (!undef(ind)) this.animpatindex = ind;
			else this.animpatindex = 0;
			if (anim){
				this.toFrame(arr[0]);
				this.animating = true;
			}
		},
		animate: function(delta){
			var done = false;
			this.animtime += delta;
			while (this.animtime > this.animatorframes[3])
			{
				this.animtime -= this.animatorframes[3];
				
				if (this._animpattern && !undef(this.animpatindex)){
				
					if (this.reverse){
						if (this.animpatindex-1 < 0){
							this.animpatindex = this._animpattern.length-1;
							if (!this.repeating) done = true;
						}
						else this.animpatindex--;
					}
					else {
						if (this.animpatindex >= this._animpattern.length-1){
							this.animpatindex = 0;
							if (!this.repeating) done = true;
						}
						else this.animpatindex++; 
					}

					this._frame = this._animpattern[this.animpatindex]-1;
					
				}
				else {
					if (this.reverse) this._frame--;
					else this._frame++;
				
					if (this._frame == (this.endframe) && !this.reverse){
						if (this.repeating){
							this._frame = (this.startframe-1);
						}
						else {
							if (this.loops > 0){
								this.loops -= 1;
								this._frame = (this.startframe-1);
							}
							else { 
								this.animating = false;
								if (this.onAnimComplete) 
									this.onAnimComplete(this.onAnimCompleteVars);
								done = true;
							}
						}  
					}
					if (this._frame == (this.startframe) && this.reverse){
						if (this.repeating){
							this._frame = (this.endframe + -0);//1?
						}
						else{
							if (this.loops > 0){
								this.loops -= 1;
								this._frame = (this.endframe + -0);
							}
							else{ 
								this.animating = false;
								if (this.onAnimComplete) 
									this.onAnimComplete(this.onAnimCompleteVars);

								done = true;
							}
						}  
					}
				}
				
				if (!done){
					var currentColumn = this._frame % this.animatorframes[0];
					this.texture.offset.x = currentColumn / this.animatorframes[0];

					var currentRow = Math.floor( this._frame / this.animatorframes[0] );
					this.texture.offset.y = (1-(1/this.animatorframes[1])) -
						(currentRow / this.animatorframes[1]); 
				}
				else this.animating = false;
			}
		},
		frame: function(frameNumber, wait){
			this.toFrame(frameNumber, wait);
		},
		toframe: function(frameNumber, wait){
			this.toFrame(frameNumber, wait);
		},
		toFrame: function(frameNumber, wait){
			if (undef(wait)){
				this._frame = frameNumber-1;
				var currentColumn = this._frame % this.animatorframes[0];
				this.texture.offset.x = currentColumn / this.animatorframes[0];
				var currentRow = Math.floor( this._frame / this.animatorframes[0] );
				this.texture.offset.y = (1-(1/this.animatorframes[1]))
												   - (currentRow / this.animatorframes[1]);
			}
			else {
				runTimeout(function(frameNumber){
					this._frame = frameNumber-1;
					var currentColumn = this._frame % this.animatorframes[0];
					this.texture.offset.x = currentColumn / this.animatorframes[0];
					var currentRow = Math.floor( this._frame / this.animatorframes[0] );
					this.texture.offset.y = (1-(1/this.animatorframes[1]))
													   - (currentRow / this.animatorframes[1]);
				}.bind(this, frameNumber), wait);
			}
		},
		setRow: function( rowNum ) {
			//tolog(rowNum);
			this.startframe = ((rowNum-1) * this.animatorframes[0]) + 1;
			if (this._frame < this.startframe - 1) this._frame = this.startframe-1; 
			this.endframe = (rowNum * this.animatorframes[0]);
			//this.endframe = this.startframe + this.animcycleframes - 1;
			if (this.endframe > this.animatorframes[2]) this.endframe = this.animatorframes[2];
			if (this._frame > this.endframe) this._frame = this.startframe-1;
		},
		unsetRow: function(){   
			this.startframe = 1;
			this.endframe = this.animatorframes[2];
		},
		walkto: function(opts){
			this.animating = true;
			this._haltdirection = opts.hasOwnProperty('haltdirection') ? opts.haltdirection : 'c';
			switch (opts.direction){
				case 'u':
					this.toFrame(this.animatorframes[0]*3+1);
					this.setRow(4);
					break;
				case 'd':
					this.toFrame(this.animatorframes[0]*0+1);
					this.setRow(1);
					break;
				case 'l':
					this.toFrame(this.animatorframes[0]*1+1);
					this.setRow(2);
					break;
				case 'r':
					this.toFrame(this.animatorframes[0]*2+1);
					this.setRow(3);
					break;
				default:
					break;
			}
			this.moveto({time: opts.time, to: opts.to, onComplete: function(){
				this.animating = false;
				switch (this._haltdirection){
					case 'u':
						this.toFrame(this.animatorframes[0]*3+1);
						this.setRow(4);
						break;
					case 'd':
						this.toFrame(this.animatorframes[0]*0+1);
						this.setRow(1);
						break;
					case 'l':
						this.toFrame(this.animatorframes[0]*1+1);
						this.setRow(2);
						break;
					case 'r':
						this.toFrame(this.animatorframes[0]*2+1);
						this.setRow(3);
						break;
					default:
						break;
				}
			}.bind(this)});
		},
		addShadowCopies: function(num, blending){
			for (var i=0; i<num; i++){
				var newpic = this.clone({blending: blending});
				this.shadowcopies.push(newpic);
			}
			this._numcopies += num;
		},
		removeShadowCopies: function(){
			this.shadowcopies = [];
			this._numcopies = 0;
		},
		updateShadowCopies: function(override){ //override direction check
			
			if (this.system.framecounter % this.shadowcopyinfo.resettime != 0) return;
			
			this.shadowcopies.unshift(this.shadowcopies.pop());
			
			this.paststates.unshift({
				position: v3(this.position.x,this.position.y,this.position.z),
				frame: this._frame+1
			});
			
			while (this.paststates.length > this.shadowcopies.length){
				this.paststates.pop();
			}

			for (var i=0; i<this.paststates.length; i++){
				this.shadowcopies[i].position.set(
					this.paststates[i].position.x,
					this.paststates[i].position.y,
					this.paststates[i].position.z
				);
				this.shadowcopies[i].toframe(this.paststates[i].frame);
			}
			
			for (var i=0; i<this.shadowcopies.length; i++){
				if (this.facing == 'u' || this.facing == 'ur' || this.facing == 'ul' || override)
					this.shadowcopies[i].position.z = this.position.z + (i*0.001);
				else this.shadowcopies[i].position.z = this.position.z - (i*0.001);
			}
			
			if (this.direction !== 'c' || override) this.shadowcopies[0].material.opacity = 1.0;
			//this.shadowcopies[0].stopFading();
			if (this.shadowcopies[0].opacitytweens.length < 1) 
				this.shadowcopies[0].fadeout({time: this.shadowcopyinfo.fadeouttime});
			if (this.shadowcopyinfo.hueshift) 
				this.shadowcopies[0].hueshift(this.shadowcopyinfo.hueshift);
			
			if (this.shadowcounter == this.shadowcopies.length - 1) this.shadowcounter = 0;
			else this.shadowcounter++;
			
		},
		updateShadow: function(){
			if (this.shadow) 
				this.shadow.position.y = this.position.y + this.altitude;
		},
		hueshift: function(opts){
			
			if (this.huetween) this.huetween.stop();
			
			var time = opts.hasOwnProperty('time') ? opts.time : 1;
			var easing = opts.hasOwnProperty('easing') ? opts.easing : TWEEN.Easing.Quartic.In;
			var delay = opts.hasOwnProperty('delay') ? opts.delay : 0;
			
			var repeat = opts.hasOwnProperty('repeat') ? opts.repeat : false;
			var yoyo = opts.hasOwnProperty('yoyo') ? opts.yoyo : false;
			
			if (opts.startrgb){
				this.material.color.r = opts.startrgb[0];
				this.material.color.g = opts.startrgb[1];
				this.material.color.b = opts.startrgb[2];
			}
			if (opts.starthsv){
				THREE.ColorConverter.setHSV(this.material.color, opts.starthsv[0], opts.starthsv[1], opts.starthsv[2]);
			}
			if (opts.starthsl){
				this.material.color.setHSL(opts.starthsl[0], opts.starthsl[1], opts.starthsl[2]);
			}
			
			var colortype = 'rgb';
			
			var rgb = opts.hasOwnProperty('rgb') ? opts.rgb : false;
				if (rgb) colortype = 'rgb';
			var hsl = opts.hasOwnProperty('hsl') ? opts.hsl : false;
				if (hsl) colortype = 'hsl';
			var hsv = opts.hasOwnProperty('hsv') ? opts.hsv : false;
				if (hsv) colortype = 'hsv';
			
			var fcolor = rgb || hsl || hsv;
			if (fcolor === false) fcolor = [0,0,0];

			var tcolor, ocolor;
			
			if (colortype == 'rgb'){
				tcolor = {r: this.material.color.r, g: this.material.color.g, b: this.material.color.b};
				ocolor = {r: tcolor.r, g: tcolor.g, b: tcolor.b};
				this.huetween = new TWEEN.Tween(tcolor);
				this.huetween.to({r: fcolor[0], g: fcolor[1], b: fcolor[2]}, time*1000);
			}
			if (colortype == 'hsv'){
				tcolor = THREE.ColorConverter.getHSV(this.material.color);
				ocolor = {h: tcolor.h, s: tcolor.s, v: tcolor.v};
				this.huetween = new TWEEN.Tween(tcolor);
				this.huetween.to({h: fcolor[0], s: fcolor[1], v: fcolor[2]}, time*1000);
			}
			if (colortype == 'hsl'){
				tcolor = this.material.color.getHSL();
				ocolor = {h: tcolor.h, s: tcolor.s, l: tcolor.l};
				this.huetween = new TWEEN.Tween(tcolor);
				this.huetween.to({h: fcolor[0], s: fcolor[1], l: fcolor[2]}, time*1000);
			}
				
			this.huetween.delay(delay*1000)
				.easing(easing)
				.onUpdate(
					function(pic, type){
						if (type == 'rgb'){
							pic.material.color.r = this.r;
							pic.material.color.g = this.g;
							pic.material.color.b = this.b;
						}
						if (type == 'hsv'){
							THREE.ColorConverter.setHSV(pic.material.color, this.h, this.s, this.v);
						}
						if (type == 'hsl'){
							pic.material.color.setHSL(this.h, this.s, this.l);
						}
					}.bind(tcolor, this, colortype)
				).start();
				
			
			if (repeat){
				this.huetween.onComplete(
					function(pic, type){
						console.log('restart');
						if (type == 'rgb'){
							pic.material.color.r = this.r;
							pic.material.color.g = this.g;
							pic.material.color.b = this.b;
						}
						if (type == 'hsv'){
							THREE.ColorConverter.setHSV(pic.material.color, this.h, this.s, this.v);
						}
						if (type == 'hsl'){
							pic.material.color.setHSL(this.h, this.s, this.l);
						}
					}.bind(ocolor, this, colortype)
				);
				this.huetween.repeat(9000000000);
			}
			
			if (yoyo){
				this.hueyoyotween = new TWEEN.Tween(tcolor);
				if (colortype == 'rgb')
					this.hueyoyotween.to({r: ocolor.r, g: ocolor.g, b: ocolor.b}, time*1000);
				if (colortype == 'hsv')
					this.hueyoyotween.to({h: ocolor.h, s: ocolor.s, v: ocolor.v}, time*1000);
				if (colortype == 'hsl')
					this.hueyoyotween.to({h: ocolor.h, s: ocolor.s, l: ocolor.l}, time*1000);
				this.hueyoyotween.delay(delay*1000)
				.easing(easing)
				.onUpdate(
					function(pic, type){
						if (type == 'rgb'){
							pic.material.color.r = this.r;
							pic.material.color.g = this.g;
							pic.material.color.b = this.b;
						}
						if (type == 'hsv'){
							THREE.ColorConverter.setHSV(pic.material.color, this.h, this.s, this.v);
						}
						if (type == 'hsl'){
							pic.material.color.setHSL(this.h, this.s, this.l);
						}
					}.bind(tcolor, this, colortype)
				)
				this.huetween.chain(this.hueyoyotween);
				this.hueyoyotween.chain(this.huetween);
			}
		},
		collisionStart: function(evt){
			
		},
		collisionEnd: function(evt){
			
		}
	}
//**************  END PICTURE  ****************//
  
//*************  MODEL CLASS  ***************//
	function Model(opts) {
		this.name = opts.hasOwnProperty('name') ? opts.name : '';
		this.system = opts.hasOwnProperty('system') ? opts.system : false;
		this.parent = opts.hasOwnProperty('parent') ? opts.parent : 'scene';
		this.filename = opts.hasOwnProperty('filename') ? opts.filename : null;
		this.material = opts.hasOwnProperty('material') ? opts.material : null;
		this.mesh = opts.hasOwnProperty('mesh') ? opts.mesh : null;
		this.anchor = opts.hasOwnProperty('anchor') ? opts.anchor : null;
		this.position = opts.hasOwnProperty('position') ? opts.position : v3(0,0,0);
		this.rotation = opts.hasOwnProperty('rotation') ? opts.rotation : new euler(0,0,0);
		this.zoffset = opts.hasOwnProperty('zoffset') ? opts.zoffset : v3(0,0,0);
		this.overdraw = opts.hasOwnProperty('overdraw') ? opts.overdraw : true;
		this.scale = opts.hasOwnProperty('scale') ? opts.scale : 1;  
		this.updating = opts.hasOwnProperty('updating') ? opts.updating : false;
		this.zupdating = opts.hasOwnProperty('zupdating') ? opts.zupdating : false;
		this.update = opts.hasOwnProperty('update') ? opts.update : noop;
		this.onLoad = opts.hasOwnProperty('onLoad') ? opts.onLoad : noop;
		this.loaded = false;
		
		this.controls = false;
		this.controlstype = false;
		this.controlsresponsive = false;
		this.click = opts.hasOwnProperty('click') ? opts.click : noop;
		this.clickup = opts.hasOwnProperty('clickup') ? opts.clickup : noop;
		this.hoverin = opts.hasOwnProperty('hoverin') ? opts.hoverin : noop;
		this.hoverout = opts.hasOwnProperty('hoverout') ? opts.hoverout : noop;

		this.draggable = ((opts['draggable'] || opts['draggable'] === false)
													  ? opts['draggable'] : false);
		this.dragging = ((opts['dragging']) ? opts['dragging'] : function (mousex, mousey){
			this.position.x = mousex; 
			this.position.y = mousey;
		});
		
		this.still = true;
		this.rotating = false;
		
		if (this.filename === null){ 
		  console.log('Model needs filename: ' + this.name);
		}
		else jsloader.load( this.filename, this.callbackFunc.bind(this) );
		
	}
	Model.prototype = {
		setName: function (newName){
			this.name = newName;
		},
		setLoadedFunc: function (newFunc){
			this.loadedFunc = newFunc;
		},
		addTo: function(obj){
		  obj.add(this.anchor);
		},
		removeFrom: function (obj){
		  obj.remove(this.anchor);
		},
		callbackFunc: function(geometry, materials){
		
			console.log(this); //debug
			if (this.material !== null) var material = this.material;
			else if (!undef(materials)){
				//var material = new THREE.MeshFaceMaterial( materials );
				//var material = Physijs.createMaterial(
					var material = new THREE.MeshFaceMaterial( materials );//,
					//1, // high friction
				//	1 // low restitution
				//);
			}
			else var material = new THREE.MeshBasicMaterial();
			this.mesh = new THREE.Mesh( geometry, material );

			this.mesh.scale.x = this.mesh.scale.y = this.mesh.scale.z = this.scale;
			this.mesh.overdraw = this.overdraw;
			material.overdraw = this.overdraw;
			this.anchor = new THREE.Object3D();
			this.anchor.add(this.mesh);
			this.material = material;
			//this.mesh.rotation.y -= Math.PI/4;
			//this.mesh.rotation.z += Math.PI/2;

			this.anchor.position = this.position;
			this.anchor.rotation.x = this.rotation.x; 
			this.anchor.rotation.y = this.rotation.y; 
			this.anchor.rotation.z = this.rotation.z;
			this.rotation = this.anchor.rotation; 
			this.loaded = true;
			this.onLoad();         
		},
		moveTo: function(opts){
		  this.moveto(opts); 
		},
		moveto: function(opts){
		  if (typeof opts === 'undefined') opts = {};
		  opts.object = this;
		  moveTo(opts); 
		  return this;
		},
		rotateTo: function(opts){
		  this.rotateto(opts);
		},
		rotateto: function(opts){
		  if (typeof opts === 'undefined') opts = {};
		  opts.object = this;
		  rotateTo(opts);
		  return this;
		},
		fadeIn: function(opts){
		  this.fadein(opts);
		},
		fadein: function(opts){
		  if (typeof opts === 'undefined') opts = {};
		  opts.object = this;
		  fadeIn(opts);
		  return this;
		},
		fadeOut: function(opts){
		  this.fadeout(opts);
		},
		fadeout: function(opts){
		  if (typeof opts === 'undefined') opts = {};
		  opts.object = this;
		  fadeOut(opts);
		  return this;
		},
		fade: function(opts){
		  if (typeof opts === 'undefined') opts = {};
		  opts.object = this;
		  fade(opts);
		  return this;
		},
		collisionStart: function(otherBody, impact, contactEquations){
		
		},
		collisionEnd: function(otherBody, impact, contactEquations){
		
		},
		addPhysics: function (opts){
			
			if (undef(opts)) var opts = {};
		
			var mass = opts.hasOwnProperty('mass') ? opts.mass : 1;
			var width = opts.hasOwnProperty('width') ? opts.width : 10;
			var height = opts.hasOwnProperty('height') ? opts.height : 10;
			var radius = opts.hasOwnProperty('radius') ? opts.radius : 7;
			var length = opts.hasOwnProperty('length') ? opts.length : 1;
			var ngon = opts.hasOwnProperty('ngon') ? opts.ngon : 0;
			var verts = opts.hasOwnProperty('verts') ? opts.verts : [];
			var offsetx = opts.hasOwnProperty('offsetx') ? opts.offsetx : 0;
			var offsety = opts.hasOwnProperty('offsety') ? opts.offsety : 0;
			
			var fixedrotation = opts.hasOwnProperty('fixedrotation') ? opts.fixedrotation : true;
			var parentobj = opts.hasOwnProperty('parentobj') ? opts.parentobj : this;
			
			var shape = opts.hasOwnProperty('shape') ? opts.shape : 'rect';
		
			switch (shape){
				default: case 'rect': case 'square': case 'rectangle':
					this.physicsbody = p2Rectangle({
						mass: mass,
						width: width,
						height: height,
						position: [this.position.x + offsetx, this.position.y - offsety],
						fixedRotation: fixedrotation,
						parentobj: parentobj
					});
					break;
				case 'circ': case 'circle':
					this.physicsbody = p2Circle({
						mass: mass,
						radius: radius,
						position: [this.position.x + offsetx, this.position.y - offsety],
						parentobj: parentobj
					});
					break;
				case 'part': case 'particle':
					this.physicsbody = p2Particle({
						mass: mass,
						width: width,
						height: height,
						position: [this.position.x + offsetx, this.position.y - offsety],
						parentobj: parentobj
					});
					break;
				case 'conv': case 'convex': case 'vex':
					this.physicsbody = p2Convex({
						mass: mass,
						ngon: ngon,
						verts: verts,
						position: [this.position.x + offsetx, this.position.y - offsety],
						parentobj: parentobj
					});
					break;
				case 'conc': case 'concave': case 'cave':
					this.physicsbody = p2Concave({
						mass: mass,
						verts: verts,
						position: [this.position.x + offsetx, this.position.y - offsety],
						parentobj: parentobj
					});
					break;
				case 'cap': case 'caps': case 'capsule':
					this.physicsbody = p2Capsule({
						mass: mass,
						position: [this.position.x + offsetx, this.position.y - offsety],
						parentobj: parentobj
					});
					break;
				case 'line':
					this.physicsbody = p2Line({
						mass: mass,
						length: length,
						position: [this.position.x + offsetx, this.position.y - offsety],
						parentobj: parentobj
					});
					break;
				case 'plane':
					this.physicsbody = p2Plane({
						mass: mass,
						position: [this.position.x + offsetx, this.position.y - offsety],
						parentobj: parentobj
					});
					break;
			}

			this.physicsupdating = true;
			
		}
	}
//**************  END MODEL  ****************//
  
//*************  SKYBOX CLASS  ***************//
	function Skybox(prefix, suffix, path, size){
		var boxsize = !undef(size) ? size : 5000;
		var directions  = ["xp", "xn", "yp", "yn", "zp", "zn"];
		var skyGeometry = new THREE.CubeGeometry( size, size, size );	
		
		var materialArray = [];
		for (var i = 0; i < 6; i++)
			materialArray.push( new THREE.MeshBasicMaterial({
				map: THREE.ImageUtils.loadTexture( path + prefix + directions[i] + suffix ),
				side: THREE.BackSide
			}));
		var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
		var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
		return skyBox;
	}
//**************  END SKYBOX  ****************//
  
//*************  EFFECTS CLASS  ***************//
//*************  EFFECTS COMPOSER CLASS  ***************//
	function Effects(opts){
	  
		if (undef(opts)) opts = {};
		this.name = opts.hasOwnProperty('name') ? opts.name : '';
		this.system = opts.hasOwnProperty('system') ? opts.system : '';
		this.shaderTime = 0;
		this.shaderSpeed = 1.0;

		this.updating = false;
		this.updatinghud = false;

		this.passes = []; 
		this.composers = [];
		this.shadermats = [];

		this.renderPass = new THREE.RenderPass( this.system.scene, this.system.camera );
		//this.renderPass.clear = false;
		//this.renderPass.needsSwap = true;
		this.badtvPass = new THREE.ShaderPass( THREE.BadTVShader );
		this.copyPass = new THREE.ShaderPass( THREE.CopyShader );
		this.copyPass.renderToScreen = true;
		this.rgbPass = new THREE.ShaderPass( THREE.RGBShiftShader );
		this.filmPass = new THREE.ShaderPass( THREE.FilmShader );
		this.staticPass = new THREE.ShaderPass( THREE.StaticShader );
		this.flippedhblur = new THREE.ShaderPass( THREE.ShaderExtras[ "horizontalBlur" ] );
		this.flippedvblur = new THREE.ShaderPass( THREE.ShaderExtras[ "verticalBlur" ] );
		this.bloomPass = new THREE.BloomPass(1,25,4.0,256);				
		this.colorifyPass = new THREE.ShaderPass( THREE.ColorifyShader );
		this.colorifyPass.uniforms[ "color" ].value = new THREE.Color( 0xff0000 );
		this.bleachPass = new THREE.ShaderPass( THREE.BleachBypassShader );
		this.bleachPass.uniforms[ "opacity" ].value = 3.0;
		this.brightnessContrastPass = new THREE.ShaderPass( THREE.BrightnessContrastShader );
		this.brightnessContrastPass.uniforms[ "contrast" ].value = 0.8;		
		this.colorCorrectionPass = new THREE.ShaderPass( THREE.ColorCorrectionShader );		
		this.dotScreenPass = new THREE.ShaderPass( THREE.DotScreenShader );
		this.focusPass = new THREE.ShaderPass( THREE.FocusShader );	
		this.hBlurPass = new THREE.ShaderPass( THREE.HorizontalBlurShader );		
		this.hueSaturationPass = new THREE.ShaderPass( THREE.HueSaturationShader );
		this.hueSaturationPass.uniforms[ "hue" ].value = 0.5;
		this.hueSaturationPass.uniforms[ "saturation" ].value = .5;
		this.kaleidoPass = new THREE.ShaderPass( THREE.KaleidoShader );
		this.luminosityPass = new THREE.ShaderPass( THREE.LuminosityShader );
		this.mirrorPass = new THREE.ShaderPass( THREE.MirrorShader );		
		this.sepiaPass = new THREE.ShaderPass( THREE.SepiaShader );		
		this.vBlurPass = new THREE.ShaderPass( THREE.VerticalBlurShader );		
		this.vignettePass = new THREE.ShaderPass( THREE.VignetteShader );
		this.vignettePass.uniforms[ "darkness" ].value = 2.0;
		this.electricPass = new THREE.ShaderPass( THREE.ElectricShader );
		this.blobsPass = new THREE.ShaderPass( THREE.BlobsShader );
		this.sky1Pass = new THREE.ShaderPass( THREE.Sky1Shader );
		//this.fxaa = new THREE.ShaderPass( THREE.ShaderExtras.fxaa );
		this.vectorBlurPass = new THREE.ShaderPass( THREE.VectorMotionShader );
		this.dilateBlurPass = new THREE.ShaderPass( THREE.DilateMotionShader );
		 
		var width = window.innerHeight*2.1 || 1;
		var height = window.innerHeight || 1;

		var renderTargetParameters = { 
			minFilter: THREE.NearestFilter, 
			magFilter: THREE.NearestFilter, 
			format: THREE.RGBAFormat, 
			stencilBuffer: false 
		};
		this.renderTarget1 = new THREE.WebGLRenderTarget( width, height, renderTargetParameters );
		 
		this.composer = new THREE.EffectComposer(this.system.renderer, this.renderTarget1);
		 
		this.composer.addPass( this.renderPass );
		
			/*this.composer.addPass( this.filmPass );
			this.composer.addPass( this.badtvPass );
			this.composer.addPass( this.rgbPass );
			this.composer.addPass( this.staticPass );
			this.composer.addPass( this.filmPass ); */   
			
			//this.composer.addPass( this.electricPass );   		
			//this.composer.addPass( this.fxaa );   		
		
		this.composer.addPass( this.copyPass );	
				
	}
	Effects.prototype = {
		reset: function(){
			var width = window.innerHeight*2.1 || 1;
			var height = window.innerHeight || 1;

			//TODO HAVE TO SET THE RENDER TARGET SIZE ON RESIZE!!!!!!!!!!!!!
			var renderTargetParameters = { 
				minFilter: THREE.LinearFilter, 
				magFilter: THREE.LinearFilter, 
				format: THREE.RGBAFormat, 
				stencilBuffer: false };
			this.renderTarget1 = new THREE.WebGLRenderTarget( width, height, renderTargetParameters );
			 
			this.composer = new THREE.EffectComposer(this.system.renderer, this.renderTarget1);
			this.composer.addPass( this.renderPass );
			this.composer.addPass( this.copyPass );  
			this.composers = [];
			this.shadermats = [];
		},
		addComposer: function(renderer, target){
			this.composers.push(new THREE.EffectComposer(renderer, target));
		},
		removeComposer: function(index){
			this.composers.splice(index,1);
		},
		resetComposer: function(){
			var width = window.innerHeight*2.1 || 1;
			var height = window.innerHeight || 1;

			var renderTargetParameters = { 
				minFilter: THREE.LinearFilter, 
				magFilter: THREE.LinearFilter, 
				format: THREE.RGBAFormat, 
				stencilBuffer: false };
			this.renderTarget1 = new THREE.WebGLRenderTarget( width, height, renderTargetParameters );
			 
			this.composer = new THREE.EffectComposer(this.system.renderer, this.renderTarget1);
			this.passes = [];
		},
		resetMaterials: function(){
			this.shadermats = [];
		},
		resetComposers: function(){
			this.composers = [];
		},
		createShaderMaterial: function(thisShader){
			console.log(thisShader);
			var mat = new THREE.ShaderMaterial( {

				uniforms: thisShader.uniforms,
				vertexShader: thisShader.material.vertexShader,
				fragmentShader: thisShader.material.fragmentShader

			} );
			
			mat.shaderSpeed = 1.0;
			//mat.uniforms.shaderSpeed.value = 1.0;
			  
			this.shadermats.push(mat);
			return mat;
		  
		},
		update: function(delta){
		
			this.shaderTime += 0.1 * this.shaderSpeed; //maybe change to delta
			
			for (var i = 0; i < this.shadermats.length; i++){
				if (this.shadermats[i].uniforms.time)
					this.shadermats[i].uniforms.time.value += (0.1 * this.shadermats[i].shaderSpeed);
			}
			
			for (var i = 0; i < this.composer.passes.length; i++){
				if (this.composer.passes[i].uniforms)
				if (this.composer.passes[i].uniforms.time)
					this.composer.passes[i].uniforms.time.value = this.shaderTime;// * this.composer.passes[i].shaderSpeed;
			}

			this.composer.render(delta);  //set to delta?

		},
		setUpdate: function(newUpdateFunc){
			this.update = newUpdateFunction;
		}
	}
//**************  END COMPOSER  ****************//
  
//*************  CONTROLS CLASS  ***************//
	function Controls(opts) {
		this.name = ((opts['name']) ? opts['name'] : null);	
		this.update = ((opts['update']) ? opts['update'] : noop);
		this.responsive = ((opts['responsive'] || opts['responsive'] === false)
														? opts['responsive'] : true);
		this.time = 0;
	}
	Controls.prototype = {
		setName: function (newControlsType){
			this.type = newControlsType;
		},
		setUpdate: function (newUpdateFunc){
		  this.update = newUpdateFunction;
		},
		setResponsive: function (newResponsive){
		  this.responsive = newResponsive;
		}
	}
//**************  END CONTROLS  ****************//
  
//*************  IMAGEBUFFER CLASS  ***************//
	function ImageBuffer(opts) {
		if (undef(opts)) return;
		if (!undef(opts.picture)){
		  this.picture = opts.picture;
		  this.texture = null;
		  this.image = null;
		}
		else{
		  tolog('trying to create ImageBuffer without picture, name: ' + opts['name']);
		  return false;
		}
		this.name = (!undef(opts.name)) ? opts['name'] : null;
		if (!undef(opts.width)) this.width = Math.round(opts.width);
			//else this.width = this.picture.width;
		if (!undef(opts.height)) this.height = Math.round(opts.height);
			//else this.height = this.picture.height;
		this.imageData = null;
		//this.position = this.picture.position;
		this.position = v2(this.width/2, this.height/2);
		this.updating = false;
		
		this.init('red');
	}
	ImageBuffer.prototype = {
		init: function (channel){
		  
			this.texture = this.picture.texture;
			this.image = this.picture.texture.image;
			
			if (this.image !== null){
				//this.canvas = game.mainbuffercanvas;//jQuery('<canvas/>')[0];
				this.canvas = jQuery('<canvas/>')[0];
				if (undef(this.width)) this.width = this.image.width;
				if (undef(this.height)) this.height = this.image.height;
				this.canvas.width = this.width;
				this.canvas.height = this.height;
				this.context = this.canvas.getContext('2d');
				this.context.drawImage(this.image, 0, 0, this.width, this.height);

				this.mainImageData = this.context.getImageData(0, 0, this.width, this.height);
				var tempImageData = this.mainImageData.data;
				this.imageData = [];

				switch (channel){
					case 'red':
						var k = 0;
						var m = 4;
						break;
					case 'green':
						var k = 1;
						var m = 4;
						break;
					case 'blue':
						var k = 2;
						var m = 4;
						break;
					case 'alpha':
						var k = 3;
						var m = 4;
						break;
					case 'all':
						var k = 0;
						var m = 1;
						break;
					default:
						var k = 0;
						var m = 1;
						break;
				}
				for (var i = k; i < tempImageData.length; i+=m){
					this.imageData.push(tempImageData[i]);
				}
			}
			else{
				console.log('picture not ready for collision map init(), name: ' + this.name);
			}
			///log info about bufferdata
			console.log(this.mainImageData);
		},
		refreshPixelData: function(){
			this.init();
		},
		getPixelData: function(){
			return this.imageData;
		},
		putPixelData: function(){
			this.context.putImageData(this.mainImageData,0,0);
		},
		refreshpic: function(){
			this.context.putImageData(this.mainImageData,0,0);
			this.picture.material.map.dispose();
			this.invert();
			//this.picture.material.texture.dispose();
			this.picture.material.map = new THREE.Texture(this.canvas);
			this.picture.material.map.needsUpdate = true;
		},
		invert: function(){
			for(var i = 0; i < this.mainImageData.data.length; i += 4) {
			  // red
				this.mainImageData.data[i] = 255 - this.mainImageData.data[i];
			  // green
				this.mainImageData.data[i + 1] = 255 - this.mainImageData.data[i + 1];
			  // blue
				this.mainImageData.data[i + 2] = 255 - this.mainImageData.data[i + 2];
			}
		},
		update: function (delta){
			//this.refreshpic();
		},
		setImage: function (newImage){
			this.image = newImage;
		},
		grabPixel: function (xLoc, yLoc){
			//grabs pixel, taking into account picture offset
			//return this.imageData[((Math.floor(xLoc - (this.position.x - (this.width/2))) + (Math.floor(yLoc - (-this.position.y - (this.height/2)))*(this.width))))];      
			return this.imageData[((Math.floor(xLoc - (this.position.x - (this.width/2))) + (Math.floor(yLoc - (-this.position.y - (this.height/2)))*(this.width))))];      
		},
		grabPixelNormal: function (xLoc, yLoc){ 
			//grabs pixel at standard location, not taking into account any offset
			return this.imageData[((Math.floor(xLoc)) + (Math.floor(yLoc*(this.width))))];      
		},
		isCollision: function (pixelDataArray){
			for (var i = 0; i < pixelDataArray.length; i+=4)
			{
				if (pixelDataArray[i] != 255) return true;
			}
			return false;
		},
		isColorCollision: function (pixelData){

			//console.log(pixelData);
		
			if (pixelData > -1 && pixelData < 21) return 0;
			if (pixelData > 20 && pixelData < 41) return 30;
			if (pixelData > 40 && pixelData < 61) return 50;
			if (pixelData > 60 && pixelData < 81) return 70;
			if (pixelData > 80 && pixelData < 101) return 90;
			if (pixelData > 100 && pixelData < 121) return 110;
			if (pixelData > 120 && pixelData < 141) return 130;
			if (pixelData > 140 && pixelData < 161) return 150;
			if (pixelData > 160 && pixelData < 181) return 170;
			if (pixelData > 180 && pixelData < 201) return 190;
			if (pixelData > 200 && pixelData < 221) return 210;
			if (pixelData > 220 && pixelData < 241) return 230;
			if (pixelData > 240) return 255;

			//console.log('err0r: pixel(' + pixelData + ') collision data out of range in isColorCollision()');
			return null;
		},
		checkForCollision: function (type, xLoc, yLoc){
			switch (type){
				case 'square':
					return this.isCollision(this.grabPixel(xLoc, yLoc));
					break;
				default:
					return this.isCollision(this.grabPixel(xLoc, yLoc));
			}
		},
		checkForColorCollision: function (type, xLoc, yLoc, collisioncolors){                              
			switch (type){
				case 'square':
					if (!this.isColorCollision(this.grabPixel(xLoc, yLoc))) return true;
					for (var i = 0; i < collisioncolors.length; i++){
						if (this.isColorCollision(this.grabPixel(xLoc, yLoc)) == collisioncolors[i])
						return true;
					}
					return false;
					break;
				default:
					if (!this.isColorCollision(this.grabPixel(xLoc, yLoc))) return true;
					for (var i = 0; i < collisioncolors.length; i++){
						if (this.isColorCollision(this.grabPixel(xLoc, yLoc)) == collisioncolors[i])
							return true;
					}
					return false;
			}
		},
		returnColorCollision: function (type, xLoc, yLoc){
			switch (type){
				case 'square':
					return this.isColorCollision(this.grabPixel(xLoc, yLoc));
					break;
				default:
					return this.isColorCollision(this.grabPixel(xLoc, yLoc));
			}
		},
		preventColorCollision: function(pointA, pointB, object, collisioncolors){
		
			//var pointA = vec3(pointAt.x - currentarea.map.center.x, pointAt.y - currentarea.map.center.y, 0);
			//var pointB = vec3(pointBt.x - currentarea.map.center.x, pointBt.y - currentarea.map.center.y, 0);

			var mem = 1.0;
			var vec = v2(pointB.x, pointB.y);
			
			//console.log(vec);
		  
			for(var i = 0; i < 2; i++){
				if (this.checkForColorCollision('square', vec.x, -vec.y, collisioncolors)){
					mem -= 0.5;
			 
					vec.x = (pointB.x - pointA.x) * mem;
					vec.y = (pointB.y - pointA.y) * mem;
					if (vec.x != 0 && vec.y != 0){
						if (!this.checkForColorCollision('square', vec.x + pointA.x, -pointA.y,
							collisioncolors)){
							return v2(vec.x + pointA.x, pointA.y);
						}
						if (!this.checkForColorCollision('square', pointA.x, -vec.y + -pointA.y,
							collisioncolors)){
							return v2(pointA.x, vec.y + pointA.y);
						}
					}
					vec.x += pointA.x;
					vec.y += pointA.y;
					
					object.velocity = [0,0];
				}
				else{
					return vec;
				} 
			}
			return pointA;      
		}	
	}
//**************  END IMAGEBUFFER  ****************//

//**************  TEXT CLASS  ****************//
	function Text(textArray, textStyle, lineHeightArray, 
								offsetArray, textColor, textPosition){
		this.textarray = textArray;	
		this.textstyle = textStyle;
		this.lineheightarray = lineHeightArray;
		this.offsetarray = offsetArray;
		this.textcolor = textColor;
		this.position = textPosition;
		this.texture = null;
		this.material = null;
		this.mesh = null;
		
		this.refreshText();
	}
	Text.prototype = {
		setTextArray: function (newTextArray){
			this.textarray = newTextArray;
		},
		setTextStyle: function (newTextStyle){
			this.textstyle = newTextStyle;
		},
		setLineHeightArray: function (newLineHeightArray){
			this.lineheightarray = newLineHeightArray;
		},
		setOffsetArray: function (newOffsetArray){
			this.offsetarray = newOffsetArray;
		},
		setTextColor: function (newTextColor){
			this.textcolor = newTextColor;
		},
		setTextPosition: function (newTextPosition){
			this.position = newTextPosition;
		},
		refreshText: function (){
			var canvas = document.createElement('canvas');
			canvas.width = 640; canvas.height = 480;
			var context = canvas.getContext('2d');
			context.font = this.textstyle;
			context.fillStyle = this.textcolor;
			for (var i = 0; i < this.textarray.length; i++) {
				context.fillText(this.textarray[i], this.offsetarray ? this.offsetarray[i] : 0,
											 this.lineheightarray[i]*(i+1));
			}
			
			// canvas contents will be used for a texture
			this.texture = new THREE.Texture(canvas) 
			this.texture.needsUpdate = true;
			  
			this.material = new THREE.MeshBasicMaterial( {map: this.texture} );
			this.material.transparent = true;
		
			this.mesh = new THREE.Mesh(
			new THREE.PlaneGeometry(canvas.width, canvas.height), this.material);
			this.mesh.position.set(this.position.x+320,-this.position.y-240,this.position.z);
			this.mesh.doubleSided = true;
		},
		addTo: function (obj){
			obj.add(this.mesh);
		},
		removeFromScene: function (){
			scene.remove(this.mesh);
		}
	}
//**************  END TEXT  ****************//
  
//**************  TEXTBOX CLASS  ****************//
	function Textbox(opts){

		this.name = opts.hasOwnProperty('name') ? opts.name : '';
		this.string = opts.hasOwnProperty('string') ? opts.string : '';
		this.textstyle = opts.hasOwnProperty('textstyle') ? opts.textstyle : "22px Georgia";
		this.textalign = opts.hasOwnProperty('textalign') ? opts.textalign : "left";
		this.lineheight = opts.hasOwnProperty('lineheight') ? opts.lineheight : 30;
		this.offset = opts.hasOwnProperty('offset') ? opts.offset : 0;
		this.maxwidth = opts.hasOwnProperty('maxwidth') ? opts.maxwidth : 600;
		this.textcolor = opts.hasOwnProperty('textcolor') ? opts.textcolor : 'rgba(255,255,255,1.0)';
		this.position = opts.hasOwnProperty('position') ? opts.position : new THREE.Vector3(-140,2000,703);
		this.textoffset = opts.hasOwnProperty('textoffset') ? opts.textoffset : new THREE.Vector3(28,-327,0);
		this.delaybefore = opts.hasOwnProperty('delaybefore') ? opts.delaybefore : 0;
		this.delayafter = opts.hasOwnProperty('delayafter') ? opts.delayafter : 0.400;
		this.onClick = opts.onClick || noop;
		this.timer = opts.timer || 0;
		this.fadetime = opts.hasOwnProperty('fadetime') ? opts.fadetime : 0.3;
		this.shadowcolor = opts.hasOwnProperty('shadowcolor') ? opts.shadowcolor : 'black';
		this.shadowblur = opts.hasOwnProperty('shadowblur') ? opts.shadowblur : 0;
		this.outlinewidth = opts.hasOwnProperty('outlinewidth') ? opts.outlinewidth : false;
		this.outlinecolor = opts.hasOwnProperty('outlinecolor') ? opts.outlinecolor : false;
		
		this.event = opts.hasOwnProperty('event') ? opts.event : false;

		this.texture = null;
		this.material = null;
		this.mesh = null;
		this.meshscale = opts.hasOwnProperty('meshscale') ? opts.meshscale : 1;
		this.textscale = opts.hasOwnProperty('textscale') ? opts.textscale : 7.2;
		
		this.bgpicture = opts.hasOwnProperty('bgpicture') ? opts.bgpicture : false;
		this.facepicture = opts.hasOwnProperty('facepicture') ? opts.facepicture : false;
		this.faceposition = opts.hasOwnProperty('faceposition') ? opts.faceposition : 'left';
		this.type = opts.hasOwnProperty('type') ? opts.type : 'single';
		this.specialfunction = opts.hasOwnProperty('specialfunction') ? opts.specialfunction : null;
		this.seq = null;
		this.seqnum = null; 
		
		this.refreshText();
	}
	Textbox.prototype = {
		setString: function (newString){
			this.string = newString;
			this.refreshText();
		},
		setTextStyle: function (newTextStyle){
			this.textstyle = newTextStyle;
		},
		setLineHeightArray: function (newLineHeightArray){
			this.lineheightarray = newLineHeightArray;
		},
		setOffset: function (newOffset){
			this.offset = newOffset;
		},
		setTextColor: function (newTextColor){
			this.textcolor = newTextColor;
		},
		setPosition: function (newPosition){
			this.position = newPosition;
		},
		refreshText: function (string, style){
		
			if (string) this.string = string;
		
			var canvas = document.createElement('canvas');
			canvas.width = 640; canvas.height = 480;
			var context = canvas.getContext('2d');
			context.font = this.textstyle;
			context.textAlign = this.textalign;
			context.fillStyle = this.textcolor;
			context.shadowColor = this.shadowcolor;
			context.shadowBlur = this.shadowblur;
			
			context.strokeStyle = 'white';
			
			if (this.outlinewidth === false || this.outlinecolor === false)
				context.wrapText({
					text: this.string, 
					offset: this.offset,
					width: this.maxwidth, 
					lineheight: this.lineheight
				});
			else
				context.wrapText({
					text: this.string, 
					offset: this.offset,
					width: this.maxwidth, 
					lineheight: this.lineheight,
					outlinewidth: this.outlinewidth, 
					outlinecolor: this.outlinecolor
				});

			this.texture = new THREE.Texture(canvas); 
			this.texture.needsUpdate = true;
			  
			this.material = new THREE.MeshBasicMaterial( {map: this.texture, opacity: 0.0} );
			this.material.transparent = true;
		
			this.mesh = new THREE.Mesh(
				new THREE.PlaneGeometry(canvas.width, canvas.height), this.material);
			this.mesh.position.set(this.position.x+320,-this.position.y-240,this.position.z);
			this.mesh.doubleSided = true;
			this.mesh.scale.set(this.textscale,this.textscale,this.textscale);
			
		},
		addTo: function (obj){
			obj.add(this.mesh);
		},
		removeFrom: function (obj){
			obj.remove(this.mesh);
		},
		play: function (textseq, currentnum){
		
			if (this.bgpicture == false) this.bgpicture = this.system.standardtextbox;
			if (this.facepicture == false) this.facepicture = this.system.nopic;
		
			this.system.currentarea.currenttextbox = this;
			
			var system = this.system;
			var currentarea = this.system.currentarea;
			var mainmouse = this.system.mouse;
		  
			runTimeout(function (self){
			
				system.currentarea.currenttextbox.addTo(system.hud); 
				system.currentarea.currenttextbox.facepicture.removeFrom(system.currentarea.graph); 
				system.currentarea.currenttextbox.facepicture.addTo(system.hud); 
				
				switch (system.currentarea.currenttextbox.faceposition){
				
					case 'left':
						system.currentarea.currenttextbox.facepicture.position.set(-1600,260,702); 
						break;
						
					case 'right':
						system.currentarea.currenttextbox.facepicture.position.set(1600,260,702); 
						break;
						
					case 'middle':
						system.currentarea.currenttextbox.facepicture.position.set(0,260,702); 
						break;
						
					default:
						system.currentarea.currenttextbox.facepicture.position.set(
							system.currentarea.currenttextbox.faceposition.x,
							system.currentarea.currenttextbox.faceposition.y,
							system.currentarea.currenttextbox.faceposition.z
						); 
						break;
				}
			
				fadeIn({objects: [system.currentarea.currenttextbox.bgpicture, 
					system.currentarea.currenttextbox, system.currentarea.currenttextbox.facepicture],
					time: system.currentarea.currenttextbox.fadetime});        
			   
				switch (system.currentarea.currenttextbox.type){
					case 'stopplayer':
					
						stopPlayer();
						
						mainmouse.textboxup = true;
						mainmouse.controlsplayer = false;
						mainmouse.responsive = false;
						system.textboxready = true;
						
						mainmouse.textboxclick = function(){
							if (system.textboxready) {
								system.textboxready = false;
								mainmouse.textboxclick = noop;
								fadeOut({object: currentarea.currenttextbox.bgpicture, time:currentarea.currenttextbox.fadetime});
								fadeOut({object: currentarea.currenttextbox.facepicture, time:currentarea.currenttextbox.fadetime});
								fadeOut({object: currentarea.currenttextbox, time: currentarea.currenttextbox.fadetime,
									onComplete: function (){
									
										currentarea.currenttextbox.onClick();
										
										if (textseq && currentnum || textseq && currentnum == 0){
											if (currentnum < textseq.textboxes.length - 1){
												runTimeout(function (){
													currentarea.currenttextbox.removeFrom(system.hud);
													textseq.play(currentnum + 1);
												}, currentarea.currenttextbox.delayafter);
											}
											else {
												currentarea.currenttextbox.removeFrom(system.hud);
												textseq.onComplete();
											}
										} 
										
										mainmouse.textboxup = false;  
										
									}});                  
							} 
						};
						currentarea.controls = new Controls({'name': '', 'update': function (){
						
							if ((keyboard.up("space") || keyboard.up("enter"))
								&& system.textboxready ) {
								
								system.textboxready = false;
								mainmouse.textboxclick = function(){};
								
								fadeOut({object: currentarea.currenttextbox.bgpicture, time:currentarea.currenttextbox.fadetime});
								fadeOut({object: currentarea.currenttextbox.facepicture, time:currentarea.currenttextbox.fadetime});
								fadeOut({object: currentarea.currenttextbox, time: currentarea.currenttextbox.fadetime,
									onComplete: function (){
									
										currentarea.currenttextbox.onClick();
										
										if (textseq && currentnum || textseq && currentnum == 0){
											if (currentnum < textseq.textboxes.length - 1){
												runTimeout(function (){
													currentarea.currenttextbox.removeFrom(system.hud);
													textseq.play(currentnum + 1);
												}, currentarea.currenttextbox.delayafter);
											}
											else {
												currentarea.currenttextbox.removeFrom(system.hud);
												textseq.onComplete();
											}
										} 
										
										mainmouse.textboxup = false; 
										
									}});                   
							} 
							
						}});
						
						break;
						
					//scene sets controls null and waits for button press
					case 'scene':
				  
						mainmouse.textboxup = true;
						system.textboxready = true;
					
						mainmouse.textboxclick = function(){
					
							if (system.textboxready){
								
								system.textboxready = false;
								mainmouse.textboxclick = noop;
								currentarea.controls = false;
								
								fadeOut({object: currentarea.currenttextbox.bgpicture, time:currentarea.currenttextbox.fadetime});
								fadeOut({object: currentarea.currenttextbox.facepicture, time:currentarea.currenttextbox.fadetime});
								fadeOut({object: currentarea.currenttextbox, time: currentarea.currenttextbox.fadetime, 
									onComplete: function (){
									
										currentarea.currenttextbox.onClick();
										
										if (textseq && currentnum || textseq && currentnum == 0){
											if (currentnum < textseq.textboxes.length - 1)
												runTimeout(function (){
													currentarea.currenttextbox.removeFrom(system.hud);
													textseq.play(currentnum + 1);
												}, currentarea.currenttextbox.delayafter);
											else {
												currentarea.currenttextbox.removeFrom(system.hud);
												textseq.onComplete();
											}
										}
										
										mainmouse.textboxup = false; 
										
									}});
						   
							} 
						}
						
						currentarea.controls = function (){
							
							if ((keyboard.down("space") || keyboard.up("enter"))
								&& system.textboxready){
								
								system.textboxready = false;
								mainmouse.textboxclick = noop;
								currentarea.controls = false;
								
								fadeOut({object: currentarea.currenttextbox.bgpicture, time:currentarea.currenttextbox.fadetime});
								fadeOut({object: currentarea.currenttextbox.facepicture, time:currentarea.currenttextbox.fadetime});
								fadeOut({object: currentarea.currenttextbox, time: currentarea.currenttextbox.fadetime,
									onComplete: function (){
										currentarea.currenttextbox.onClick();
										if (textseq && currentnum || textseq && currentnum == 0){
										
											if (currentnum < textseq.textboxes.length - 1){
												runTimeout(function (){
													currentarea.currenttextbox.removeFrom(system.hud);
													textseq.play(currentnum + 1);
												}, currentarea.currenttextbox.delayafter);
											}
											else {
											
												currentarea.currenttextbox.removeFrom(system.hud);
												textseq.onComplete();
												
											}
											
										}  
										
										mainmouse.textboxup = false; 
									}});
						   
							} 
						}
						
						break;
						
					//timed displays until time is up
					case 'timed':
					
						//system.currentarea.storedcontrols = system.currentarea.controls;
						//system.currentarea.controls = new Controls('empty', noop);

						runTimeout(function(arr){
						
							fadeOut({object: system.currentarea.currenttextbox.bgpicture, 
								time: system.currentarea.currenttextbox.fadetime});
							fadeOut({object: system.currentarea.currenttextbox.facepicture,
								time: system.currentarea.currenttextbox.fadetime});
							fadeOut({object: system.currentarea.currenttextbox, 
								time: system.currentarea.currenttextbox.fadetime,
								onComplete: function (){
									
									system.currentarea.currenttextbox.onClick();
									
									if (textseq && currentnum || textseq && currentnum == 0){
										if (currentnum < textseq.textboxes.length - 1){
											runTimeout(function (){
												currentarea.currenttextbox.removeFrom(system.hud);
												textseq.play(currentnum + 1);
											}.bind(this), currentarea.currenttextbox.delayafter);
										}
										else{ 
											currentarea.currenttextbox.removeFrom(system.hud);
											textseq.onComplete();
										}
									} 
									
								}.bind(this)});
								
						}.bind(this), currentarea.currenttextbox.timer);
						
						break;
					//opposite of stop player
					case 'startplayer':
					
						mainmouse.textboxup = true;
						system.textboxready = true;
						mainmouse.textboxclick = function(){
						
							if (system.textboxready){
							
								system.textboxready = false;
								mainmouse.textboxclick = noop; 
								
								fadeOut({object: currentarea.currenttextbox.bgpicture, time:currentarea.currenttextbox.fadetime});
								fadeOut({object: currentarea.currenttextbox.facepicture, time:currentarea.currenttextbox.fadetime});
								fadeOut({object: currentarea.currenttextbox, time: currentarea.currenttextbox.fadetime,
									onComplete: function (){
									
										currentarea.currenttextbox.onClick();
										
										if (textseq && currentnum || textseq && currentnum == 0){
											if (currentnum < textseq.textboxes.length - 1){
												setTimeout(function (){
													currentarea.currenttextbox.removeFrom(system.hud);
													textseq.play(currentnum + 1);
												}, currentarea.currenttextbox.delayafter);
											}
											else {
												currentarea.currenttextbox.removeFrom(system.hud);
												textseq.onComplete();
											}
										}   
										
										currentarea.controls = system.maincontrols();
										mainmouse.controlsplayer = true;
										mainmouse.textboxup = false;
										mainmouse.responsive = true;
										
									}
								});        
							} 
							
						}
						currentarea.controls = new Controls({'name': '', 'update': function (){
						
							if ((keyboard.up("space") || keyboard.up("enter"))
								&& system.textboxready  ) {
								
								system.textboxready = false;
								mainmouse.textboxclick = noop;
								
								fadeOut({object: currentarea.currenttextbox.bgpicture, time:currentarea.currenttextbox.fadetime});
								fadeOut({object: currentarea.currenttextbox.facepicture, time:currentarea.currenttextbox.fadetime});
								fadeOut({object: currentarea.currenttextbox, time: currentarea.currenttextbox.fadetime,
									onComplete: function (){
									
										currentarea.currenttextbox.onClick();
										
										if (textseq && currentnum || textseq && currentnum == 0){
											if (currentnum < textseq.textboxes.length - 1){
												setTimeout(function (){
													currentarea.currenttextbox.removeFrom(system.hud);
													textseq.play(currentnum + 1);
												}, currentarea.currenttextbox.delayafter);
											}
											else {
												currentarea.currenttextbox.removeFrom(system.hud);
												textseq.onComplete();
											}
										}   
										
										currentarea.controls = system.maincontrols();
										mainmouse.controlsplayer = true;
										mainmouse.textboxup = false;
										mainmouse.responsive = true;
										
									}
								});      
							} 
						}});
					break;
					
					case 'single':
					
						mainmouse.textboxup = true;
						system.textboxready = true;
						this.eventpos = currentarea.player.position.clone();
						
						mainmouse.textboxclick = function(){
							
							if (system.textboxready) {
							
								system.textboxready = false;
								mainmouse.textboxclick = noop;
								
								fadeOut({object: currentarea.currenttextbox.bgpicture, time:currentarea.currenttextbox.fadetime});
								fadeOut({object: currentarea.currenttextbox.facepicture, time:currentarea.currenttextbox.fadetime});
								fadeOut({object: currentarea.currenttextbox, time: currentarea.currenttextbox.fadetime,
									onComplete: function (){
									
										currentarea.currenttextbox.onClick();
										
										if (textseq && currentnum || textseq && currentnum == 0){
											if (currentnum < textseq.textboxes.length - 1){
												setTimeout(function (){
													mainmouse.textboxup = false;
													currentarea.controls = false;
													currentarea.currenttextbox.removeFrom(system.hud);
													textseq.play(currentnum + 1);
												}, currentarea.currenttextbox.delayafter);
											}
											else {
												mainmouse.textboxup = false;
												currentarea.controls = false;
												currentarea.currenttextbox.removeFrom(system.hud);
												textseq.onComplete();
											}
										} 
										
									}
									
								});
							}
							
						}
						currentarea.controls = function (textbox){
						
							if (currentarea.player && 
								(distance2d(currentarea.player.position, textbox.eventpos) > 40)){
								
								system.textboxready = false;
								currentarea.controls = false;
								mainmouse.textboxclick = noop;
								
								fadeOut({object: currentarea.currenttextbox.bgpicture, time:currentarea.currenttextbox.fadetime});
								fadeOut({object: currentarea.currenttextbox.facepicture, time:currentarea.currenttextbox.fadetime});
								fadeOut({object: currentarea.currenttextbox, time: currentarea.currenttextbox.fadetime,
									onComplete: function (){
										currentarea.currenttextbox.onClick();
										mainmouse.textboxup = false;
										currentarea.controls = false;
										currentarea.currenttextbox.removeFrom(system.hud);
									}}
								);
								
							}
							else if ((keyboard.up("space") || keyboard.up("enter")) && system.textboxready){
									
								system.textboxready = false;
								currentarea.controls = false;
								mainmouse.textboxclick = noop;
								
								fadeOut({object: currentarea.currenttextbox.bgpicture, time:currentarea.currenttextbox.fadetime});
								fadeOut({object: currentarea.currenttextbox.facepicture, time:currentarea.currenttextbox.fadetime});
								fadeOut({object: currentarea.currenttextbox, time: currentarea.currenttextbox.fadetime,
									onComplete: function (){
									
										currentarea.currenttextbox.onClick();
										
										if (textseq && currentnum || textseq && currentnum == 0){
											if (currentnum < textseq.textboxes.length - 1){
												setTimeout(function (){
													mainmouse.textboxup = false;
													currentarea.controls = false;
													currentarea.currenttextbox.removeFrom(system.hud);
													textseq.play(currentnum + 1);
												}, currentarea.currenttextbox.delayafter);
											}
											else {
												mainmouse.textboxup = false;
												currentarea.controls = false;
												currentarea.currenttextbox.removeFrom(system.hud);
												textseq.onComplete();
											}
										}
										
									}}
								);
								
							}
							
						}.bind(currentarea, this);
						
						break;
						
					default:
					
				}
			}.bind(this), system.currentarea.currenttextbox.delaybefore); 
		}
	}
	  
	function wrapText(context, text, x, y, maxWidth, lineHeight) {
		
		var words = text.split(' ');
		var line = '';

		for(var n = 0; n < words.length; n++) {
			var testLine = line + words[n] + ' ';
			var metrics = context.measureText(testLine);
			var testWidth = metrics.width;
			if(testWidth > maxWidth) {
			
				context.fillText(line, x, y);
				line = words[n] + ' ';
				y += lineHeight;
				
			}
			else {
				line = testLine;
			}
		}
		context.fillText(line, x, y);
	}   
//**************  END TEXTBOX  ****************//
  
//**************  TEXTBOXSEQUENCE CLASS  ****************//
	function TextboxSequence(opts) {
		this.name = ((opts['name']) ? opts['name'] : '');
		this.system = ((opts['system']) ? opts['system'] : false);
		this.textboxes = ((opts['textboxes']) ? opts['textboxes'] : []);
		for (var i=0; i<this.textboxes.length; i++){
			this.textboxes[i].system = this.system;
		}
		this.onComplete = ((opts['onComplete']) ? opts['onComplete'] : noop);
	}
	TextboxSequence.prototype = {
		setName: function (newName){
			this.name = newName;
		},
		setTextboxes: function (newTextboxes){
			this.textboxes = newTextboxes;
		},
		addTextbox: function (newTextbox){
			this.textboxes.push(newTextbox);
		},
		play: function (num){
			if (num) this.textboxes[num].play(this, num); //send in next textbox to play()
			else this.textboxes[0].play(this, 0); 
		}
	}
//**************  END TEXTBOXSEQUENCE  ****************//
  
//*************  AUDIOEFFECT CLASS  ***************//
	function AudioEffect(opts) {
	
		if (!opts.filename){
			console.log('filename missing for Audio class: ' + opts.name);
			return false;
		}
		
		this.filename = opts.hasOwnProperty('filename') ? opts.filename : false;
		this.name = opts.hasOwnProperty('name') ? opts.name : false;	
		this.channel = opts.hasOwnProperty('channel') ? opts.channel : false;
		
		if (opts.repeat) this.repeat = 'loop';
			else this.repeat = '';
		this.playing = false;
		this.loaded = false;
		
		this._syspause = false;
		
		var audioclass = this;
		this.volume = opts.hasOwnProperty('volume') ? opts.volume : 1.0;
		
		function loadAudio(url, vol){
			var audio = new Audio();
			audio.src = url;
			audio.preload = "auto";
			audio.volume = vol;
			audio.loop = audioclass.repeat;

			//jQuery(audio).on("loadeddata", function (){audioclass.loaded = true});
			audio.addEventListener('canplaythrough', function() { 
				this.loaded = true;
			}.bind(audioclass), false);
			
			return audio;
		}
		if (support.audio === 'ogg') {
			this.sound = loadAudio(this.filename + '.ogg', this.volume);
		} 
		else if (support.audio === 'mp3') { 
			this.sound = loadAudio(this.filename + '.mp3', this.volume);
		}
	}
	AudioEffect.prototype = {
		setVolume: function (newVolume){
			this.sound.volume = newVolume;
		},
		setRepeat: function (newRepeat){
			if (newRepeat) {
				this.repeat = 'loop';    
			}
			else this.repeat = '';
				this.sound.loop = this.repeat;
			},
		togglePlaying: function (){
			if (this.playing){
				this.playing = false;
				if (support.audio) this.sound.pause();
			}
			else { 
				this.playing = true;
				if (support.audio) this.sound.play();
			}
		},
		play: function (){
			this.playing = true;
			if (support.audio) this.sound.play();
		},
		pause: function (){
			this.playing = false;
			this.sound.pause();
		},
		fadein: function(time, volume){
			this.playing = true;
			this.sound.volume = 0;
			this.sound.play();
			if (undef(volume)) var volume = 0.5;
			tween({object: this.sound, time: time, to: {volume: volume}}).start(); 
		},
		fadeout: function(time){
			tween({object: this.sound, time: time, to: {volume: 0}, 
				onComplete: function(){
					this.playing = false;
					this.sound.pause();
				}.bind(this)
			}).start(); 
		},
		fadeto: function(time, volume, onFinish){
			tween({object: this.sound, time: time, to: {volume: volume}, 
				onComplete: onFinish.bind(this)}).start(); 
		},
		fadeoutpause: function(time){
			tween({object: this.sound, time: time, to: {volume: 0}, 
				onComplete: function(){
					this.sound.pause();
					this.playing = false;
				}.bind(this)}).start(); 
		},
		resetAudio: function (){
			this.sound.currentTime = 0;
		}
	}
//**************  END AUDIOEFFECT  ****************// 
  
//**************  AUDIOBUFFER CLASS  ****************// 
	function AudioBuffer(opts){
		
		if (undef(webAudioContext)) return false;
		if (!opts.hasOwnProperty('filename')) return false;
		
		this.name = opts.hasOwnProperty('name') ? opts.name : '';
		this.system = opts.hasOwnProperty('system') ? opts.system : false;
		this.filename = opts.hasOwnProperty('filename') ? opts.filename : false;
		this.autostart = opts.hasOwnProperty('autostart') ? opts.autostart : false;
		this.repeat = opts.hasOwnProperty('repeat') ? opts.repeat : false;
		this.addanalyser = opts.hasOwnProperty('addanalyser') ? opts.addanalyser : false;
		this.visualizer = opts.hasOwnProperty('visualizer') ? opts.visualizer : false;
		
		this.buffer = false;
		this.source = false;
		this.currentTime = 0;
		this.playing = false;
		this.loaded = false;
		this.gain = false;
		this.analyser = false;
		
		this.started_at = 0;
		this.paused_at = 0;
		
		this._syspause = false;
		
		this._volume = opts.hasOwnProperty('volume') ? opts.volume : 1;
		
		this.init();
		
	}
	AudioBuffer.prototype = {
		init: function(){
			var request = new XMLHttpRequest();
			request.open("GET", this.filename, true);
			request.responseType = "arraybuffer";

			request.onload = function(){
				//this.buffer = webAudioContext.createBuffer(request.response, 1, 96000);
				//this.buffer =  
				webAudioContext.decodeAudioData(request.response, function(data){
					this.buffer = data;
					this.source = webAudioContext.createBufferSource();
					this.source.buffer = this.buffer;
					this.source.loop = this.repeat;
					this.gain = webAudioContext.createGain();
					this.gain.gain.setValueAtTime(this._volume, webAudioContext.currentTime);
					this.source.connect(this.gain);
					if (this.addanalyser){
						this.analyser = webAudioContext.createAnalyser();
						this.analyser.fftSize = 1024;
						this.gain.connect(this.analyser);
						this.analyser.connect(this.system.mastergain);
						this.freqByteData = new Uint8Array(this.analyser.frequencyBinCount);
						this.timeByteData = new Uint8Array(this.analyser.frequencyBinCount);
					}
					else {
						this.gain.connect(this.system.mastergain);
					}
					if (this.visualizer && this.visualizer.init) 
						this.visualizer.init(this);
					if (this.autostart){
						//this.source.start(0);
						//this.playing = true;
						this.play();
					}
					
					this.loaded = true;
					
				}.bind(this));
				
			}.bind(this);

			request.send();
		},
		reload: function(filename){
		
			this.filename = filename;
			this.loaded = false;
		
			var request = new XMLHttpRequest();
			request.open("GET", this.filename, true);
			request.responseType = "arraybuffer";

			request.onload = function(){
				this.buffer = webAudioContext.createBuffer(request.response, false);
				this.source = webAudioContext.createBufferSource();
				this.source.buffer = this.buffer;
				this.source.loop = this.repeat;
				this.gain = webAudioContext.createGain();
				this.gain.gain.setValueAtTime(this._volume, webAudioContext.currentTime);
				this.source.connect(this.gain);
				if (this.addanalyser){
					this.analyser = webAudioContext.createAnalyser();
					this.analyser.fftSize = 1024;
					this.gain.connect(this.analyser);
					this.analyser.connect(this.system.mastergain);
					this.freqByteData = new Uint8Array(this.analyser.frequencyBinCount);
					this.timeByteData = new Uint8Array(this.analyser.frequencyBinCount);
				}
				else {
					this.gain.connect(this.system.mastergain);
				}
				if (this.visualizer && this.visualizer.init) 
					this.visualizer.init(this);
				if (this.autostart) this.source.start(0);
				this.loaded = true;
			}.bind(this);

			request.send();
		},
		play: function(time){
			if (this.playing) return;
			if (!undef(time)) this.currentTime = time;
			this.source.start(this.currentTime);
			this.playing = true;
		},
		pause: function(){
			//if (!this.playing) return;
			this.source.stop();
			this.remove();
			this.paused_at += webAudioContext.currentTime - this.started_at;
			this.playing = false;
		},
		unpause: function(){
			if (this.playing) return;
			this.started_at = webAudioContext.currentTime;
			this.source = webAudioContext.createBufferSource();
			this.source.buffer = this.buffer;
			this.source.loop = this.repeat;
			this.gain = webAudioContext.createGain();
			this.gain.gain.setValueAtTime(this._volume, webAudioContext.currentTime);
			this.source.connect(this.gain);
			if (this.addanalyser){
				this.analyser = webAudioContext.createAnalyser();
				this.analyser.fftSize = 1024;
				this.gain.connect(this.analyser);
				this.analyser.connect(this.system.mastergain);
				this.freqByteData = new Uint8Array(this.analyser.frequencyBinCount);
				this.timeByteData = new Uint8Array(this.analyser.frequencyBinCount);
			}
			else {
				this.gain.connect(this.system.mastergain);
			}
			if (this.visualizer && this.visualizer.init) 
				this.visualizer.init(this);
			this.source.start(0, this.paused_at % this.buffer.duration);
			this.playing = true;
		},
		fadein: function(vol, ftime){
			var ctime = webAudioContext.currentTime;
			this.gain.gain.linearRampToValueAtTime(0, ctime);
			this.gain.gain.linearRampToValueAtTime(vol, ctime + ftime);
		},
		fadeout: function(ftime){
			var ctime = webAudioContext.currentTime;
			this.gain.gain.linearRampToValueAtTime(1, ctime);
			this.gain.gain.linearRampToValueAtTime(0, ctime + ftime);
			runTimeout(function(){this.remove();}.bind(this), ftime);
		},
		info: function(){
			if (!this.analyser) return false;
			this.analyser.getByteFrequencyData(this.freqByteData),
			this.analyser.getByteTimeDomainData(this.timeByteData)
			return {
				freq: this.freqByteData,
				time: this.timeByteData
			}
		},
		remove: function(){
			if (this.gain) this.gain.disconnect;
			if (this.analyser) this.analyser.disconnect;
			if (this.source) this.source.disconnect;
			if (this.visualizer && this.visualizer.remove) 
				this.visualizer.remove(this);
		}
	}
//*************  END AUDIOBUFFER  ***************//
  
//*************  PARTICLE SYSTEM CLASS  ***************//
	function ParticleSystem(opts) {
	
		this.winddirection = 0;
		this.updating = opts.hasOwnProperty('updating') ? opts.updating : false;
		this.name = opts.hasOwnProperty('name') ? opts.name : null;
		this.tick = 0;
		
		this.position = opts.hasOwnProperty('position') ? opts.position : v3(0,0,0);
		this.texture = opts.hasOwnProperty('filename') ? 
			THREE.ImageUtils.loadTexture(opts.filename) : 
			THREE.ImageUtils.loadTexture('images/particle/smokeparticle.png');
		this.maxage = opts.hasOwnProperty('maxage') ? opts.maxage : 2;
		this.transparent = opts.hasOwnProperty('transparent') ? opts.transparent : true;
		if (opts.hasOwnProperty('blending')){
			switch (opts.blending){
				case 'add':
					this.blending = THREE.AdditiveBlending;
					this.overdraw = false;
					break;
				case 'sub':
					this.blending = THREE.SubtractiveBlending;
					this.overdraw = false;
					break;
				case 'multiply':
					this.blending = THREE.MultiplyBlending;
					this.overdraw = false;
					break;
				case 'normal':
					this.blending = THREE.NormalBlending;
					this.overdraw = true;
					break;
				default:
					this.blending = THREE.NormalBlending;
					this.overdraw = true;
					break;
			}
		}
		else {
			this.blending = THREE.NormalBlending;
			this.overdraw = true;
		}
		this.alphatest = opts.hasOwnProperty('alphatest') ? opts.alphatest : 0.5;
		this.depthtest = opts.hasOwnProperty('depthtest') ? opts.depthtest : true;
		this.depthwrite = opts.hasOwnProperty('depthwrite') ? opts.depthwrite : false;
		this.perspective = opts.hasOwnProperty('perspective') ? opts.perspective : false;
		if (this.perspective) this.perspective = 1;
		else this.perspective = 0;
		this.particlezoomscale = 1;
		this.particlewindowscale = 1;
	
		this.particleGroup = opts.hasOwnProperty('particlegroup') ? opts.particlegroup : new ParticleGroup({
			texture: this.texture,
			maxAge: this.maxage,
			transparent: this.transparent,
			blending: this.blending,
			alphaTest: this.alphatest,
			depthTest: this.depthtest, 
			depthWrite: this.depthwrite,
			hasPerspective: this.perspective,
			colorize: this.colorize,
			position: this.position
		});

		this.emitter = opts.hasOwnProperty('emitter') ? opts.emitter : new ParticleEmitter({
			position: new THREE.Vector3(0, 0, 0),
			positionSpread: new THREE.Vector3(3000, 3000, 3000),

			acceleration: new THREE.Vector3(0, -10, 0),
			accelerationSpread: new THREE.Vector3( 10, 0, 10 ),

			velocity: new THREE.Vector3(0, 15, 0),
			velocitySpread: new THREE.Vector3(10, 7.5, 10),

			colorStart: new THREE.Color('white'),
			colorEnd: new THREE.Color('blue'),
			size: 5,
			sizeEnd: 2,

			particlesPerSecond: 8000
		});
		//this.particlesize = this.emitter;

		this.particleGroup.addEmitter(this.emitter);		
	}
	ParticleSystem.prototype = {
		setName: function (newName){
			this.name = newName;
		},
		setName: function (newName){
			this.name = newName;
		},
		update: function (delta){
			this.winddirection += .005;
			this.tick += 0.000007;
			this.particleGroup.tick(delta); //(this.tick);
		},
		addTo: function (obj){
			obj.add(this.particleGroup.mesh);
		}
	}
//**************  END PARTICLESYSTEM  ****************//
  
//*************  MOUSE CLASS  ***************//
//*************  TOUCH CLASS  ***************//
//*************  MOUSECONTROLS CLASS  ***************// 
	function MouseControls(opts) { 
	  
		this.name = opts.hasOwnProperty('name') ? opts['name'] : null;	
		this.system = opts.hasOwnProperty('system') ? opts['system'] : false;	
		this.responsive = opts.hasOwnProperty('responsive') ? opts['responsive'] : false;
		this.update = opts.hasOwnProperty('update') ? opts['update'] : noop;
		
		this.container = opts.hasOwnProperty('container') ? opts['container'] : null;
		this.camera = opts.hasOwnProperty('camera') ? opts['camera'] : null;		
		
		this.x = 0;
		this.y = 0;
		this.worldx = 0;
		this.worldy = 0;
		this.touches = [];
		
		this.down = false;
		this.touchdown = 0; 
		this.downinterval = opts.hasOwnProperty('downinterval') ? opts['downinterval'] : null;
		this.touchdowninterval = opts.hasOwnProperty('touchdowninterval') ? opts['touchdowninterval'] : null;
		this.unclicked = opts.hasOwnProperty('unclicked') ? opts['unclicked'] : noop;
		this.unclickedup = opts.hasOwnProperty('unclickedup') ? opts['unclickedup'] : noop;
		//this.textboxclick = opts.hasOwnProperty('textboxclick') ? opts['textboxclick'] : noop;
		
		this.selected = null;
		this.intersected = null;
		this.oldintersected = null;
		this.dragged = null;
		this.projector = null;
		
		this.objects = [];
		this.intersectobjects = [];
		this.hudobjects = [];
		this.hudintersectobjects = [];
		
		this.storedclickables = [];
		
		this.textboxup = false;
		this.canmoveplayer = false;
		
		//this.onDown = noop;
		//this.onMove = noop;
		//this.onUp = noop;
		
		this.init();
	}
	MouseControls.prototype = {
		toggle: function (){
			if (this.responsive) {
				this.responsive = false;
			}
			else{ 
				this.responsive = true;
			}
		},
		init: function (){

			if (!this.container) {
				console.log('Mousecontrols need a container, using window.');
				this.container = window;
			}
			this.projector = new THREE.Projector();

			//mouse events
			this.container.addEventListener( 'mousemove', this.mousemove.bind(this), false );
			this.container.addEventListener( 'mousedown', this.mousedown.bind(this), false );
			this.container.addEventListener( 'mouseup', this.mouseup.bind(this), false );
			this.container.addEventListener( 'mousewheel', function(e){e.preventDefault()}, false );	
			this.container.addEventListener( 'DOMMouseScroll', function(e){e.preventDefault()}, false );	
			if (document.addEventListener){
				document.addEventListener('contextmenu', function(e) {
					//right click menu
					//e.preventDefault();
				}, false);
			} else {
				document.attachEvent('oncontextmenu', function() {
					//right click menu
					window.event.returnValue = false;
				});
			}
		  
			// touch events
			this.container.addEventListener( 'touchstart', this.touchstart.bind(this), false );
			this.container.addEventListener( 'touchmove', this.touchmove.bind(this), false );
			this.container.addEventListener( 'touchend', this.touchend.bind(this), false );
			this.container.addEventListener( 'touchcancel', function(e) {
				//too many touch events for OS, 3 on Android, 12 on iPad
				//add code to drop all touches i guess
			}.bind(this), false);		
		},
		mousedown: function(event){
			//console.log(currentarea);   //good for debugging
			//console.log(this);   //good for debugging
			//console.log(this.x, this.y);  //good for debugging
			//console.log(this.touches);  //good for debugging

			//if (event.button == 1) event.preventDefault();
			
			//if(event.button==2){return false};

			if (this.responsive && !this.textboxup){
				this.down = true;
						  
				if (this.intersected){

					this.selected = this.intersected;

					if (typeof this.intersected !== 'undefined'){
						console.log('clicked');
						this.intersected.click();
					}
				}
				else{       
					console.log('unclicked: nothing clicked');
					this.unclicked();
					this.selected = null;
					this.canmoveplayer = true;
				}
			}
		   
			if ( this.selected ) if (this.selected.draggable) {
				this.dragged = this.selected;
				//this.dragged.dragging(vecOrigin.x, vecOrigin.y, this.x, this.y);
			}
	 
		},
		mousemove: function(event){
			
			event.preventDefault();

			if (this.responsive && !this.textboxup){ 

				var targetOffset = this.container.children[0].getBoundingClientRect();
				
				var tempwidth = targetOffset.right - targetOffset.left;
				var tempheight = targetOffset.bottom - targetOffset.top; 
				
				var eventOffsetX = (event.pageX - targetOffset.left);//*(tempwidth/window.innerWidth);
				var eventOffsetY = (event.pageY - targetOffset.top);//*(tempheight/window.innerHeight);
			
				this.x = ( eventOffsetX / (tempwidth) ) * 2 - 1;
				this.y = - ( eventOffsetY / (tempheight) ) * 2 + 1;

				//ortho/hud camera
				var vecOrigin = new THREE.Vector3( this.x, this.y, -500000 );
				var vecTarget = new THREE.Vector3( this.x, this.y, 100000 );
				
				this.projector = new THREE.Projector();
				this.projector.unprojectVector( vecOrigin, this.camera );
				this.projector.unprojectVector( vecTarget, this.camera );
				vecTarget.sub( vecOrigin ).normalize();
				
				this.worldx = vecOrigin.x;
				this.worldy = vecOrigin.y;
				//this.worldx *= (tempwidth/window.innerWidth);
				//this.worldy *= (tempheight/window.innerHeight);
				
				//console.log(this.worldx, this.worldy);

				var raycaster = new THREE.Raycaster( vecOrigin, vecTarget ); 
				
				var intersects = raycaster.intersectObjects( this.hudintersectobjects );
				
				//perspective camera
				if (this.system.cameramode === 'persp'){
					//console.log('hey');
					this.projector = new THREE.Projector();
					//this.x = ( event.clientX / window.innerWidth ) * 2 - 1;
					//this.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
					var vec = new THREE.Vector3( this.x, this.y, 0.5 );
					this.projector.unprojectVector( vec, this.camera );
					raycaster = new THREE.Raycaster(this.camera.position, vec.sub(this.camera.position).normalize());
				}
	 
				if (intersects.length < 1) {
					//console.log(intersects);
					//var temp = currentarea.graph.position.z;
					//currentarea.graph.position.z = 0;
				
					intersects = raycaster.intersectObjects( this.intersectobjects ); 
					//currentarea.graph.position.z = temp;
					//console.log(intersects);
				}

				if (this.selected) if (this.selected.draggable){
					this.selected.dragging(vecOrigin.x, vecOrigin.y, this.x, this.y, this.system);
				}   

				if (intersects.length > 0){ 
					for (var i = 0; i < this.objects.length; i++) {
						if (typeof this.objects[i].mesh !== 'undefined'){ 
							if (intersects[0].object == this.objects[i].mesh)
										 this.intersected = this.objects[i];}
						//if (typeof this.objects[i].picture !== 'undefined'){ 
							//if (intersects[0].object == this.objects[i].picture.mesh)
										//this.intersected = this.objects[i];}
					}
					if ((this.oldintersected !== this.intersected)){
						this.intersected.hoverin();
						if (this.oldintersected !== null && typeof this.oldintersected !== 'undefined'){
							if (this.oldintersected.hoverout) this.oldintersected.hoverout();
						}
					}
					this.oldintersected = this.intersected;
				} 
				else{
					 if (this.intersected !== null){
						this.intersected.hoverout();
						this.intersected = null;
						this.oldintersected = null;
					 }
				}

			} 
				
		},
		mouseup: function(event){
		
			this.canmoveplayer = false;
		
			if (event) event.preventDefault(); 
			else return;

			if (this.textboxup) this.textboxclick();

			if (this.dragged) if (this.dragged.dragrelease) this.dragged.dragrelease();
			this.dragged = false;

			if (this.downinterval) clearInterval(this.downinterval);

			if (this.responsive && !this.textboxup){ 
				
				this.down = false;

				if (this.intersected) {
			 
					if (typeof this.intersected !== 'undefined'){
						console.log('clickedup');
						this.intersected.clickup();
					}
				
					this.selected = null;
				}
				else{
					//console.log('unclicked up: nothing clicked');
					this.unclickedup();
					this.selected = null;
				}
			}
		},
		touchstart: function(e){
	   
			e.preventDefault();

			this.forEachChangedFinger(e, function(event, id){
			
				var newtouch = {};
				newtouch.points = [];
				newtouch.id = id;
				newtouch.dragged = false;
				newtouch.intersected = false;
				newtouch.oldintersected = false;
				newtouch.selected = false;
				newtouch.touchdowninterval = 0;

				this.touchdown++;
				this.touches.push(newtouch);
				  
				if (this.responsive && !this.textboxup){
		   
					/*var tempwidth = window.innerWidth;
					var tempheight = window.innerHeight;   

					newtouch.touchx = ( event.clientX / parseInt(tempwidth, 10) ) * 2 - 1;
					newtouch.touchy = - ( event.clientY / parseInt(tempheight, 10) ) * 2 + 1;
					
					var vec = new THREE.Vector3( newtouch.touchx, newtouch.touchy, 0.5 );
					
					this.projector = new THREE.Projector();
					
					newtouch.points.push(new Vec3(event.clientX, event.clientY, 0));

					this.projector.unprojectVector( vec, this.camera );

					var raycaster = new THREE.Raycaster(this.camera.position, vec.sub(this.camera.position).normalize());	*/



					//this.down = true;
					
					var targetOffset = this.container.children[0].getBoundingClientRect();
					var eventOffsetX = event.pageX - targetOffset.left;
					var eventOffsetY = event.pageY - targetOffset.top;
					
					var tempwidth = targetOffset.right - targetOffset.left;
					var tempheight = targetOffset.bottom - targetOffset.top; 
					//tolog(tempwidth, tempheight);
				
					newtouch.x = ( eventOffsetX / tempwidth ) * 2 - 1;
					newtouch.y = - ( eventOffsetY / tempheight ) * 2 + 1;

					//ortho/hud camera
					var vecOrigin = new THREE.Vector3( newtouch.x, newtouch.y, -500000 );
					var vecTarget = new THREE.Vector3( newtouch.x, newtouch.y, 100000 );
					
					this.projector = new THREE.Projector();
					this.projector.unprojectVector( vecOrigin, this.camera );
					this.projector.unprojectVector( vecTarget, this.camera );
					vecTarget.sub( vecOrigin ).normalize();
					
					newtouch.worldx = vecOrigin.x;
					newtouch.worldy = vecOrigin.y;

					var raycaster = new THREE.Raycaster( vecOrigin, vecTarget ); 
					
					var intersects = raycaster.intersectObjects( this.hudintersectobjects );
					
					//perspective camera
					if (this.system.cameramode === 'persp'){
						//console.log('hey');
						this.projector = new THREE.Projector();
						//newtouch.x = ( event.clientX / window.innerWidth ) * 2 - 1;
						//newtouch.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
						var vec = new THREE.Vector3( newtouch.x, newtouch.y, 0.5 );
						this.projector.unprojectVector( vec, this.camera );
						raycaster = new THREE.Raycaster(this.camera.position, vec.sub(this.camera.position).normalize());
					}
		 
					if (intersects.length === 0) {intersects = 
											raycaster.intersectObjects( this.intersectobjects ); 
											//console.log(newtouch.intersected);
											}

					if (newtouch.selected) if (newtouch.selected.draggable){
						newtouch.selected.dragging(vecOrigin.x, vecOrigin.y, newtouch.x, newtouch.y, this.system);
					}   

					if (intersects.length > 0){ 
						for (var i = 0; i < this.objects.length; i++) {
							if (typeof this.objects[i].mesh !== 'undefined'){ 
								if (intersects[0].object == this.objects[i].mesh)
											 newtouch.intersected = this.objects[i];}
							//if (typeof this.objects[i].picture !== 'undefined'){ 
								//if (intersects[0].object == this.objects[i].picture.mesh)
											//newtouch.intersected = this.objects[i];}
						}
						if ((newtouch.oldintersected !== newtouch.intersected)){
						  newtouch.intersected.hoverin();
						  if (newtouch.oldintersected !== null && typeof newtouch.oldintersected !== 'undefined'){
								if (newtouch.oldintersected.hoverout) newtouch.oldintersected.hoverout();
							  }
						}
						newtouch.oldintersected = newtouch.intersected;
					} 
					else{
						 if (newtouch.intersected !== null){
							//newtouch.intersected.hoverout();
							newtouch.intersected = null;
							newtouch.oldintersected = null;
						 }
					}
					
					newtouch.down = true;
							  
					if (newtouch.intersected){

						newtouch.selected = newtouch.intersected;

						if (typeof newtouch.intersected !== 'undefined'){
							console.log('touched');
							newtouch.intersected.click();
						}
					}
					else{       
						console.log('untouched: nothing touched');
						this.unclicked();
						newtouch.selected = null;
						if (this.touches.length === 1) this.canmoveplayer = true;
					}
				}  
			}.bind(this));
			
		},
		touchmove: function(e) {

			e.preventDefault(); // prevent page scroll

			this.forEachChangedFinger(e, function(event, id) {
		  
				//event.preventDefault();
			  
				for (var i in this.touches){
					if (this.touches[i].id==id){
						var thistouch = this.touches[i];
					}
				}
		  
				//console.log(thistouch.selected + ' ' + thistouch.selected.name);
				
				//thistouch.camera = camera;
				//var objects = this.outerobjects;
				//var intersectobjects = this.outerintersectobjects;
				
				if (this.responsive && !this.textboxup){
			
					/*var tempwidth = window.innerWidth;
					var tempheight = window.innerHeight;   

					newtouch.touchx = ( event.clientX / parseInt(tempwidth, 10) ) * 2 - 1;
					newtouch.touchy = - ( event.clientY / parseInt(tempheight, 10) ) * 2 + 1;
					
					var vec = new THREE.Vector3( newtouch.touchx, newtouch.touchy, 0.5 );
					
					this.projector = new THREE.Projector();
					
					newtouch.points.push(new Vec3(event.clientXclientX, event.clientY, 0));

					this.projector.unprojectVector( vec, this.camera );

					var raycaster = new THREE.Raycaster(this.camera.position, vec.sub(this.camera.position).normalize());*/



					
					var targetOffset = this.container.getBoundingClientRect();
					var eventOffsetX = event.pageX - targetOffset.left;
					var eventOffsetY = event.pageY - targetOffset.top;
					
					var tempwidth = targetOffset.right - targetOffset.left;
					var tempheight = targetOffset.bottom - targetOffset.top; 
					//tolog(tempwidth, tempheight);
				
					thistouch.x = this.x = ( eventOffsetX / tempwidth ) * 2 - 1;
					thistouch.y = this.y = - ( eventOffsetY / tempheight ) * 2 + 1;

					//ortho/hud camera
					var vecOrigin = new THREE.Vector3( thistouch.x, thistouch.y, -500000 );
					var vecTarget = new THREE.Vector3( thistouch.x, thistouch.y, 100000 );
					
					this.projector = new THREE.Projector();
					this.projector.unprojectVector( vecOrigin, this.camera );
					this.projector.unprojectVector( vecTarget, this.camera );
					vecTarget.sub( vecOrigin ).normalize();
					
					thistouch.worldx = this.worldx = vecOrigin.x;
					thistouch.worldy = this.worldy = vecOrigin.y;

					var raycaster = new THREE.Raycaster( vecOrigin, vecTarget ); 
					
					var intersects = raycaster.intersectObjects( this.hudintersectobjects );
					
					//perspective camera
					if (this.system.cameramode === 'persp'){
						//console.log('hey');
						this.projector = new THREE.Projector();
						//thistouch.x = ( event.clientX / window.innerWidth ) * 2 - 1;
						//thistouch.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
						var vec = new THREE.Vector3( thistouch.x, thistouch.y, 0.5 );
						this.projector.unprojectVector( vec, this.camera );
						raycaster = new THREE.Raycaster(this.camera.position, vec.sub(this.camera.position).normalize());
					}
		 
					if (intersects.length === 0) {intersects = 
											raycaster.intersectObjects( this.intersectobjects ); 
											//console.log(thistouch.intersected);
											}

					if (thistouch.selected) if (thistouch.selected.draggable){
						thistouch.selected.dragging(vecOrigin.x, vecOrigin.y, thistouch.x, thistouch.y);
					}   

					if (intersects.length > 0){ 
						for (var i = 0; i < this.objects.length; i++) {
							if (typeof this.objects[i].mesh !== 'undefined'){ 
								if (intersects[0].object == this.objects[i].mesh)
											 thistouch.intersected = this.objects[i];}
							//if (typeof this.objects[i].picture !== 'undefined'){ 
								//if (intersects[0].object == this.objects[i].picture.mesh)
											//thistouch.intersected = this.objects[i];}
						}
						if ((thistouch.oldintersected !== thistouch.intersected)){
						  thistouch.intersected.hoverin();
						  if (thistouch.oldintersected !== null && typeof thistouch.oldintersected !== 'undefined'){
								//if (thistouch.oldintersected.hoverout) thistouch.oldintersected.hoverout();
							  }
						}
						thistouch.oldintersected = thistouch.intersected;
					} 
					else{
						 if (thistouch.intersected !== null){
							//thistouch.intersected.hoverout();
							thistouch.intersected = null;
							thistouch.oldintersected = null;
						 }
					}
				  
				}       
			}.bind(this));
		},
		touchend: function(event) {
			//alert('touchend');

			this.forEachChangedFinger(event, function(e2, id) {
			 
				//e2.preventDefault();
				  
				for (var i in this.touches){
					if (this.touches[i].id==id){
						var thistouch = this.touches[i];
					}
				}


				if (this.textboxup) this.textboxclick();

				if (thistouch.selected) if (thistouch.selected.dragrelease) 
					thistouch.selected.dragrelease();
					
				thistouch.dragged = false;

				this.pauseplayercontrol = false;
				if (thistouch.downinterval) clearInterval(thistouch.downinterval);

				if (this.responsive && !this.textboxup){ 

					if (this.controlsplayer) stopPlayer();

					if (thistouch.intersected){
					 
						if (typeof thistouch.intersected !== 'undefined'){
							//console.log('clickedup');
							thistouch.intersected.clickup();
						}
								thistouch.selected = null;
					}
					else {
						//console.log('unclicked up: nothing clicked');
						this.unclickedup();
						thistouch.selected = null;
					}

				}
				this.touchdown--;
				removeFromArray(this.touches, thistouch);

				if (this.touches.length === 0) this.canmoveplayer = false;
				  
			}.bind(this));
			
		},
		forEachChangedFinger: function (e, cb) {
		  
			if (e.originalEvent) e = e.originalEvent; //needed?
			e.preventDefault();
			// e.changedTouches is a list of finger events that were changed
			for (var i = 0; i < e.changedTouches.length; i++) {
				var finger = e.changedTouches[i];
				var id = finger.identifier;
				cb(finger, id);
			}
		},
		addClickable: function(clickable, type){
			this.objects.push(clickable);
			//if (clickable.sprite) this.intersectobjects.push(clickable.sprite);
			if (clickable.mesh) this.intersectobjects.push(clickable.mesh);
			// if (clickable.anchor) this.intersectobjects.push(clickable.anchor);
			//else if (clickable.picture.mesh) this.intersectobjects.push(clickable.picture.mesh);
		},
		addHudClickable: function(clickable, type){
			this.objects.push(clickable);
			//if (clickable.sprite) this.hudintersectobjects.push(clickable.sprite);
			if (clickable.mesh) this.hudintersectobjects.push(clickable.mesh);
			//else if (clickable.picture.mesh) this.intersectobjects.push(clickable.picture.mesh);
		},
		removeClickable: function(clickable, type){
			var indexnum = 0;
		   
			for(var i=0;i<this.objects.length;i++){
				if (this.objects[i].name == clickable.name) indexnum = i;
			}
			this.objects.splice(indexnum, 1);
		
			if (clickable.mesh){
				for(var i=0;i<this.intersectobjects.length;i++){
					if (this.intersectobjects[i] == clickable.mesh) indexnum = i;
				}
				this.intersectobjects.splice(indexnum, 1);
			}
		},
		removeHudClickable: function(clickable, type){
			var indexnum = 0;
		   
			for(var i=0;i<this.objects.length;i++){
				if (this.objects[i].name == clickable.name) {
					indexnum = i;
					this.objects.splice(indexnum, 1);
				}
			}
		
			if (clickable.mesh){
				for(var i=0;i<this.hudintersectobjects.length;i++){
					if (this.hudintersectobjects[i] == clickable.mesh) {
						indexnum = i;
						this.hudintersectobjects.splice(indexnum, 1);
					}
				}
			}
		},
		clearClickables: function(type){
			this.intersectobjects = [];
			this.objects = [];
		},
		storeClickables: function(name){
			var storing = {};
			storing.name = name;
			storing.intersects = this.intersectobjects;
			storing.objects = this.objects;
			this.storedclickables.push(storing);
			this.intersectobjects = [];
			this.objects = [];
		},
		restoreClickables: function(name){
			var found = false;
			var indexnum = 0;
			for (var i=0;i<this.storedclickables.length;i++){
				if (name == this.storedclickables[i].name){
					found = this.storedclickables[i];
					this.intersectobjects = found.intersects;
					this.objects = found.objects;
					indexnum = i;
				}
			}
			if (found){
				if (this.storedclickables.length == 1) this.storedclickables = [];
				else this.storedclickables.splice(indexnum, 1);
			}
		}
	}
//**************  END MOUSE  ****************// 

//**************  END GLOBAL CLASSES  ****************//
 