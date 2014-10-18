//**************  GLOBAL VARIABLES  *******************//

	// System global variables
	var systems = [];
	
	function getgs(name){
		for (var i=0; i<systems.length; i++){
			if (systems[i].name == name) return systems[i];
		}
		return false;
	}
	
	var keyboard = new THREEx.KeyboardState();
	var clock = new THREE.Clock();
	var jsloader = new THREE.JSONLoader();
	var webGLCapable = false; canvasCapable = false;
	var renderScale = 1.0; showStats = false;
		
	var lastCallTime = 0;
	var timeSinceLastCall = 0;
	var now = 0;
	var maxSubSteps = 3;
	
//**************  END GLOBAL VARIABLES  *******************//

//**************  GX2 SYSTEM MAIN CLASS  *****************//

	function GX2System(opts){
	
		this.loaded = false;
		this.name = ((opts['name']) ? opts['name'] : false);

		this.createArea = ((opts['createArea']) ? opts['createArea'] : false);
		
		this.container = opts.hasOwnProperty('container') ? opts.container : false;
		this.firstarea = opts.hasOwnProperty('firstarea') ? opts.firstarea : 'initial';
		this.autoClear = opts.hasOwnProperty('autoClear') ? opts.autoClear : false;
		this.canfullscreen = opts.hasOwnProperty('canfullscreen') ? opts.canfullscreen : false;
		this.tweenupdating = opts.hasOwnProperty('tweenupdating') ? opts.tweenupdating : false;
		this.physicstype = opts.hasOwnProperty('physicstype') ? opts.physicstype : 'p2';
		this.gait = opts.hasOwnProperty('gait') ? opts.gait : 1;
		this.debug_on = opts.hasOwnProperty('debug_on') ? opts.debug_on : false;
		this.debuginit = opts.hasOwnProperty('debuginit') ? opts.debuginit : noop;
		this.debugupdate = opts.hasOwnProperty('debugupdate') ? opts.debugupdate : noop;
		this.particlescale = opts.hasOwnProperty('particlescale') ? opts.particlescale : 500;
		this.size = opts.hasOwnProperty('size') ? opts.size : {width: 1.0, height: 1.0};
		this.verifyWebGL = opts.hasOwnProperty('verifyWebGL') ? opts.verifyWebGL : false;
		this.sideborder = opts.hasOwnProperty('sideborder') ? opts.sideborder : false;
		this.loadscreen = opts.hasOwnProperty('loadscreen') ? opts.loadscreen : false;
		this.autoresize = opts.hasOwnProperty('autoresize') ? opts.autoresize : true;
		this.autocenter = opts.hasOwnProperty('autocenter') ? opts.autocenter : false;
		this.onscreen = opts.hasOwnProperty('onscreen') ? opts.onscreen : 0;
		this.offscreen = opts.hasOwnProperty('offscreen') ? opts.offscreen : -20000000;
		this.pauseonblur = opts.hasOwnProperty('pauseonblur') ? opts.pauseonblur : false;
		this.cameramode = opts.hasOwnProperty('cameramode') ? opts.cameramode : 'ortho'; 
		this.screenmode = opts.hasOwnProperty('screenmode') ? opts.screenmode : 'ratio';
		
		this.widthratio = opts.hasOwnProperty('widthratio') ? opts.widthratio : 1.435;
		this.attachpath = opts.hasOwnProperty('attachpath') ? opts.attachpath : '../GX2';
		
		this.cameradistance = opts.hasOwnProperty('cameradistance') ? opts.cameradistance : 12000;
		
		this.vars = {};
		this.globaltimescale = 1;
		this.framecounter = 1, this.delta = 0,
		this.zooming = false, 
		this.updating = true,
		this.loading = false,
		this.pi = Math.PI,
		this.hud = new THREE.Object3D(), this.hud.initialized = false,
		this.ambient, this.light1, this.light2, this.light3,
		this.light4, this.deferredlights,
		this.pauseonblur = this.pauseonblur, this.paused = false,
		this.loadingtext, this.loadinginterval, this.zcoordarray = [],
		this.canvas = document.createElement('canvas'), 
		this.canvascontext = this.canvas.getContext('2d'),
		this.startpos = vec3(0, 0, 0), this.camstartpos = vec3(0, 0, 800);
		
		if (webAudioContext && webAudioContext.createGain){
			this.mastergain = webAudioContext.createGain();
			this.mastergain.connect(webAudioContext.destination);
		}

		if (this.verifyWebGL) this.hasWebGL = verifyWebGL();
		else this.hasWebGL = true;
		
		if (!this.container || 
			!this.createArea || 
			!this.hasWebGL) return false;

		//Queues/Caches
		this.areasinmemory = FixedQueue( 10, [ null, null, null, null, null,
			null, null, null, null, null ] );
		this.loadingareas = [];

		// Physics global variables
		this.world;
		this.bodies = [];
		this.physicsobjects = []; 
		this.physicsgraveyard = [];
		this.pstepping = false;
		
		this.init();
		this.debuginit();
		
		this.TextMaker = function(opts){
			
			var text = opts.hasOwnProperty('text') ? opts.text : '';
			if (opts.hasOwnProperty('string')) text = opts.string;
			
			var wrap = opts.hasOwnProperty('wrap') ? opts.wrap : true;
			
			var x = opts.hasOwnProperty('x') ? opts.x : 0;
			var y = opts.hasOwnProperty('y') ? opts.y : 0;
			
			var textstyle = opts.hasOwnProperty('textstyle') ? opts.textstyle : "22px Georgia";
			var fontstyle = opts.hasOwnProperty('fontstyle') ? opts.fontstyle : false;
			var fontweight = opts.hasOwnProperty('fontweight') ? opts.fontweight : false;
			var textalign = opts.hasOwnProperty('textalign') ? opts.textalign : "left";
			var lineheight = opts.hasOwnProperty('lineheight') ? opts.lineheight : 30;
			var offset = opts.hasOwnProperty('offset') ? opts.offset : 0;
			var textcolor = opts.hasOwnProperty('textcolor') ? opts.textcolor : 'rgba(255,255,255,1.0)';
			var shadowcolor = opts.hasOwnProperty('shadowcolor') ? opts.shadowcolor : 'black';
			var shadowblur = opts.hasOwnProperty('shadowblur') ? opts.shadowblur : 0;
			
			var width = opts.hasOwnProperty('width') ? opts.width : 640;
			var height = opts.hasOwnProperty('height') ? opts.height : 480;
			
			if (textalign == 'center') x += width / 2;
			if (textalign == 'right') x += width;
			
			var outlinewidth = opts.hasOwnProperty('outlinewidth') ? opts.outlinewidth : false;
			var outlinecolor = opts.hasOwnProperty('outlinecolor') ? opts.outlinecolor : false;

			var canvas = this.canvas;
			canvas.width = width; canvas.height = height;
			var context = this.canvascontext;
			context.font = textstyle;
			if (fontstyle) context.fontStyle = fontstyle;
			if (fontweight) context.fontWeight = fontweight;
			context.textAlign = textalign;
			context.fillStyle = textcolor;
			context.shadowColor = shadowcolor;
			context.shadowBlur = shadowblur;
			
			context.strokeStyle = 'white';
			
			context.clearRect(0, 0, width, height);
			
			if (outlinewidth === false || outlinecolor === false){
				if (wrap) context.wrapText({
						x: x,
						y: y,
						text: text, 
						width: width, 
						offset: offset,
						lineheight: lineheight
					});
				else {
					y += lineheight;
					context.fillText(text, x, y);
				}
			}
			else {
				if (wrap) context.wrapText({
						x: x,
						y: y,
						text: text,
						width: width, 			
						offset: offset, 
						lineheight: lineheight, 
						outlinewidth: outlinewidth, 
						outlinecolor: outlinecolor
					});
				else {
					y += lineheight;
					context.strokeStyle = outlinecolor;
					context.miterLimit = 2;
					context.lineJoin = 'circle';
					context.lineWidth = outlinewidth;
					context.strokeText(text, x, y);
					context.lineWidth = 1;
					context.fillText(text, x, y);
				}
			}
				
			var texture = new THREE.Texture(canvas); 
			texture.needsUpdate = true;

			return texture;
			
		}.bind(this);
		this.TextBoxMaker = function(opts){

			var obj = {};
			
			obj.system = this;
			obj.playing = false;
			
			obj.textstyle = opts.hasOwnProperty('textstyle') ? opts.textstyle : "22px Georgia";
			obj.textalign = opts.hasOwnProperty('textalign') ? opts.textalign : "left";
			obj.lineheight = opts.hasOwnProperty('lineheight') ? opts.lineheight : 30;
			obj.offset = opts.hasOwnProperty('offset') ? opts.offset : 0;
			obj.textcolor = opts.hasOwnProperty('textcolor') ? opts.textcolor : 'rgba(255,255,255,1.0)';
			obj.shadowcolor = opts.hasOwnProperty('shadowcolor') ? opts.shadowcolor : 'black';
			obj.shadowblur = opts.hasOwnProperty('shadowblur') ? opts.shadowblur : 0;
			
			obj.width = opts.hasOwnProperty('width') ? opts.width : 550;
			obj.height = opts.hasOwnProperty('height') ? opts.height : 150;
			
			obj.outlinewidth = opts.hasOwnProperty('outlinewidth') ? opts.outlinewidth : false;
			obj.outlinecolor = opts.hasOwnProperty('outlinecolor') ? opts.outlinecolor : false;
			
			obj.parent = opts.hasOwnProperty('parent') ? opts.parent : 'hud';
			obj.type = opts.hasOwnProperty('type') ? opts.type : 'event';
			obj.event = opts.hasOwnProperty('event') ? opts.event : false;
			
			obj.reader = opts.hasOwnProperty('reader') ? opts.reader : false;
			obj.reader.width = obj.width; obj.reader.height = obj.height; obj.reader.text = '';
			obj.readerspeed = opts.hasOwnProperty('readerspeed') ? opts.readerspeed : 0.02;
			obj.readertext = opts.hasOwnProperty('readertext') ? opts.readertext : '';
			obj.readerindex = 0;
			
			obj.onStart = opts.hasOwnProperty('onStart') ? opts.onStart : noop;
			obj.onPlay = opts.hasOwnProperty('onPlay') ? opts.onPlay : noop;
			obj.onClick = opts.hasOwnProperty('onClick') ? opts.onClick : noop;
			obj.onClose = opts.hasOwnProperty('onClose') ? opts.onClose : noop;
			obj.onComplete = opts.hasOwnProperty('onComplete') ? opts.onComplete : noop;
			obj.onNext = opts.hasOwnProperty('onNext') ? opts.onNext : noop;
			obj.onUpdate = opts.hasOwnProperty('onUpdate') ? opts.onUpdate : noop;
			obj.onCustom = opts.hasOwnProperty('onCustom') ? opts.onCustom : noop;
			
			obj.delaybefore = opts.hasOwnProperty('delaybefore') ? opts.delaybefore : 0.1;
			obj.delayafter = opts.hasOwnProperty('delayafter') ? opts.delayafter : 0.1;
			obj.fadetime = opts.hasOwnProperty('fadetime') ? opts.fadetime : 0.4;
			obj.time = opts.hasOwnProperty('time') ? opts.time : 1.0;
			
			obj.text = opts.hasOwnProperty('text') ? opts.text : new Picture({
				texture: obj.system.TextMaker({
					string: '',
					width: obj.width, 
					height: obj.height
				}), 
				position: v3(0,0,1)
			});
			obj.bg = opts.hasOwnProperty('bg') ? opts.bg : false;
			obj.face = opts.hasOwnProperty('face') ? opts.face : false;
			obj.anchor = new THREE.Object3D();
			
			obj.scale = opts.hasOwnProperty('scale') ? opts.scale : 7.5;
			obj.anchor.scale.set(obj.scale, obj.scale, obj.scale);
			obj.scale = obj.anchor.scale;
			
			obj.position = obj.anchor.position;
			obj.rotation = obj.anchor.rotation;
			
			obj.clickready = false;
			obj.textfinished = false;
			
			if (opts.hasOwnProperty('position')){
				obj.position.x = opts.position.x;
				obj.position.y = opts.position.y;
				obj.position.z = opts.position.z;
			}
			else {
				//obj.position.y = -150;
			}
			if (opts.hasOwnProperty('rotation')){
				obj.rotation.x = opts.rotation.x;
				obj.rotation.y = opts.rotation.y;
				obj.rotation.z = opts.rotation.z;
			}
			
			obj.fadein = function(opts){
				if (this.text) this.text.fadein(opts);
				if (this.bg) this.bg.fadein(opts);
				if (this.face) this.face.fadein(opts);
			}.bind(obj);
			
			obj.fadeout = function(opts){
				if (this.text) this.text.fadeout(opts);
				if (this.bg) this.bg.fadeout(opts);
				if (this.face) this.face.fadeout(opts);
			}.bind(obj);
			
			obj.showText = function(){
				this.reader.text = this.readertext;
				this.text.setTexture(this.system.TextMaker(this.reader));
				this.textfinished = true;
			}.bind(obj);
			
			obj.onReader = function(system){
				if (!this.textfinished){
					this.readerindex++;
					this.reader.text = this.readertext.substring(0, this.readerindex);
					this.text.setTexture(this.system.TextMaker(this.reader));
					if (this.reader.text.length == this.readertext.length) this.textfinished = true;
					if (!this.textfinished)
						runTimeout(function(){this.onReader();}.bind(this), this.readerspeed);
				}
			}.bind(obj);
			
			obj.play = function(){
				if (this.playing) return;
				this.playing = true;
				this.reader.text = '';
				this.readerindex = 0;
				this.textfinished = false;
				if (!this.reader) this.textfinished = true;
				if (this.text) this.anchor.add(this.text.anchor);
				if (this.bg) this.anchor.add(this.bg.anchor);
				if (this.face) this.anchor.add(this.face.anchor);
				this.clickready = false;
				switch (this.type){
					case 'event': default:
						this.system.mouse.textboxup = this;
						this.onStart();
						if (this.text) this.text.material.opacity = 0;
						if (this.bg) this.bg.material.opacity = 0;
						if (this.face) this.face.material.opacity = 0;
						if (this.parent == 'scene') this.addTo(this.system.currentarea.graph);
						if (this.parent == 'hud') this.addTo(this.system.hud);
						this.fadein({time: this.fadetime});
						runTimeout(function(){
							this.clickready = true;
							this.onPlay.call(this);
							if (this.reader) this.onReader.call(this);
							if (this.system.currentarea.player && this.event){
								var player = this.system.currentarea.player;
								if (distance2d(player.position, this.event.position) > 40){
									this.close();
								}
							}
						}.bind(this), this.fadetime);
						this.system.mouse.textboxclick = function(){
							if (this.clickready){
								if (this.textfinished) this.close(true);
								else this.showText();
							}
						}.bind(this);
						this.system.currentarea.controls = function (){
							this.onUpdate.call(this);
							if (keyboard.up("space") || keyboard.up("enter")){
								if (this.clickready){
									if (this.textfinished) this.close(true);
									else this.showText();
								}
							}
						}.bind(this);
						break;
					case 'scene':
						this.system.mouse.textboxup = this;
						this.onStart();
						if (this.text) this.text.material.opacity = 0;
						if (this.bg) this.bg.material.opacity = 0;
						if (this.face) this.face.material.opacity = 0;
						if (this.parent == 'scene') this.addTo(this.system.currentarea.graph);
						if (this.parent == 'hud') this.addTo(this.system.hud);
						this.fadein({time: this.fadetime});
						runTimeout(function(){
							this.clickready = true;
							this.onPlay.call(this);
							if (this.reader) this.onReader.call(this);
						}.bind(this), this.fadetime);
						this.system.mouse.textboxclick = function(){
							if (this.clickready){
								if (this.textfinished) this.close(true);
								else this.showText();
							}
						}.bind(this);
						this.system.currentarea.controls = function (){
							this.onUpdate.call(this);
							if (keyboard.up("space") || keyboard.up("enter")){
								if (this.clickready){
									if (this.textfinished) this.close(true);
									else this.showText();
								}
							}
						}.bind(this);
						break;
					case 'timed':
						this.system.mouse.textboxup = this;
						this.onStart();
						if (this.text) this.text.material.opacity = 0;
						if (this.bg) this.bg.material.opacity = 0;
						if (this.face) this.face.material.opacity = 0;
						if (this.parent == 'scene') this.addTo(this.system.currentarea.graph);
						if (this.parent == 'hud') this.addTo(this.system.hud);
						this.fadein({time: this.fadetime});
						runTimeout(function(){
							this.clickready = true;
							this.onPlay.call(this);
							if (this.reader) this.onReader.call(this);
							runTimeout(function(){
								this.close(true);
							}.bind(this), this.time);
						}.bind(this), this.fadetime);
						break;
					case '2choice':
						this.system.mouse.textboxup = this;
						this.onStart();
						if (this.text) this.text.material.opacity = 0;
						if (this.bg) this.bg.material.opacity = 0;
						if (this.face) this.face.material.opacity = 0;
						if (this.parent == 'scene') this.addTo(this.system.currentarea.graph);
						if (this.parent == 'hud') this.addTo(this.system.hud);
						this.fadein({time: this.fadetime});
						runTimeout(function(){
							this.clickready = true;
							this.onPlay.call(this);
							if (this.reader) this.onReader.call(this);
						}.bind(this), this.fadetime);
						this.system.mouse.textboxclick = function(){
							if (this.clickready){
								if (this.textfinished) this.close(true);
								else this.showText();
							}
						}.bind(this);
						this.system.currentarea.controls = function (){
							this.onUpdate.call(this);
							if (keyboard.up("space") || keyboard.up("enter")){
								if (this.clickready){
									if (this.textfinished) this.close(true);
									else this.showText();
								}
							}
						}.bind(this);
						break;
					case 'static':
						this.system.mouse.textboxup = this;
						this.onStart();
						if (this.text) this.text.material.opacity = 0;
						if (this.bg) this.bg.material.opacity = 0;
						if (this.face) this.face.material.opacity = 0;
						if (this.parent == 'scene') this.addTo(this.system.currentarea.graph);
						if (this.parent == 'hud') this.addTo(this.system.hud);
						this.fadein({time: this.fadetime});
						runTimeout(function(){
							this.clickready = true;
							this.onPlay.call(this);
							if (this.reader) this.onReader.call(this);
						}.bind(this), this.fadetime);
						break;
					case 'custom':
						this.onCustom.call(this);
						break;
				}
			}.bind(obj);
			obj.close = function(next){
				if (next){
					this.fadeout({time: this.fadetime});
					runTimeout(function(){
						if (this.parent == 'scene') this.removeFrom(this.system.currentarea.graph);
						if (this.parent == 'hud') this.removeFrom(this.system.hud);
						this.onComplete();
						if (this.reader){
							this.readerindex++;
							this.reader.text = '';
							this.text.setTexture(this.system.TextMaker(this.reader));
						}
						this.playing = false;
						if (this.text) this.anchor.remove(this.text.anchor);
						if (this.bg) this.anchor.remove(this.bg.anchor);
						if (this.face) this.anchor.remove(this.face.anchor);
						this.onNext();
					}.bind(this), this.fadetime);
				}
				else {
					this.fadeout({time: this.fadetime});
					runTimeout(function(){
						if (this.parent == 'scene') this.removeFrom(this.system.currentarea.graph);
						if (this.parent == 'hud') this.removeFrom(this.system.hud);
						this.onComplete();
						if (this.reader){
							this.readerindex++;
							this.reader.text = '';
							this.text.setTexture(this.system.TextMaker(this.reader));
						}
						this.playing = false;
						if (this.text) this.anchor.remove(this.text.anchor);
						if (this.bg) this.anchor.remove(this.bg.anchor);
						if (this.face) this.anchor.remove(this.face.anchor);
						this.onClose();
					}.bind(this), this.fadetime);
				}
			}.bind(obj);
			
			obj.addTo = function(parent){
				parent.add(this.anchor);
			}.bind(obj);
			
			obj.removeFrom = function(parent){
				parent.remove(this.anchor);
			}.bind(obj);
			
			return obj;

		}.bind(this);
		this.TextSequenceMaker = function(opts){
			
			var obj = {};
			
			var textboxes = opts.hasOwnProperty('textboxes') ? opts.textboxes : [];
			var event = opts.hasOwnProperty('event') ? opts.event : false;
			
			for (var i=0; i<textboxes.length; i++){
			
				if (event) textboxes[i].event = event;
				
				if (i<textboxes.length-1){
					textboxes[i].onNext = function(){
						this.play();
					}.bind(textboxes[i+1]);
				}
				
				if (i==textboxes.length-1){
					textboxes[i].onNext = function(){
						this.playing = false;
					}.bind(obj);
				}
				
				textboxes[i].onClose = function(){
					this.playing = false;
				}.bind(obj);
				
			}
			
			obj.system = this;
			obj.textboxes = textboxes;
			obj.event = event;
			obj.playing = false;
			
			obj.play = function(){
				if (this.playing) return;
				this.playing = true;
				this.textboxes[0].play();
			}
			
			return obj;
			
		}.bind(this);
		
	}
	GX2System.prototype = {
		init: function(){

		//SCENE
			this.scene = new THREE.Scene;
			
			var SCREEN_WIDTH = window.innerHeight * 2.1,
				SCREEN_HEIGHT = window.innerHeight;
			var vFOV = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
				NEAR = 0.1, FAR = this.cameradistance;
		
		//CAMERA
			this.camera = new THREE.CombinedCamera( 
				SCREEN_WIDTH, 
				SCREEN_HEIGHT, 
				vFOV, 
				NEAR, FAR, NEAR, FAR 
			);
			this.camera.zoom = 2.0;
			this.camera.clear = false;
			this.camera.clearAlpha = 0;
			this.camera.toOrthographic();
			this.camera.position.set(0,0,800);
			this.camera.rotation.set(0,0,0);
			this.scene.add(this.camera);

		//RENDERER
			this.renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
			this.renderer.setClearColor( 0x000000, 0 );
			this.renderer.shadowMapEnabled = true;
			this.renderer.shadowMapSoft = true;
			if (!this.autoClear) this.renderer.autoClear = !1;
			this.renderer.autoClearStencil = !1;
			
			this.screendimensionx = this.screendimensiony = 1.0;
			this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
			this.container.appendChild( this.renderer.domElement );    			
			
		//SCENE EVENTS
			if (this.canfullscreen) 
				THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });      
			
		//AUXILERIES
			this.mouse = new MouseControls({
				container: this.container, 
				camera: this.camera,
				system: this
			});
			this.mouse.responsive = true;
			
			this.initHud();
			this.initPhysics();
			this.initDeviceMotions();
			
			this.effects = new Effects({system: this});
			this.effects.updating = true;
			this.effects.shaderSpeed = 0.1;	

			this.blackout = new Picture({filename: this.attachpath+'/resources/system/blackpixel.gif', width: 100680,
							height: 100520, position: new Vec3( 0,0,699.2 ), opacity: 1.0,
							onLoad: function(system){this.addTo(system.scene);}.bindArgs(this)});
			this.pauseout = new Picture({filename: this.attachpath+'/resources/system/blackpixel.gif', width: 100680,
							height: 100520, position: new Vec3( 0,0,699.1 ), opacity: 0.0,
							onLoad: function(system){this.addTo(system.scene);}.bindArgs(this)});
			this.whiteout = new Picture({filename: this.attachpath+'/resources/system/whitepixel.gif', width: 100680,
							height: 100520, position: new Vec3( 0,0,699 ), opacity: 0.0,
							onLoad: function(system){this.addTo(system.scene);}.bindArgs(this)});
			this.redout = new Picture({filename: this.attachpath+'/resources/system/redpixel.gif', width: 100680,
							height: 100520, position: new Vec3( 0,0,699 ), opacity: 0.0,
							onLoad: function(system){this.addTo(system.scene);}.bindArgs(this)});
			this.greenout = new Picture({filename: this.attachpath+'/resources/system/greenpixel.gif', width: 100680,
							height: 100520, position: new Vec3( 0,0,699 ), opacity: 0.0,
							onLoad: function(system){this.addTo(system.scene);}.bindArgs(this)});
			this.blueout = new Picture({filename: this.attachpath+'/resources/system/bluepixel.gif', width: 100680,
							height: 100520, position: new Vec3( 0,0,699 ), opacity: 0.0,
							onLoad: function(system){this.addTo(system.scene);}.bindArgs(this)});
			this.nopic = this.nopicture = new Picture({filename: this.attachpath+'/resources/system/blank.png', width: 1,
							height: 1, position: new Vec3( 0,0,699 ), opacity: 0.0,
							onLoad: function(){	}});
			this.standardtextbox = new Picture({filename: this.attachpath+'/resources/images/sprites/standardtextbox01.png',
							scale: 7.5, position: new Vec3( 0,160,702 ), opacity: 0.0,
							onLoad: function(system){this.addTo(system.hud);}.bindArgs(this)});
			this.standardshadow = new Picture({filename: this.attachpath+'/resources/images/sprites/shadow.png',
							scale: 1, position: new Vec3( 0,0,0 ), opacity: 1.0,
							onLoad: function(){}, antialiased: false});
			
			this.ambient = new THREE.AmbientLight( 0xffffff );
				this.scene.add( this.ambient );
			this.light1 = new THREE.PointLight( 0xffffff );
				this.scene.add( this.light1 ); 		
			   
		//PAUSING
			if (this.pauseonblur){

				window.onblur = function(){
					this.pause();
				}.bind(this);
				
				window.onmouseout = function(){
					this.mouse.mouseup();
				}.bind(this);
				
				window.onfocus = function(){
					this.unpause();
				}.bind(this);
				
			}
			
		//MOUSE OUT OF WINDOW
			addEvent(document, "mouseout", function(e) {
				e = e ? e : window.event;
				var from = e.relatedTarget || e.toElement;
				if (!from || from.nodeName == "HTML") {
					//drop analog
					if (this.mouse){
						this.mouse.dragged = false;
						this.mouse.selected = false;
						if (this.analog && this.analog.dragrelease)
							this.analog.dragrelease();
					}
				}
			}.bind(this));
			
			systems.push(this);
			
			this.loaded = true;
			this.startGame();
		
		},
		saveAreas: function(){
			localstorage['areasinmemory'] = 
				JSON.stringify(this.areasinmemory, function(key, value){
					if (key == 'system' ||
						key == 'container' ||
						key == 'canvas') {return null;}
					else {return value;}
				});
		},
		pause: function(){
		
			//this.pauseout.material.opacity = 1.0;
			this.container.style.opacity = 0.5;
			
			this.paused = true;
			TWEEN.pauseAll();
			this.updating = false;
			
			clock.stop();
			
			window.blurred = true;
			window.onblur = ''; // remove the event to stop an infinite loop
			window.onfocus = this.unpause.bind(this);
			
			this.mouse.mouseup();  //change to be mouse out
			if (this.music) this.music.pause();
			
			if (this.currentarea)
				for (var i=0; i < this.currentarea.sounds.length; i++){
					if (this.currentarea.sounds[i].playing){
						this.currentarea.sounds[i].pause();
						this.currentarea.sounds[i]._syspause = true;
					}
				}
			
		},
		unpause: function(){
		
			this.paused = false;
			TWEEN.resumeAll();
			//this.startUpdating();
			this.updating = true;
			//this.animate();
			
			clock.start();
			
			window.blurred = false;
			window.onfocus = '';
			window.onblur = this.pause.bind(this);
			
			//this.pauseout.material.opacity = 0.0;
			this.container.style.opacity = 1.0;
			
			this.mouse.mouseup();
			if (this.music) this.music.play();
			
			if (this.currentarea)
				for (var i=0; i < this.currentarea.sounds.length; i++){
					if (this.currentarea.sounds[i]._syspause){
						if (this.currentarea.sounds[i].unpause) 
							this.currentarea.sounds[i].unpause();
						else this.currentarea.sounds[i].play();
					}
				}
			
		},
		movecam: function(opts){
			opts.object = this.camera.position;
			tween(opts).start();
		},
		startGame: function(){
			var initialInterval = runInterval(function(){
			
				if (this.loadbar && this.loadtext)
					if (this.loadbar.loaded && this.loadtext.loaded){
					
						console.log('startgraphics...');
					
						var firstarea = this.createArea(this.firstarea);
						this.loadingareas.push(firstarea);   
						this.loadArea(this.firstarea);     
						
						clearInterval(initialInterval);
						this.startUpdating();
						
					}
			}.bind(this), 0.300);
		},
		toOrtho: function(){
			this.cameramode = 'ortho';
			this.camera.toOrthographic();
		},
		toPersp: function(){
			this.cameramode = 'persp';
			this.camera.toPerspective();
		},
		flipScreenMode: function(){
			if (this.screenmode === 'ratio') this.screenmode = 'full';
			else this.screenmode = 'ratio';
			window.onresize();
		},
		getHeightRatio: function(){
			return parseFloat(this.container.offsetHeight);
		},
		getWidthRatio: function(){
			if (this.screenmode === 'ratio')
				return parseFloat(this.container.offsetHeight) * 2.1; 
			else if (this.screenmode === 'full') 
				return parseFloat(this.container.clientWidth*this.widthratio); 
		},
		startUpdating: function(){
			this.updating = true;
			this.animate();
			
		},
		stopUpdating: function(){
			this.updating = false;
		},
		animate: function(){
			
			if (this.updating){
				this.render();		
				this.update();
				if (this.tweenupdating) TWEEN.update();
			}
			
			requestAnimationFrame(this.animate.bind(this));
			
		},
		render: function(){
		
			if (this.autoClear){
			
				if (this.container.style.display == 'none') return;
			
				if (this.cameramode === 'persp') 
					this.camera.toPerspective();
				
				this.hud.position.z = this.onscreen;
				
				if (this.effects && this.effects.updating) 
					this.effects.update(this.delta);
				
				this.renderer.clear(0,1,1);	
				this.camera.toOrthographic();	
				this.hud.position.z = this.offscreen;
				
				if (this.currentarea) 
					this.currentarea.graph.position.z = this.onscreen;
					
				this.renderer.render( this.scene, this.camera );
				
				if (this.currentarea) 
					this.currentarea.graph.position.z = this.offscreen;
		
			}
			else {
		
				if (this.container.style.display == 'none') return;
			
				if (this.cameramode === 'persp') 
					this.camera.toPerspective();
				
				this.hud.position.z = this.offscreen;
				if (this.currentarea) this.currentarea.graph.position.z = this.onscreen;
				
				if (this.effects && this.effects.updating) 
					this.effects.update(this.delta);
				else this.renderer.render( this.scene, this.camera );
				
				this.renderer.clear(0,1,1);	
				this.camera.toOrthographic();	
				
				this.hud.position.z = this.onscreen;
				if (this.currentarea) this.currentarea.graph.position.z = this.offscreen;
					
				if (this.effects && this.effects.updating &&
						this.effects.updatinghud) 
					this.effects.update(this.delta);
				else this.renderer.render( this.scene, this.camera );
				
				if (this.currentarea) 
					this.currentarea.graph.position.z = this.graphbackwardpoint;
				
			}

		},
		orderEvents: function(){
			
			for (var i = 0; i < this.currentarea.pictures.length; i++){
				this.zcoordarray.push(this.currentarea.pictures[i].position.y
							  + this.currentarea.pictures[i].pictureoffset.y
							  + this.currentarea.pictures[i].zoffset.y); //negative?
			}
			for (var i = 0; i < this.currentarea.models.length; i++){
				this.zcoordarray.push(this.currentarea.models[i].position.y
							  + this.currentarea.models[i].zoffset.y); //negative?
			}
			this.zcoordarray.sort(function(a,b){return a-b});
			var newzcoord = 10;
			for (var i = 0; i < this.zcoordarray.length; i++) {
				for (var j = 0; j < this.currentarea.pictures.length; j++) {
					if ((this.zcoordarray[i] == this.currentarea.pictures[j].position.y
							+ this.currentarea.pictures[j].pictureoffset.y
							+ this.currentarea.pictures[j].zoffset.y) &&
								this.currentarea.pictures[j].zupdating){
						this.currentarea.pictures[j].setPosition({'z': newzcoord});
						newzcoord -= 0.001;                  
					}
				}
				for (var j = 0; j < this.currentarea.models.length; j++) {
					if ((this.zcoordarray[i] == this.currentarea.models[j].position.y
							+ this.currentarea.models[j].zoffset.y) &&
								this.currentarea.models[j].zupdating){
						this.currentarea.models[j].position.z = newzcoord;
						newzcoord -= 0.001;                  
					}
				}
			}
			this.zcoordarray = [];  
		},
		loadArea: function(name){
			
			var newarea = false;
			
			console.log('loadarea...');
			this.world.bodies = [];
			this.pstepping = false;

			for (var i=0; i < this.areasinmemory.length; i++){
				if (this.areasinmemory[i] && 
					this.areasinmemory[i].name == name){
					
					this.currentarea = this.areasinmemory[i];
					this.currentarea.init();
					
					return;
					
				}
			}
			
			for (var i=0; i<this.loadingareas.length; i++){
				if (this.loadingareas[i].name == name){
					newarea = this.loadingareas[i];
				}
			}
			
			if (!newarea){
				newarea = this.createArea(name); 
				this.loadingareas.push(newarea);   
				this.loadArea(name);
			}

			runTimeout(function(area){
								
				if (this.checkIfAreaLoaded(area)) {  //game area done loading - - >
					area.loaded = true;
					removeFromArray(this.loadingareas, area);
					this.areasinmemory.push(area);
					this.currentarea = area;
					this.currentarea.init();
				} 
				else{
				
					this.loadtext.fadein();
					this.loadbar.fadein();
					this.loadbar.mesh.scale.x = 1;
					
					runTimeout(function(area){
						this.loadinginterval = runInterval(function (area){  
							//repeat until done loading
							//console.log('.load');
																		
							if (this.checkIfAreaLoaded(area)) {  //game area done loading - - >

								area.loaded = true;
								this.currentarea = area;
								removeFromArray(this.loadingareas, area);
								this.areasinmemory.push(area);

								this.loadtext.fadeout();
								this.loadbar.fadeout();

								runTimeout(function (){
									this.currentarea.init();
								}.bind(this), 1);

								clearInterval(this.loadinginterval);                    
												
							}
						}.bind(this), 0.8, area);
					}.bind(this), 1, area);
				}     											
			}.bind(this), 0.9, newarea);
			
		},
		preloadArea: function(name){
			
			var newarea = false;
			
			for (var i=0; i<this.loadingareas.length; i++){
				if (this.loadingareas[i].name === name){
					newarea = this.loadingareas[i];
				}
			}
			
			if (!newarea){
				newarea = this.createArea(name); 
				this.loadingareas.push(newarea);   
			}
			
			console.log('preload: ', newarea);

			runTimeout(function(area){
								
				if (this.checkIfAreaLoaded(area)){ 
					area.loaded = true;
					removeFromArray(this.loadingareas, area);
					this.areasinmemory.push(area);
				} 
				else {
					
					runTimeout(function(area){
						var loadinginterval = runInterval(function (area){										
							if (this.checkIfAreaLoaded(area)){

								area.loaded = true;
								removeFromArray(this.loadingareas, area);
								this.areasinmemory.push(area);

								clearInterval(loadinginterval);                    
												
							}
						}.bind(this), 0.8, area);
					}.bind(this), 1, area);
				}     											
			}.bind(this), 0.9, newarea);
			
		},
		checkIfAreaLoaded: function(area){
			var itemsloadedcount = 0;
			var totalitems = 0;

			for (var j = 0; j < area.pictures.length; j++) {
				if (area.pictures[j].loaded) itemsloadedcount += 1;
			}
			for (var j = 0; j < area.imagebuffers.length; j++) {
				if (area.imagebuffers[j].picture.loaded) itemsloadedcount += 1;
			}
			for (var j = 0; j < area.sounds.length; j++) {
				if (area.sounds[j].loaded) itemsloadedcount += 1;
			}
			for (var j = 0; j < area.models.length; j++) {
				if (area.models[j].loaded) itemsloadedcount += 1;
			}
			if (area.map.collisionmap) {
				totalitems++;
				if (area.map.collisionmap.loaded) itemsloadedcount++;
			}
			totalitems += area.pictures.length + area.sounds.length
						+ area.models.length + area.imagebuffers.length;
						
			this.loadbar.mesh.scale.x = (itemsloadedcount/totalitems)*3000;
			
			if (totalitems == itemsloadedcount) return true;
			else return false;
		},
		initDeviceMotions: function(){  
			
			this.device = {};
		  
			if (window.DeviceOrientationEvent){
				window.addEventListener('deviceorientation', function(eventData) {
					// gamma is the left-to-right tilt in degrees, where right is positive
					this.device.tiltLR = eventData.gamma;
					// beta is the front-to-back tilt in degrees, where front is positive
					this.device.tiltFB = eventData.beta;    
					// alpha is the compass direction the device is facing in degrees
					this.device.dir = eventData.alpha; 
					// deviceorientation does not provide this data
					this.device.motUD = null;    
					// call our orientation event handler
					//deviceOrientationHandler(tiltLR, tiltFB, dir, motUD);
				}.bind(this), false);
			} else if (window.OrientationEvent) {
				window.addEventListener('MozOrientation', function(eventData) {
					// x is the left-to-right tilt from -1 to +1, so we need to convert to degrees
					this.device.tiltLR = eventData.x * 90;
					// y is the front-to-back tilt from -1 to +1, so we need to convert to degrees
					// We also need to invert the value so tilting the device towards us (forward) 
					// results in a positive value. 
					this.device.tiltFB = eventData.y * -90;
					// MozOrientation does not provide this data
					this.device.dir = null;
					// z is the vertical acceleration of the device
					this.device.motUD = eventData.z;
					// call our orientation event handler
					//deviceOrientationHandler(tiltLR, tiltFB, dir, motUD);
				}.bind(this), false);
			} else {
				console.log("Device orientation not supported on your device or browser.");
			}
			var deviceMotionHandler = function(eventData) {
				// Grab the acceleration including gravity from the results
				this.device.acceleration = eventData.accelerationIncludingGravity;

				// Display the raw acceleration data
				//var rawAcceleration = "[" +  Math.round(acceleration.x) + ", " + 
					//Math.round(acceleration.y) + ", " + Math.round(acceleration.z) + "]";
				// Z is the acceleration in the Z axis, and if the device is facing up or down
				var facingUp = -1;
				if (this.device.acceleration.z > 0) {
					facingUp = +1;
				}
				// Convert the value from acceleration to degrees acceleration.x|y is the 
				// acceleration according to gravity, we'll assume we're on Earth and divide 
				// by 9.81 (earth gravity) to get a percentage value, and then multiply that 
				// by 90 to convert to degrees.                                
				this.device.tiltLR = Math.round(((this.device.acceleration.x) / 9.81) * -90);
				this.device.tiltFB = Math.round(((this.device.acceleration.y + 9.81) / 9.81) * 90 * facingUp);
			   
			}.bind(this); 
			if (window.DeviceMotionEvent) {
				window.addEventListener('devicemotion', deviceMotionHandler, false);
			} else {
				console.log("Device motion not supported on your device or browser.");
			}  
			
		},
		update: function(){
		
			if (this.container.style.display == 'none') return;
		  
			var delta = this.delta = clock.getDelta();
			if (this.framecounter == 100000) this.framecounter = 1;
			else this.framecounter++;
			
			if (this.currentarea && this.pstepping){
			
				//this.physicsGraveyard(); 

				if (this.currentarea.pictures) for (var i = 0; i < this.currentarea.pictures.length; i++) {
					if (this.currentarea.pictures[i].physicsupdating){
						this.currentarea.pictures[i].set_p0();
					}
				}
				
				if (this.currentarea.jellies) for (var i = 0; i < this.currentarea.jellies.length; i++) {
					if (this.currentarea.jellies[i].meshupdating){
						for (var j=0; j<this.currentarea.jellies[i].particles.length; j++){
							this.currentarea.jellies[i].particles[j].set_p0();
						}
					}
				}
				
				
				now = Date.now() / 1000;
				timeSinceLastCall = now-lastCallTime;
				lastCallTime = now;
				//world.step(1/60, timeSinceLastCall, maxSubSteps);
				this.world.step(1/60, 1/60, maxSubSteps);
				//physicsworker.postMessage(world.toJSON());
				

				if (this.currentarea.pictures) for (var i = 0; i < this.currentarea.pictures.length; i++) {
					if (this.currentarea.pictures[i].physicsupdating){
						this.currentarea.pictures[i].set_p1();
					}
				}
				
				if (this.currentarea.jellies) for (var i = 0; i < this.currentarea.jellies.length; i++) {
					for (var j=0; j<this.currentarea.jellies[i].particles.length; j++){
						this.currentarea.jellies[i].particles[j].set_p1();
					}
				}
			}
		   
			if (this.currentarea){
			
				if (this.currentarea.controls) this.currentarea.controls();

				if (this.currentarea.pictures !== null){
					for (var i = 0; i < this.currentarea.pictures.length; i++) {
						if (this.currentarea.pictures[i].updating)
							this.currentarea.pictures[i].update(delta);
						if (this.currentarea.pictures[i].animating) 
							this.currentarea.pictures[i].animate(1000 * delta);
						if (this.currentarea.pictures[i].controls)
							if (this.currentarea.pictures[i].controlsresponsive)
								this.currentarea.pictures[i].controls();
						if (this.switchedarea){
							this.switchedarea = false;
							return;
						}
						if (this.pstepping && this.currentarea.pictures[i].physicsupdating) 
						  this.currentarea.pictures[i].updatePhysics();
						if (this.currentarea.pictures[i].shadowupdating &&
							this.currentarea.pictures[i].shadowupdate)
							this.currentarea.pictures[i].shadowupdate(); 
					}
				}
				
				if (this.currentarea.models){
					for (var i = 0; i < this.currentarea.models.length; i++) {
						if (this.currentarea.models[i].updating){
							  this.currentarea.models[i].update(delta*1000);
						}
						if (this.currentarea.models[i].controls)
						if (this.currentarea.models[i].controlsresponsive)
							this.currentarea.models[i].controls();
						if (this.currentarea.models[i].meshupdate && this.currentarea.models[i].meshupdating){
							  this.currentarea.models[i].meshupdate(delta*1000);
						}
					}
				}
				
				if (this.currentarea.sprites !== null){
					for (var i = 0; i < this.currentarea.sprites.length; i++) {
						if (this.currentarea.sprites[i].updating) this.currentarea.sprites[i].update(delta);
						if (this.currentarea.sprites[i].animating) 
							  this.currentarea.sprites[i].animate(1000 * delta);
						if (this.currentarea.sprites[i].controls)
						if (this.currentarea.sprites[i].controlsresponsive)
							this.currentarea.sprites[i].controls(); 
					}
				}

				if (this.currentarea.textboxes) {
					for (var i = 0; i < this.currentarea.textboxes.length; i++) {
						if (this.currentarea.textboxes[i].updating){
							  this.currentarea.textboxes[i].update(delta*1000);
						}
						if (this.currentarea.textboxes[i].controls)
						if (this.currentarea.textboxes[i].controlsresponsive)
							this.currentarea.textboxes[i].controls();
					}		 
				}
				
				if (this.currentarea.sounds) {
					for (var i = 0; i < this.currentarea.sounds.length; i++) {
						if (this.currentarea.sounds[i].visualizer){
							  this.currentarea.sounds[i].visualizer.update(
								this.currentarea.sounds[i], delta*1000);
						}
					}		 
				}

				if (this.currentarea.particlesystems){
					for (var i = 0; i < this.currentarea.particlesystems.length; i++) {
						this.currentarea.particlesystems[i].particlezoomscale = 1/this.hud.scale.x;
						for (var j = 0; j < this.currentarea.particlesystems[i].particleGroup.emitters[0].attributes.size.value.length; j++) {
							this.currentarea.particlesystems[i].particleGroup.emitters[0].attributes.size.value[j] = 
								this.currentarea.particlesystems[i].particleGroup.emitters[0].attributes.originalsize.value[j] *
								this.currentarea.particlesystems[i].particlewindowscale * 
								this.currentarea.particlesystems[i].particlezoomscale;
							this.currentarea.particlesystems[i].particleGroup.emitters[0].attributes.sizeEnd.value[j] = 
								this.currentarea.particlesystems[i].particleGroup.emitters[0].attributes.originalsizeEnd.value[j] *
								this.currentarea.particlesystems[i].particlewindowscale * 
								this.currentarea.particlesystems[i].particlezoomscale;	
							//todo: sizeEND
							//currentarea.particlesystems[i].particleGroup.emitters[0].attributes.size.needsUpdate = true;
						}
						//currentarea.particlesystems[i].particlewindowscale = temph/1600;
						this.currentarea.particlesystems[i].particleGroup.emitters[0].attributes.size.needsUpdate = true;
						this.currentarea.particlesystems[i].particleGroup.emitters[0].attributes.sizeEnd.needsUpdate = true;
					}
					for (var i = 0; i < this.currentarea.particlesystems.length; i++) {
						if (this.currentarea.particlesystems[i].updating) 
							this.currentarea.particlesystems[i].update(delta);
						//add controls
					}
				}
				
				this.orderEvents();

			}
			
			if (this.debug_on) this.debugupdate();
			
			if (this.camera && this.camera.update) this.camera.update(this);
		  
			keyboard.resetBoard();
			
			this.hud.position.x = this.camera.position.x;
			this.hud.position.y = this.camera.position.y;
			this.hud.analogposition.x = this.hud.analogoffset.x + this.camera.position.x;	
			this.hud.analogposition.y = this.hud.analogoffset.y + this.camera.position.y;	
			
		},
		initPhysics: function(){

			this.world = new p2.World({
				//doProfiling:true,                    // Enable stats
				gravity : [0, 0],                      // Set gravity
				broadphase : new p2.SAPBroadphase()    // Broadphase algorithm
			});
			up = [0,1];

			this.world.defaultFriction = 50;
			this.world.solver.iterations = 5;
			this.world.solver.stiffness = 1e4;
			this.world.solver.relaxation = 4;
			
			//collisions:
			//world.on("impact",function(evt){
				/*test.ok( evt.shapeA.id == shapeA.id || evt.shapeA.id == shapeB.id );
				test.ok( evt.shapeB.id == shapeA.id || evt.shapeB.id == shapeB.id );
				test.ok( evt.bodyA.id == bodyA.id || evt.bodyA.id == bodyB.id );
				test.ok( evt.bodyB.id == bodyA.id || evt.bodyB.id == bodyB.id );
				beginContactHits++;*/
				//console.log('beginCollision: shapes: ', evt.shapeA, evt.shapeB);
				//console.log('beginCollision: bodies: ', evt.bodyA, evt.bodyB);
			//});
			this.world.on("beginContact", function(evt){
				if (evt.bodyA.parentobj)
					evt.bodyA.parentobj.collisionStart(evt);
				if (evt.bodyB.parentobj)
					evt.bodyB.parentobj.collisionStart(evt);
			});
			this.world.on("endContact", function(evt){
				if (evt.bodyA.parentobj)
					evt.bodyA.parentobj.collisionEnd(evt);
				if (evt.bodyB.parentobj)
					evt.bodyB.parentobj.collisionEnd(evt);
			});
			this.world.on("postStep", function(evt){
                for (var i=0; i<this.world.constraints.length; i++){
                    var c = this.world.constraints[i];
                    var eqs = c.equations;
					if (c._breaklimit)
						if (Math.abs(eqs[0].multiplier) > c._breaklimit){
							this.world.removeConstraint(c);
						}
                }
				for (var i=0; i<this.world.springs.length; i++){
					var s = this.world.springs[i];
					var pA = s.bodyA.position;
					var pB = s.bodyB.position;
					var dist = 100*distance2d({x: pA[0], y: pA[1]}, {x: pB[0], y: pB[1]});
					if (s._breaklimit)
						if (dist > s._breaklimit){
							this.world.removeSpring(s);
						}
                }
            }.bind(this));
		
		},
		initHud: function(){
		
			this.hud.controlsvisible = true;
			this.hud.position.x = this.camera.position.x;
			this.hud.position.y = this.camera.position.y;
			this.hud.mousescale = 1.0;
			this.hud.analogposition = new THREE.Vector3(-1100,-1100,701.1);
			this.hud.analogoffset = new THREE.Vector3(-1100,-1100,701.1);
			//this.border = new Model({filename: 'models/screen640x480.js', 
				//material: new THREE.MeshBasicMaterial({color: 0x000000}),
				//name: 'screen', onLoad: function(){
					/*game.border.addTo(game.hud);
					game.border.mesh.scale.set(6200,6200,5000);
					game.border.mesh.rotation.set(pi,pi,0);
					game.border.mesh.position.set(0,0,700);
					mainmouse.addClickable(game.border);*/	
				//}}); 
			this.borderleft = new Picture({filename: this.attachpath+'/resources/system/blackpixel.gif', 
				position: new THREE.Vector3(0,0,0), width: 4500, height: 4500,
				name: 'screen', onLoad: function(system){
					this.addTo(system.hud);
					this.system = system;
					this.mesh.position.set(-4700,0,700);
					system.mouse.addClickable(this);
					if (!this.system.sideborder) this.material.visible = false;
			}.bindArgs(this)}); 
			this.borderright = new Picture({filename: this.attachpath+'/resources/system/blackpixel.gif', 
				position: new THREE.Vector3(0,0,0), width: 4500, height: 4500,
				name: 'screen', onLoad: function(system){
					this.addTo(system.hud);
					this.system = system;
					this.mesh.position.set(4700,0,700);
					system.mouse.addClickable(this);
					if (!this.system.sideborder) this.material.visible = false;					
			}.bindArgs(this)}); 
			this.hud.add(this.loadscreen);
			this.loadtext = new Picture({filename: this.attachpath+'/resources/system/loadtext.png', scale: 3,
				position: new THREE.Vector3(0,180,0), antialiased: true, opacity: 0,
				name: 'loadtext', transparent: true, sprite: false,
				onLoad: function(system){
					this.addTo(system.hud);
					this.system = system;
					this.position.z = 701;
				}.bindArgs(this)
			});
			this.loadbar = new Picture({filename: this.attachpath+'/resources/system/whitepixel.gif', scale: 1,
				position: new THREE.Vector3(0,-150,0), antialiased: true, opacity: 0,
				name: 'loadbar', transparent: true, sprite: false,
				onLoad: function(system){
					this.addTo(system.hud);
					this.system = system;
					this.position.z = 701;
					this.mesh.scale.y = 30;
				}.bindArgs(this)
			});
			this.hud.disableButtons = function(system){
				system.responsive = game.abutton = 
				system.bbutton = game.startbutton = false;
			}.bindArgs(this);
			this.hud.enableButtons = function(){
				system.responsive = game.abutton = 
				system.bbutton = game.startbutton = true;
			}.bindArgs(this);
			
			this.analog = new Picture({filename: this.attachpath+'/resources/system/rcircle.png', scale: 3,
				position: this.hud.analogposition.clone().sub(this.hud.position), antialiased: true, opacity: 0,
				name: 'analog', transparent: true, sprite: false, animatorframes: [2,1,2,350], blending: 'add',
				onLoad: function(system){
					this.addTo(system.hud);
					this.system = system;
					this.down = false;
					this.responsive = true;
					this.repositioning = false;
					this.direction = 'c';
					this.directionvector = new THREE.Vector3(0,0,0);
					this.material.opacity = 0;
					this.material.visible = false;
					//mainmouse.addHudClickable(this);
					this.analog = noop;
					this.dragging = function(mousex, mousey, screenx, screeny, system){
						this.down = true;
						this.toframe(2);
						if (undef(system)) var system = this.system;
						if (!this.repositioning){
							var mousepoint = new Vec3((mousex/system.hud.scale.x)-system.hud.position.x/system.hud.scale.x,
								(mousey/system.hud.scale.y)-system.hud.position.y/system.hud.scale.y, 0);
							var distance = distance2d(system.hud.analogposition.clone().sub(system.hud.position), mousepoint);

							var vector = mousepoint.sub(system.hud.analogposition.clone().sub(system.hud.position));
							this.direction = getDirectionFromVector(vector);
							var unitvector = new Vec3(vector.x/distance, vector.y/distance, 0);
							if (distance > 250) distance = 250;
							unitvector.x *= distance; unitvector.y *= distance;
							this.directionvector = unitvector.clone();
							this.position.x = ((unitvector.x+system.hud.analogposition.x)) - 
								system.hud.position.x;
							this.position.y = ((unitvector.y+system.hud.analogposition.y)) - 
								system.hud.position.y;
							if (this.responsive) this.analog();
						}	
						else{
							var mousepoint = new Vec3((mousex/system.hud.scale.x),//-game.hud.position.x/game.hud.scale.x,
								(mousey/system.hud.scale.y), 0);//-game.hud.position.y/game.hud.scale.y, 0);
							this.position.x = system.hud.analogoffset.x = system.joyarrows.position.x = mousepoint.x + -system.camera.position.x;
							this.position.y = system.hud.analogoffset.y = system.joyarrows.position.y = mousepoint.y + -system.camera.position.y;
						}
					};
					this.dragrelease = function(sys){
						this.down = false;
						this.toframe(1);
						this.direction = 'c';
						this.directionvector.set(0,0,0);
						if (!this.repositioning){
							this.stopMoving();
							this.moveTo({
								to: {
									x: sys.hud.analogposition.clone().sub(sys.hud.position).x,
									y: sys.hud.analogposition.clone().sub(sys.hud.position).y
								},
								time: 0.5, ease: TWEEN.Easing.Elastic.Out});
						}
					}.bindArgs(system);
					this.draggable = true;
					this.click = function(){
						this.down = true;
						this.toframe(2);
					};
				}.bindArgs(this)
			});
			
			this.joyarrows = new Picture({filename: this.attachpath+'/resources/system/joyarrows.png', scale: 3,
				position: this.hud.analogposition.clone().sub(this.hud.position), antialiased: true, opacity: 0,
				name: 'joyarrows', transparent: true, sprite: false,
				onLoad: function(system){
					this.addTo(system.hud);
					this.system = system;
					this.position.z = 701;
					this.material.opacity = 0;
					this.material.visible = false;
				}.bindArgs(this)
			});
			
			this.abutton = new Picture({filename: this.attachpath+'/resources/system/gcircle.png', scale: 2.5,
				position: new THREE.Vector3(950,-1100,0), antialiased: true, opacity: 0,
				name: 'abutton', transparent: true, sprite: false, animatorframes: [2,1,2,350], blending: 'add',
				onLoad: function(system){
					this.addTo(system.hud);
					this.system = system;
					this.position.z = 701;
					this.down = false;
					this.responsive = false;
					this.material.opacity = 0;
					this.material.visible = false;
					//mainmouse.addHudClickable(this);
					this.click = function(){
						this.down = true;
						this.toframe(2);
						if (this.responsive) this.abutton();
					}
					this.hoverout = this.clickup = function(){
						this.down = false;
						this.toframe(1);
					}
					this.abutton = noop;
					//this.draggable = true;
				}.bindArgs(this)
			});
			
			this.bbutton = new Picture({filename: this.attachpath+'/resources/system/ccircle.png', scale: 2.5,
				position: new THREE.Vector3(1400,-1250,0), antialiased: true, opacity: 0,
				name: 'bbutton', transparent: true, sprite: false, animatorframes: [2,1,2,350], blending: 'add',
				onLoad: function(system){
					this.addTo(system.hud);
					this.system = system;
					this.position.z = 701;
					this.down = false;
					this.responsive = false;
					this.material.opacity = 0;
					this.material.visible = false;
					//mainmouse.addHudClickable(this);
					this.click = function(){
						this.down = true;
						this.toframe(2);
						if (this.responsive) this.bbutton();
					}
					this.hoverout = this.clickup = function(){
						this.down = false;
						this.toframe(1);
					}
					this.bbutton = noop;
				}.bindArgs(this)
			});
			
			this.startbutton = new Picture({filename: this.attachpath+'/resources/system/startbutton.png', scale: 1.0,
				position: new THREE.Vector3(220,-1400,0), antialiased: true, opacity: 0,
				name: 'startbutton', transparent: true, sprite: false, animatorframes: [2,1,2,350], blending: 'add',
				onLoad: function(system){
					this.addTo(system.hud);
					this.system = system;
					this.position.z = 701;
					this.down = false;
					this.material.opacity = 0;
					this.material.visible = false;
					//mainmouse.addHudClickable(this);
					this.responsive = true;
					this.click = function(sys){
						if (this.responsive){
							this.toframe(2);
							if (sys.menufading === false){
								if (sys.menuopen){
									if (sys.hud.repositioning) sys.menureposition.click();
									sys.menufading = true;
									sys.submenu1fading = true;
									sys.menumenu.fadeout({time: 0.25, onComplete: function(){
										this.menucontrols.material.visible = false;
										this.mouse.removeHudClickable(this.menucontrols);
										this.menufullscreen.material.visible = false;
										this.mouse.removeHudClickable(this.menufullscreen);
										this.menuvisible.material.visible = false;
										this.mouse.removeHudClickable(this.menuvisible);
										this.menureposition.material.visible = false;
										this.mouse.removeHudClickable(this.menureposition);
										this.menuopen = false;
										this.submenu1open = false;
										this.menufading = false;
										this.submenu1fading = false;
									}.bind(sys)});
									sys.menucontrols.fadeout({time: 0.25});
									sys.menufullscreen.fadeout({time: 0.25});
									sys.menuvisible.fadeout({time: 0.25});
									sys.menureposition.fadeout({time: 0.25});
								}
								else {
									sys.menufading = true;
									sys.menumenu.material.visible = true;
									sys.menucontrols.material.visible = true;
									sys.mouse.addHudClickable(sys.menucontrols);
									sys.menufullscreen.material.visible = true;
									sys.mouse.addHudClickable(sys.menufullscreen);
									
									sys.menumenu.fadein({time: 0.25, onComplete: function(){
										this.menuopen = true;
										this.menufading = false;
									}.bind(sys)});
									sys.menucontrols.fadein({time: 0.25});
									sys.menufullscreen.fadein({time: 0.25});
									
								}
							}
						}
						else this.toframe(2);
					}.bindArgs(system)
					this.hoverout = this.clickup = function(){
						this.toframe(1);
					}
				}.bindArgs(this)
			});
			
			this.selectbutton = new Picture({filename: this.attachpath+'/resources/system/selectbutton.png', scale: 1.0,
				position: new THREE.Vector3(-220,-1400,0), antialiased: true, opacity: 0,
				name: 'selectbutton', transparent: true, sprite: false, animatorframes: [2,1,2,350], blending: 'add',
				onLoad: function(system){
					this.addTo(system.hud);
					this.system = system;
					this.position.z = 701;
					this.down = false;
					this.material.opacity = 0;
					this.material.visible = false;
					//mainmouse.addHudClickable(this);
					this.click = function(){
						this.toframe(2);
					}
					this.hoverout = this.clickup = function(){
						this.toframe(1);
					}
				}.bindArgs(this)
			});
			
			this.menubutton = new Picture({filename: this.attachpath+'/resources/system/wcircle.png', scale: 1.0,
				position: new THREE.Vector3(0,-1500,0), antialiased: true, opacity: 0,
				name: 'menubutton', transparent: true, sprite: false, animatorframes: [2,1,2,350], blending: 'add',
				onLoad: function(system){
					this.addTo(system.hud);
					this.system = system;
					this.position.z = 701;
					this.down = false;
					this.responsive = true;
					this.material.visible = false;
					//mainmouse.addHudClickable(this);
					this.click = function(sys){
						this.toframe(2);
						if (this.responsive){
							//this.toframe(2);
							if (sys.menufading === false){
								if (sys.menuopen){
									if (sys.hud.repositioning) sys.menureposition.click();
									sys.menufading = true;
									sys.submenu1fading = true;
									sys.menumenu.fadeout({time: 0.25, onComplete: function(){
										this.menucontrols.material.visible = false;
										this.mouse.removeHudClickable(this.menucontrols);
										this.menufullscreen.material.visible = false;
										this.mouse.removeHudClickable(this.menufullscreen);
										this.menuvisible.material.visible = false;
										this.mouse.removeHudClickable(this.menuvisible);
										this.menureposition.material.visible = false;
										this.mouse.removeHudClickable(this.menureposition);
										this.menuopen = false;
										this.submenu1open = false;
										this.menufading = false;
										this.submenu1fading = false;
									}.bind(sys)});
									sys.menucontrols.fadeout({time: 0.25});
									sys.menufullscreen.fadeout({time: 0.25});
									sys.menuvisible.fadeout({time: 0.25});
									sys.menureposition.fadeout({time: 0.25});
								}
								else{
									sys.menufading = true;
									sys.menumenu.material.visible = true;
									sys.menucontrols.material.visible = true;
									sys.mouse.addHudClickable(sys.menucontrols);
									sys.menufullscreen.material.visible = true;
									sys.mouse.addHudClickable(sys.menufullscreen);
									
									sys.menumenu.fadein({time: 0.25, onComplete: function(){
										this.menuopen = true;
										this.menufading = false;
									}.bind(sys)});
									sys.menucontrols.fadein({time: 0.25});
									sys.menufullscreen.fadein({time: 0.25});
									
								}
							}
						}
						//else this.toframe(2);
					}.bindArgs(system)
					this.hoverin = function(){
						this.fadein({time: 0.25});
					}
					this.hoverout = function(){
						this.fadeout({time: 0.25});
						this.down = false;
						this.toframe(1);
					}
					this.clickup = function(){
						this.down = false;
						this.toframe(1);
					}
					this.menubutton = noop;
					//this.draggable = true;
				}.bindArgs(this)
			});
			
			this.menuopen = false;
			this.menufading = false;
			this.submenu1open = false;
			this.submenu1fading = false;
			
			this.menumenu = new Picture({filename: this.attachpath+'/resources/system/menumenu.png', scale: 3.0,
				position: new THREE.Vector3(0,1300,0), antialiased: true, opacity: 0,
				name: 'menumenu', transparent: true, sprite: false, //blending: 'add',
				onLoad: function(system){
					this.addTo(system.hud);
					this.system = system;
					this.position.z = 702;
					this.down = false;
					this.material.visible = false;
					//mainmouse.addHudClickable(this);
					//this.click = function(){
						//this.toframe(2);
					//}
					//this.hoverout = this.clickup = function(){
						//this.toframe(1);
					//}
				}.bindArgs(this)
			});
			
			this.menufullscreen = new Picture({filename: this.attachpath+'/resources/system/menufullscreen.png', scale: 3.0,
				position: new THREE.Vector3(0,980,0), antialiased: true, opacity: 0,
				name: 'menufullscreen', transparent: true, sprite: false, //blending: 'add',
				onLoad: function(system){
					this.addTo(system.hud);
					this.system = system;
					this.position.z = 702;
					this.down = false;
					this.material.visible = false;
					this.click = function(sys){
						THREEx.FullScreen.request(sys.container);
					}.bindArgs(system);
				}.bindArgs(this)
			});
			
			this.menucontrols = new Picture({filename: this.attachpath+'/resources/system/menucontrols.png', scale: 3.0,
				position: new THREE.Vector3(0,690,0), antialiased: true, opacity: 0, 
				name: 'menucontrols', transparent: true, sprite: false, //blending: 'add',
				onLoad: function(system){
					this.addTo(system.hud);
					this.system = system;
					this.position.z = 702;
					this.down = false;
					this.material.visible = false;
					this.click = function(sys){
						if (sys.submenu1fading === false){
							if (sys.submenu1open){
								if (sys.hud.repositioning) sys.menureposition.click();
								sys.submenu1fading = true;
								sys.menuvisible.fadeout({time: 0.25});
								sys.menureposition.fadeout({time: 0.25, onComplete: function(){
									this.menuvisible.material.visible = false;
									this.mainmouse.removeHudClickable(this.menuvisible);
									this.menureposition.material.visible = false;
									this.mainmouse.removeHudClickable(this.menureposition);
									this.submenu1open = false;
									this.submenu1fading = false;
								}.bind(sys)});
							}
							else{
								sys.submenu1fading = true;
								sys.menuvisible.material.visible = true;
								sys.mouse.addHudClickable(sys.menuvisible);
								sys.menureposition.material.visible = true;
								sys.mouse.addHudClickable(sys.menureposition);
								sys.menuvisible.fadein({time: 0.25, onComplete: function(){
									sys.submenu1open = true;
									sys.submenu1fading = false;
								}});
								sys.menureposition.fade({time: 0.25, to: {opacity: 0.5}});
							}
						}
					}.bindArgs(system)
				}.bindArgs(this)
			});
			
			this.menuvisible = new Picture({filename: this.attachpath+'/resources/system/menuvisible.png', scale: 3.0,
				position: new THREE.Vector3(1020,690,0), antialiased: true, opacity: 0,
				name: 'menuvisible', transparent: true, sprite: false, animatorframes: [2,1,2,350],
				onLoad: function(system){
					this.addTo(system.hud);
					this.system = system;
					this.position.z = 702;
					this.down = false;
					this.material.visible = false;
					//this.mouse.addHudClickable(this);
					this.click = function(){
						this.togglecontrols();
					}.bind(system)
				}.bindArgs(this)
			});
			
			this.hud.repositioning = false;
			
			this.menureposition = new Picture({filename: this.attachpath+'/resources/system/menureposition.png', scale: 3.0,
				position: new THREE.Vector3(1020,380,0), antialiased: true, opacity: 0,
				name: 'menureposition', transparent: true, sprite: false, //blending: 'add',
				onLoad: function(system){
					this.addTo(system.hud);
					this.system = system;
					this.position.z = 702;
					this.down = false;
					this.material.visible = false;
					this.click = function(sys){
						if (sys.submenu1fading === false && sys.menufading === false){
							if (!sys.hud.repositioning){
								this.material.opacity = 1.0;
								sys.hud.repositioning = true;
								sys.abutton.draggable = true;
								sys.bbutton.draggable = true;
								sys.selectbutton.draggable = true;
								sys.startbutton.draggable = true;
								sys.startbutton.responsive = false;
								sys.analog.repositioning = true;
							}
							else{
								this.material.opacity = 0.5;
								sys.hud.repositioning = false;
								sys.abutton.draggable = false;
								sys.bbutton.draggable = false;
								sys.selectbutton.draggable = false;
								sys.startbutton.draggable = false;
								sys.startbutton.responsive = true;
								sys.analog.repositioning = false;
							}
						}	
					}.bindArgs(system)
				}.bindArgs(this)
			});
			
			this.scene.add(this.hud);
			
			this.hud.initialized = true;
			
			this.hud.fade = {};
			this.hud.fade.state = 'out';
			this.hud.fade.in = function(system){
			
				if (system.hud.controlsvisible) {
					system.abutton.material.visible = true;
					system.bbutton.material.visible = true;
					system.startbutton.material.visible = true;
					system.selectbutton.material.visible = true;
					system.analog.material.visible = true;
					system.joyarrows.material.visible = true;
					system.abutton.fadein({time: 0.25});
					system.bbutton.fadein({time: 0.25});
					system.startbutton.fadein({time: 0.25});
					system.selectbutton.fadein({time: 0.25});
					system.analog.fadein({time: 0.25});
					system.joyarrows.fadein({time: 0.25});
					system.mouse.addHudClickable(system.abutton);
					system.mouse.addHudClickable(system.bbutton);
					system.mouse.addHudClickable(system.startbutton);
					system.mouse.addHudClickable(system.selectbutton);
					system.mouse.addHudClickable(system.analog);
				}
			}.bindArgs(this);
			this.hud.fade.out = function(){
			
			}
			
			this.openMenu = function(){
				this.menumenu.fadein();
			}.bind(this);
			this.closeMenu = function(){
				this.menumenu.fadeout();
			}.bind(this);
			this.togglecontrols = function(system){
				if (!system.hud.controlsfading){
					system.hud.controlsfading = true;
					if (system.hud.controlsvisible) {
						system.menuvisible.toframe(2);
						system.hud.controlsvisible = false;
						system.bbutton.fadeout({time: 0.25});
						system.startbutton.fadeout({time: 0.25});
						system.selectbutton.fadeout({time: 0.25});
						system.analog.fadeout({time: 0.25});
						system.joyarrows.fadeout({time: 0.25});
						system.menubutton.material.visible = true;
						system.menubutton.fadein({time: 0.25});
						system.mouse.addHudClickable(system.menubutton);
						system.abutton.fadeout({time: 0.25, onComplete: function(){
							this.abutton.material.visible = false;
							this.mouse.removeHudClickable(this.abutton);
							this.bbutton.material.visible = false;
							this.mouse.removeHudClickable(this.bbutton);
							this.startbutton.material.visible = false;
							this.mouse.removeHudClickable(this.startbutton);
							this.selectbutton.material.visible = false;
							this.mouse.removeHudClickable(this.selectbutton);
							this.analog.material.visible = false;
							this.joyarrows.material.visible = false;
							this.mouse.removeHudClickable(this.analog);
							this.hud.controlsfading = false;
						}.bind(system)});
					}
					else {
						system.menuvisible.toframe(1);
						
						system.abutton.material.visible = true;
						system.bbutton.material.visible = true;
						system.startbutton.material.visible = true;
						system.selectbutton.material.visible = true;
						system.analog.material.visible = true;
						system.joyarrows.material.visible = true;
						system.mouse.addHudClickable(system.abutton);
						system.abutton.fadein({time: 0.25});
						system.bbutton.material.visible = true;
						system.mouse.addHudClickable(system.bbutton);
						system.bbutton.fadein({time: 0.25});
						system.mouse.addHudClickable(system.startbutton);
						system.startbutton.fadein({time: 0.25});
						system.mouse.addHudClickable(system.selectbutton);
						system.selectbutton.fadein({time: 0.25});
						system.mouse.addHudClickable(system.analog);
						system.analog.fadein({time: 0.25});
						system.joyarrows.fadein({time: 0.25});
						system.mouse.removeHudClickable(system.menubutton);
						system.menubutton.fadeout({time: 0.25, onComplete: function(){
							this.menubutton.material.visible = false;
							this.hud.controlsvisible = true;
							this.hud.controlsfading = false;
						}.bind(system)});
						
					}
				}
			}.bindArgs(this);
			//game.togglecontrols();
		},
		resize: function(){
			
			if (this.autoresize){
				//console.log('resizing');
				var temph = this.getHeightRatio();
				var tempw = this.getWidthRatio();
				
				if (this.hud.initialized){
					if (this.abutton.mesh) this.abutton.mesh.scale.x = 2*(temph / tempw);
					if (this.bbutton.mesh) this.bbutton.mesh.scale.x = 2*(temph / tempw);
					if (this.startbutton.mesh) this.startbutton.mesh.scale.x = 2*(temph / tempw);
					if (this.selectbutton.mesh) this.selectbutton.mesh.scale.x = 2*(temph / tempw);
					if (this.menubutton.mesh) this.menubutton.mesh.scale.x = 2*(temph / tempw);
					if (this.analog.mesh) this.analog.mesh.scale.x = 2*(temph / tempw);
					if (this.joyarrows.mesh) this.joyarrows.mesh.scale.x = 2*(temph / tempw);
				}

				if (this.renderer && this.camera){ 
					this.renderer.setSize( tempw, temph );
					this.camera.aspect = tempw / temph;
					this.camera.updateProjectionMatrix();
					this.renderer.domElement.style.width = tempw + 'px';
					this.renderer.domElement.style.height = temph + 'px';
				}
				
				if (this.currentarea){
					for (var j = 0; j < this.currentarea.particlesystems.length; j++){
						this.currentarea.particlesystems[j].particlewindowscale = temph/this.particlescale;
					}
				}
					
				if (this.effects){
					var renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
					this.effects.composer.renderTarget1 = 
						new THREE.WebGLRenderTarget(tempw, temph, renderTargetParameters);
					this.effects.composer.renderTarget2 = 
						this.effects.composer.renderTarget1.clone();
				}
			}
			
			if (this.autocenter){
				if (this.container){
					this.container.style.position = 'absolute';
					this.container.style.width = ((window.innerWidth - this.container.offsetWidth)/2)+'px';
					this.container.style.height = ((window.innerHeight - this.container.offsetHeight)/2)+'px';
				}
			}
			
			if (this.container.children[0]){
				this.container.style.position = 'absolute';
				this.container.style.left = ((this.container.offsetWidth - this.container.children[0].offsetWidth)/2)+'px';
				this.container.style.top = ((this.container.offsetHeight - this.container.children[0].offsetHeight)/2)+'px';
			}
			
		}	
	}
	
	/*var physicsworker = new Worker("../js/2DgsWorkerPhysics.js");
		physicsworker.onmessage = function (event) {
			//console.log(event.data);
			if (currentarea.pictures) for (var i = 0; i < currentarea.pictures.length; i++) {
				if (currentarea.pictures[i].physicsupdating){
					currentarea.pictures[i].set_p0();
				}
			}
			world.fromJSON(event.data);
			//console.log(getpic('aphaia').physicsbody.position);
			if (currentarea.pictures) for (var i = 0; i < currentarea.pictures.length; i++) {
				if (currentarea.pictures[i].physicsupdating){
					currentarea.pictures[i].set_p1();
					if (pstepping && currentarea.pictures[i].physicsupdating) 
					  currentarea.pictures[i].updatePhysics();
				}
			}
			
		};
	
	physicsworker.addEventListener("error", function(e){console.log(e);}, false);*/
