/* 2Dgs Utilities  
 * @author brokedRobot / http://www.prismshards.com/
 */ 
var log = console.log;
 
function vec3(x, y, z){
	return new THREE.Vector3(x, y, z);
}

function v3(x, y, z){
	return vec3(x, y, z);
} 

function vec2(x, y){
	return new THREE.Vector2(x, y);
}

function v2(x, y){
	return vec2(x, y);
} 

function euler(x, y, z){
	return new THREE.Euler(x, y, z);
}

function undef(obj){
	return (typeof obj === 'undefined');
}

function noop(){
	//no operation :)
}

function tolog(){
	console.log(arguments);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomArbitary(min, max) {
    return Math.random() * (max - min) + min;
}

function getRandomFloat( base, spread ) {
    return base + spread * (Math.random() - 0.5);
}


function removeFromArray(array, item){
    for (var i in array){
        if (array[i] == item){
            array.splice(i, 1);
            break;
        }
    }
	return array;
}

function arrayContains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
}

// Polyfills
if (!Array.prototype.indexOf)
{
	Array.prototype.indexOf = function(elt /*, from*/)
	{
		var len = this.length;

		var from = Number(arguments[1]) || 0;
		from = (from < 0)
			? Math.ceil(from)
			: Math.floor(from);
		if (from < 0)
			from += len;

		for (; from < len; from++)
		{
			if (from in this &&
				this[from] === elt)
					return from;
		}
		return -1;
	};
} 

if(!Array.isArray) {
	Array.isArray = function (vArg) {
		return Object.prototype.toString.call(vArg) === "[object Array]";
	};
}
// End Polyfills

function verifyWebGL(){
	if ( Detector.webgl ) webGLCapable = true;
	else {
		alert('You need a WebGL compatible browser to continue!\
				Try the help section for some advice and helpful links!');
		window.location = 'help.php';
	}
}

function inRect(point, sqrloc, sqrwidth, sqrheight){
	if (point.x > sqrloc.x - (sqrwidth/2) && point.x < sqrloc.x + (sqrwidth/2)
		&& point.y > sqrloc.y - (sqrheight/2) && point.y < sqrloc.y + (sqrheight/2)) return true;
	else return false;
}

function addEvent(obj, evt, fn) {
    if (obj.addEventListener) {
        obj.addEventListener(evt, fn, false);
    }
    else if (obj.attachEvent) {
        obj.attachEvent("on" + evt, fn);
    }
}

CanvasRenderingContext2D.prototype.wrapText = function(opts){
	var text = opts.hasOwnProperty('text') ? opts.text : '';
	if (opts.hasOwnProperty('string')) text = opts.string;
	
	var x = opts.hasOwnProperty('x') ? opts.x : 0;
	var y = opts.hasOwnProperty('y') ? opts.y : 0;
	var width = opts.hasOwnProperty('width') ? opts.width : 580;
	var lineheight = opts.hasOwnProperty('lineheight') ? opts.lineheight : 30;
	var outlinewidth = opts.hasOwnProperty('outlinewidth') ? opts.outlinewidth : false;
	var outlinecolor = opts.hasOwnProperty('outlinecolor') ? opts.outlinecolor : false;
	
	y += lineheight;

	var lines = text.split("\n");

	for (var i = 0; i < lines.length; i++) {

		var words = lines[i].split(' ');
		var line = '';

		for (var n = 0; n < words.length; n++){
			var testLine = line + words[n] + ' ';
			var metrics = this.measureText(testLine);
			var testWidth = metrics.width;
			if (testWidth > width && n > 0){		
				this.fillText(line, x, y);
				line = words[n] + ' ';
				y += lineheight;
			}
			else {
				line = testLine;
			}
		}
		
		if ((outlinewidth || outlinewidth === 0) && outlinecolor){			
			this.strokeStyle = outlinecolor;
			this.miterLimit = 2;
			this.lineJoin = 'circle';
			this.lineWidth = outlinewidth;
			this.strokeText(line, x, y);
			this.lineWidth = 1;
		}

		this.fillText(line, x, y);
		this.fillText(line, x, y);
		y += lineheight;
	}
}
  

function getBrowserSizeInfo(set){
    var w = window,
		d = document,
		e = d.documentElement,
		g = d.getElementsByTagName('body')[0],
		x = w.innerWidth || e.clientWidth || g.clientWidth,
		y = w.innerHeight|| e.clientHeight|| g.clientHeight;
    if (x < y){
		var intm = x;
		x = y;
		y = intm;
    }
    if (x < 720) x = 720;
    var result = new Vec3(x, y, 0);
    if (set){
		settings.outerratioh = 0.588; settings.innerratioh = 0.825;
		settings.outerratiow = 1.871; settings.innerratiow = 1.466;

		settings.outerdimensiony = result.y;
		settings.outerdimensionx = result.y * settings.outerratiow;
		settings.innerdimensionx = settings.outerdimensionx * 0.40950 * settings.gamesize;
		settings.innerdimensiony = settings.innerdimensionx * 0.75;

		settings.innertop = (settings.outerdimensiony - settings.innerdimensiony)/2;
		settings.innerbottom = settings.innertop + settings.innerdimensiony;
		settings.innerleft = (settings.outerdimensionx - settings.innerdimensionx)/2;
		settings.innerright = settings.innerleft + settings.innerdimensionx;
    }
    return result;
}

//**************  ADD CLEAR FUNCTION  ****************//
if (!loadinganim){ var loadinganim = {}; loadinganim.mesh = null;}
if (!standardtextbox){ var standardtextbox = {}; standardtextbox.mesh = null;}
if (!loadingmeshref) var loadingmeshref = {};
THREE.Object3D.prototype.clear = function(){
    var children = this.children;
    for(var i = children.length-1;i>=0;i--){
        var child = children[i];
        if (child !== camera && child != blackout.anchor && child !== whiteout.anchor &&
            child != game && child !== game.loadingtext.anchor && child !==
            standardtextbox.anchor && child !== game.loadingmeshref && !(child instanceof THREE.Camera)
            && child !== game.ambient && child !== game.light ) { 
            child.clear();
            scene.remove(child);
        }
    };
};

Function.prototype.bindArgs = function(){
    if (typeof this !== "function")
        throw new TypeError("Function.prototype.bindArgs needs to be called on a function");
    var slice = Array.prototype.slice,
        args = slice.call(arguments), 
        fn = this, 
        partial = function() {
            return fn.apply(this, args.concat(slice.call(arguments)));
        };
    partial.prototype = Object.create(this.prototype);
    return partial;
};

var flicker = function(sys){
	if (sys.game.framecounter % 3 === 0) this.material.opacity = 0;
	else this.material.opacity = 1;
}
var halfflicker = function(sys){
	if (sys.game.framecounter % 3 === 0) this.material.opacity = 0;
	else this.material.opacity = 0.5;
}
var lowflicker = function(sys){
	if (sys.game.framecounter % 3 === 0) this.material.opacity = 0;
	else this.material.opacity = 0.25;
}
var verylowflicker = function(sys){
	if (sys.game.framecounter % 3 === 0) this.material.opacity = 0;
	else this.material.opacity = 0.1;
}
var highflicker = function(sys){
	if (sys.game.framecounter % 3 === 0) this.material.opacity = 0;
	else this.material.opacity = 0.75;
}
var veryhighflicker = function(sys){
	if (sys.game.framecounter % 3 === 0) this.material.opacity = 0;
	else this.material.opacity = 0.9;
}
     

//************************** BEZIER FUNCTIONS **************************//
//returns point on a simple bezier curve with two control points
//C1 start point, C4 end point, C2 and C3 control points
//needs changed to use standardized vector formats

var coord = function (x,y) {
  if(!x) var x=0;
  if(!y) var y=0;
  return {x: x, y: y};
}

function B1(t) { return t*t*t }
function B2(t) { return 3*t*t*(1-t) }
function B3(t) { return 3*t*(1-t)*(1-t) }
function B4(t) { return (1-t)*(1-t)*(1-t) }

function getBezier(percent,C1,C2,C3,C4) {
  var pos = new coord();
  pos.x = C1.x*B1(percent) + C2.x*B2(percent) + C3.x*B3(percent) + C4.x*B4(percent);
  pos.y = C1.y*B1(percent) + C2.y*B2(percent) + C3.y*B3(percent) + C4.y*B4(percent);
  return pos;
}

//points: array of points with P1 start and Plast end, rest are control points
function getComplexBezier(points, t) {  
  var n = points.length;
  var tmp = [];

  for (var i = 0; i < n; ++i){
      tmp[i] = [points[i][0], points[i][1]]; // save input
  }
  
  for (var j = 1; j < n; ++j) {
      for (i = 0; i < n - j; ++i) {
          tmp[i][0] = (1 - t) * tmp[i][0] + t * tmp[parseInt(i + 1, 10)][0];
          tmp[i][1] = (1 - t) * tmp[i][1] + t * tmp[parseInt(i + 1, 10)][1]; 
      }
  }

  return [ tmp[0][0], tmp[0][1] ]; 
    
}

/*
Usage:

	var spline = new Spline({
		points: array_of_control_points,
		duration: time_in_miliseconds,
		sharpness: how_curvy,
		stepLength: distance_between_points_to_cache
	});

*/
var Spline = function(options){
	this.points = options.points || [];
	this.duration = options.duration || 10000;
	this.sharpness = options.sharpness || 0.85;
	this.centers = [];
	this.controls = [];
	this.stepLength = options.stepLength || 60;
	this.length = this.points.length;
	this.delay = 0;
  this.currenttime = 0;
	// this is to ensure compatibility with the 2d version
	for(var i=0; i<this.length; i++) this.points[i].z = this.points[i].z || 0;
	for(var i=0; i<this.length-1; i++){
		var p1 = this.points[i];
		var p2 = this.points[i+1];
		this.centers.push({x:(p1.x+p2.x)/2, y:(p1.y+p2.y)/2, z:(p1.z+p2.z)/2});
	}
	this.controls.push([this.points[0],this.points[0]]);
	for(var i=0; i<this.centers.length-1; i++){
		var p1 = this.centers[i];
		var p2 = this.centers[i+1];
		var dx = this.points[i+1].x-(this.centers[i].x+this.centers[i+1].x)/2;
		var dy = this.points[i+1].y-(this.centers[i].y+this.centers[i+1].y)/2;
		var dz = this.points[i+1].z-(this.centers[i].y+this.centers[i+1].z)/2;
		this.controls.push([{
			x:(1.0-this.sharpness)*this.points[i+1].x+this.sharpness*(this.centers[i].x+dx),
			y:(1.0-this.sharpness)*this.points[i+1].y+this.sharpness*(this.centers[i].y+dy),
			z:(1.0-this.sharpness)*this.points[i+1].z+this.sharpness*(this.centers[i].z+dz)},
		{
			x:(1.0-this.sharpness)*this.points[i+1].x+this.sharpness*(this.centers[i+1].x+dx),
			y:(1.0-this.sharpness)*this.points[i+1].y+this.sharpness*(this.centers[i+1].y+dy),
			z:(1.0-this.sharpness)*this.points[i+1].z+this.sharpness*(this.centers[i+1].z+dz)}]);
	}
	this.controls.push([this.points[this.length-1],this.points[this.length-1]]);
	this.steps = this.cacheSteps(this.stepLength);
	return this;
}

/*
	Caches an array of equidistant (more or less) points on the curve.
*/
Spline.prototype.cacheSteps = function(mindist){
	var steps = [];
	var laststep = this.pos(0);
	steps.push(0);
	for(var t=0; t<this.duration; t+=10){
		var step = this.pos(t);
		var dist = Math.sqrt((step.x-laststep.x)*(step.x-laststep.x)+(step.y-laststep.y)*(step.y-laststep.y)+(step.z-laststep.z)*(step.z-laststep.z));
		if(dist>mindist){
			steps.push(t);
			laststep = step;
		}
	}
	return steps;
}

/*
	returns angle and speed in the given point in the curve
*/
Spline.prototype.vector = function(t){
	var p1 = this.pos(t+10);
	var p2 = this.pos(t-10);
	return {
		angle:180*Math.atan2(p1.y-p2.y, p1.x-p2.x)/3.14,
		speed:Math.sqrt((p2.x-p1.x)*(p2.x-p1.x)+(p2.y-p1.y)*(p2.y-p1.y)+(p2.z-p1.z)*(p2.z-p1.z))
	}
}

Spline.prototype.vector2 = function(t){
	var p1 = this.pos(t+10);
	var p2 = this.pos(t-10);
	return {
		x: p1.x - p2.x,
		y: p1.y - p2.y
	}
}

Spline.prototype.vector3 = function(t, px, py){
	var p1 = this.pos(t+10);
	var p2 = {x: px, y: py};
	return {
		x: p1.x - p2.x,
		y: p1.y - p2.y
	}
}

Spline.prototype.getVector = function(t, px, py, pz){
	var p1 = this.pos(t+10);
	var p2 = {x: px, y: py, z: pz};
	return {
  
    p0:{
  		x: px,
  		y: py,
      z: pz
    },
    
    p1:{
  		x: p1.x - p2.x,
  		y: p1.y - p2.y,
      z: p1.z - p2.z
    },
    
    angle: 180*Math.atan2(p1.y-p2.y, p1.x-p2.x)/3.14
    
	};
}

var splines = [];
var travelSpline = function(opts){
    if (!opts.picture) {console.log('no picture for travelSpline.'); return;}
    var delta = opts.delta || 100;
    var spline = new Spline({points: opts.points,
                     duration: opts.duration, sharpness: opts.roundness});
    var stuff = [opts.picture, spline, delta];
    var interv = runInterval(function (arr){
        var vect = arr[1].pos(arr[1].currenttime);
        arr[0].position.x = vect.x;
        arr[0].position.y = vect.y;
        arr[1].currenttime += arr[2]; 
        if (arr[1].currenttime >= arr[1].duration) this.stop();
    }, stuff, delta);
    return interv;
}

var travelConstantSpline = function(opts){
    if (!opts.picture) {console.log('no picture for travelSpline.'); return;}
    var delta = opts.delta || 100;
    var spline = new Spline({points: opts.points, stepLength: opts.steplength,
                     duration: opts.duration, sharpness: opts.roundness});
    var stuff = [opts.picture, spline, delta];
    var interv = runInterval(function (arr){
        var vect = arr[1].pos(arr[1].steps[Math.floor((arr[1].currenttime/arr[1].duration)*arr[1].steps.length)]);
        arr[0].position.x = vect.x;
        arr[0].position.y = vect.y;
        arr[1].currenttime += arr[2]; 
        if (arr[1].currenttime >= arr[1].duration) this.stop();
    }, stuff, delta);
    return interv;
}

/*
	Draws the control points
*/
Spline.prototype.drawControlPoints = function(ctx, color){
	ctx.fillStyle = color||"#f60";
	ctx.strokeStyle = "#fff";
	ctx.lineWidth = 2; 
	for(var i=0; i<this.length; i++){
		var p = this.points[i];
		var c1 = this.controls[i][0];
		var c2 = this.controls[i][1];

		ctx.beginPath();
		ctx.moveTo(c1.x,c1.y);
		ctx.lineTo(p.x,p.y);
		ctx.lineTo(c2.x,c2.y);
		ctx.stroke();
					
		ctx.beginPath();
		ctx.arc(c1.x, c1.y, 3, 0, 2 * Math.PI, false);
		ctx.fill();
		ctx.stroke();
		
		/*ctx.beginPath();
		ctx.arc(this.centers[i].x, this.centers[i].y, 5, 0, 2 * Math.PI, false);
		ctx.fill();
		ctx.stroke();*/
		
		ctx.beginPath();
		ctx.arc(c2.x, c2.y, 3, 0, 2 * Math.PI, false);
		ctx.fill();
		ctx.stroke();
		

		ctx.beginPath();
		ctx.arc(p.x, p.y, 7, 0, 2 * Math.PI, false);
		ctx.fill();
		ctx.stroke();
	}
	return this;
}

/*
	Gets the position of the point, given time.

	WARNING: The speed is not constant. The time it takes between control points is constant.

	For constant speed, use Spline.steps[i];
*/
Spline.prototype.pos = function(time){

	function bezier(t, p1, c1, c2, p2){
		var B = function(t) { 
			var t2=t*t, t3=t2*t;
			return [(t3),(3*t2*(1-t)),(3*t*(1-t)*(1-t)),((1-t)*(1-t)*(1-t))]
		}
		var b = B(t)
		var pos = {
			x : p2.x * b[0] + c2.x * b[1] +c1.x * b[2] + p1.x * b[3],
			y : p2.y * b[0] + c2.y * b[1] +c1.y * b[2] + p1.y * b[3],
			z : p2.z * b[0] + c2.z * b[1] +c1.z * b[2] + p1.z * b[3]
		}
		return pos; 
	}
	var t = time-this.delay;
	if(t<0) t=0;
	if(t>this.duration) t=this.duration-1;
	//t = t-this.delay;
	var t2 = (t)/this.duration;
	if(t2>=1) return this.points[this.length-1];

	var n = Math.floor((this.points.length-1)*t2);
	var t1 = (this.length-1)*t2-n;
	return bezier(t1,this.points[n],this.controls[n][1],this.controls[n+1][0],this.points[n+1]);
}

/*
	Draws the line
*/
Spline.prototype.draw = function(ctx,color){
	ctx.strokeStyle = color || "#7e5e38"; // line color
	ctx.lineWidth = 14;
	ctx.beginPath();
	var pos;
	for(var i=0; i<this.duration; i+=10){
		pos = this.pos(i); //bezier(i/max,p1, c1, c2, p2);
		if(Math.floor(i/100)%2==0) ctx.lineTo(pos.x, pos.y);
		else ctx.moveTo(pos.x, pos.y);
	}
	ctx.stroke();
	return this;
}
//************************** END BEZIER FUNCTIONS **************************//

var intervals = [];

function runTimeout(func, time, vars, delta) {

    if (typeof delta === "undefined") var delta = 0.1;

    var tid = setInterval(function() {
        if ( window.blurred ) { return; }    
        time -= delta;
        if ( time <= 0 ) {
            clearInterval(tid);
            func(vars); // time passed - do your work
        }
    }, delta*1000);
    
    intervals.push(tid);
}

function runInterval(func, delta, vars) {

    this.tid = setInterval(function() {
    
        if ( window.blurred ) { return; }    

        func(vars); // time passed - do your work

    }, delta*1000);
    
    intervals.push(this.tid);
    
    return this.tid; 
}

function snowUpdate(){
	this.idseed += 0.01;
	this.direction = this.psystem.perlin.noise(this.idseed,
     this.position.x / this.psystem.noisescale, this.position.y / this.psystem.noisescale);
	this.direction += this.psystem.winddirection;

	this.position.x += Math.cos(this.direction) * this.speed;
	this.position.y += Math.sin(this.direction) * this.speed;
	this.position.y -= this.psystem.gravity;

	if(this.position.x < 0 || this.position.y < 0) {
		//this.init();
	}

	//this.age++;
	//if(this.age >= this.lifespan) {
	//	this.init();
	//}
  var self = this;
	this.age++;
	if(this.age >= this.lifespan) {
    if (!this.fadingout){
        this.picture.fadeout({onComplete: function(){initParent(self)}});
        this.fadingout = true;
    }
	}
  
  if (this.psystem.colorize) this.color.setHSV(map(-this.screenposition.y,
          -this.psystem.emitterheight / 2, this.psystem.emitterheight / 1, 0, 1), 1, 1);
	this.screenposition.x = this.position.x - this.psystem.emitterwidth / 2;
	this.screenposition.y = this.position.y - this.psystem.emitterheight / 2;
  //this.picture.mesh.scale.x = this.picture.mesh.scale.y = this.position.z; 
                      
}

function starUpdate(delta){
  //picture system only for now   
  var self = this;
	this.age++;
	if(this.age >= this.lifespan) {
    if (!this.fadingout){
       this.picture.fadeout({onComplete: function(){initParent(self)}});
        this.fadingout = true;
    }
	}
  
	this.screenposition.x = this.screenposition.x*1.005;
	this.screenposition.y = this.screenposition.y*1.005;

  this.picture.mesh.scale.x = this.picture.mesh.scale.y =
         ((Math.abs(this.screenposition.x) + Math.abs(this.screenposition.y))*0.003);                                            
}

function getRandom(minVal, maxVal, round) {
	var r = minVal + (Math.random() * (maxVal - minVal));
	if(round) {
		r = Math.round(r);
	}
	return r;

}

function map(value, istart, istop, ostart, ostop) {
	return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
}


 var ImprovedNoise = function () {

	var p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,
           8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,
           35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,
           134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,
           55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,
           169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,
           250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,
           189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,
           172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,
           228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,
           49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,
           236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];

	for (var i=0; i < 256 ; i++) {
		  p[256+i] = p[i];
	}

	function fade(t) {
		return t * t * t * (t * (t * 6 - 15) + 10);
	}

	function lerp(t, a, b) {
		return a + t * (b - a);
	}

	function grad(hash, x, y, z) {
		var h = hash & 15;
		var u = h < 8 ? x : y, v = h < 4 ? y : h == 12 || h == 14 ? x : z;
		return ((h&1) == 0 ? u : -u) + ((h&2) == 0 ? v : -v);
	}

	return {
		noise: function (x, y, z) {
			var floorX = ~~x, floorY = ~~y, floorZ = ~~z;
			var X = floorX & 255, Y = floorY & 255, Z = floorZ & 255;
			x -= floorX;
			y -= floorY;
			z -= floorZ;
			var xMinus1 = x -1, yMinus1 = y - 1, zMinus1 = z - 1;
			var u = fade(x), v = fade(y), w = fade(z);
			var A = p[X]+Y, AA = p[A]+Z, AB = p[A+1]+Z, B = p[X+1]+Y, BA = p[B]+Z, BB = p[B+1]+Z;
			return lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z), 
							grad(p[BA], xMinus1, y, z)),
						lerp(u, grad(p[AB], x, yMinus1, z),
							grad(p[BB], xMinus1, yMinus1, z))),
					lerp(v, lerp(u, grad(p[AA+1], x, y, zMinus1),
							grad(p[BA+1], xMinus1, y, z-1)),
						lerp(u, grad(p[AB+1], x, yMinus1, zMinus1),
							grad(p[BB+1], xMinus1, yMinus1, zMinus1))));
		}
	}
}

// distance2d simple distance function

function distance2d(pointa, pointb){
   return Math.sqrt(Math.pow((pointa.x - pointb.x),2) + Math.pow((pointa.y - pointb.y),2));
}
var distance2D = distance2d;

function distance3d(pointa, pointb){
   return Math.sqrt(Math.pow((pointa.x - pointb.x),2) + Math.pow((pointa.y - pointb.y),2)
           + Math.pow((pointa.z - pointb.z),2));
}
var distance3D = distance3d;
    
Function.prototype.toJSON=Function.toString; //extend JSON to cover Functions

function jsonSerialize(obj){

  var str = JSON.stringify(obj, null, "\t");
  return str;
  
}

function jsonDeserialize(str){

  var obj = JSON.parse(str, function(a,b){
    if(b.match && b.match(/^function[\w\W]+\}$/)){ b=eval("b=0||"+b); }
    return b;
  });
  return obj;

} 

function storeGameState(filename, gamestate){
	jQuery.post("http://www.prismshards.com/json.php", {name: filename, json : jsonSerialize(gamestate)});
}

function retrieveGameState(userid, filename){
  jQuery.getJSON('http://www.prismshards.com/users/'+userid+'/'+filename+'.json', function(data) {
      //success
      return jsonDeserialize(data);
  }).fail(function() { 
      //failure
      console.log( "gamestate not found" );
      return false; 
  });
}

function moveTo(opts){return moveto(opts)}    
function moveto(opts){
  if (typeof opts === 'undefined') return false;
  if (!undef(opts.object)) var obj = opts.object;
  else if (!undef(opts.objects)) var obj = opts.objects;
  
  if (Array.isArray(obj)){

    for (var i=0; i < obj.length; i++){
      opts.object = obj[i].position;
      opts.extraOnComplete = function(object, tween){
        this.positiontweens.shift();
      }.bind(obj[i]);
      
      var positiontween = tween(opts);
      
      if (typeof obj[i].positiontweens === 'undefined') obj[i].positiontweens = [];  
      if (obj[i].positiontweens.length === 0){
        positiontween.start();
      }
      else{
        obj[i].positiontweens[obj[i].positiontweens.length - 1].chain(positiontween);          
      }
       
      obj[i].positiontweens.push(positiontween); 
    }  
    
    return;
  }
  else{
  
    opts.object = obj.position;
    
    opts.extraOnComplete = function(object, tween){
      this.positiontweens.shift();
    }.bind(obj);
   
    var positiontween = tween(opts);
     
    if (typeof obj.positiontweens === 'undefined') obj.positiontweens = [];  
    if (obj.positiontweens.length === 0){
      positiontween.start();
    }
    else{
      obj.positiontweens[obj.positiontweens.length - 1].chain(positiontween);          
    }
     
    obj.positiontweens.push(positiontween);

    return obj;
  }

}

function rotateTo(opts){return rotateto(opts)}
function rotateto(opts){
  if (typeof opts === 'undefined') return false;
  if (!undef(opts.object)) var obj = opts.object;
  else if (!undef(opts.objects)) var obj = opts.objects;
  
  if (Array.isArray(obj)){

    for (var i=0; i < obj.length; i++){
      opts.object = obj[i].rotation;
      opts.extraOnComplete = function(object, tween){
        this.rotationtweens.shift();
      }.bind(obj[i]);
      
      var rotationtween = tween(opts);
      
      if (typeof obj[i].rotationtweens === 'undefined') obj[i].rotationtweens = [];  
      if (obj[i].rotationtweens.length === 0){
        rotationtween.start();
      }
      else{
        obj[i].rotationtweens[obj[i].rotationtweens.length - 1].chain(rotationtween);          
      }
       
      obj[i].rotationtweens.push(rotationtween); 
    }  
    
    return;
  }
  else{
  
    opts.object = obj.rotation;
    
    opts.extraOnComplete = function(object, tween){
      this.rotationtweens.shift();
    }.bind(obj);
   
    var rotationtween = tween(opts);
     
    if (typeof obj.rotationtweens === 'undefined') obj.rotationtweens = [];  
    if (obj.rotationtweens.length === 0){
      rotationtween.start();
    }
    else{
      obj.rotationtweens[obj.rotationtweens.length - 1].chain(rotationtween);          
    }
     
    obj.rotationtweens.push(rotationtween);

    return obj;
  }
}

function fadeIn(opts){return fadein(opts)}
function fadein(opts){
  if (typeof opts === 'undefined') return false;
  if (!undef(opts.object)) var obj = opts.object;
  else if (!undef(opts.objects)) var obj = opts.objects;
  opts.to = {opacity: 1};
  
   if (Array.isArray(obj)){

    for (var i=0; i < obj.length; i++){
      opts.object = obj[i].material;
      opts.extraOnComplete = function(object, tween){
        this.opacitytweens.shift();
      }.bind(obj[i]);
      
      var opacitytween = tween(opts);
      
      if (typeof obj[i].opacitytweens === 'undefined') obj[i].opacitytweens = [];  
      if (obj[i].opacitytweens.length === 0){
        opacitytween.start();
      }
      else{
        obj[i].opacitytweens[obj[i].opacitytweens.length - 1].chain(opacitytween);          
      }
       
      obj[i].opacitytweens.push(opacitytween); 
    }  
    
    return;
  }
  else{
  
    opts.object = obj.material;
    
    opts.extraOnComplete = function(object, tween){
      this.opacitytweens.shift();
    }.bind(obj);
   
    var opacitytween = tween(opts);
     
    if (typeof obj.opacitytweens === 'undefined') obj.opacitytweens = [];  
    if (obj.opacitytweens.length === 0){
      opacitytween.start();
    }
    else{
      obj.opacitytweens[obj.opacitytweens.length - 1].chain(opacitytween);          
    }
     
    obj.opacitytweens.push(opacitytween);

    return obj;
  }
}

function fadeOut(opts){return fadeout(opts)}
function fadeout(opts){
  if (typeof opts === 'undefined') return false;
  if (!undef(opts.object)) var obj = opts.object;
  else if (!undef(opts.objects)) var obj = opts.objects;
  opts.to = {opacity: 0};
  
  if (Array.isArray(obj)){

    for (var i=0; i < obj.length; i++){
      opts.object = obj[i].material;
      opts.extraOnComplete = function(object, tween){
        this.opacitytweens.shift();
      }.bind(obj[i]);
      
      var opacitytween = tween(opts);
      
      if (typeof obj[i].opacitytweens === 'undefined') obj[i].opacitytweens = [];  
      if (obj[i].opacitytweens.length === 0){
        opacitytween.start();
      }
      else{
        obj[i].opacitytweens[obj[i].opacitytweens.length - 1].chain(opacitytween);          
      }
       
      obj[i].opacitytweens.push(opacitytween); 
    }  
    
    return;
  }
  else{
  
    opts.object = obj.material;
    
    opts.extraOnComplete = function(object, tween){
      this.opacitytweens.shift();
    }.bind(obj);
   
    var opacitytween = tween(opts);
     
    if (typeof obj.opacitytweens === 'undefined') obj.opacitytweens = [];  
    if (obj.opacitytweens.length === 0){
      opacitytween.start();
    }
    else{
      obj.opacitytweens[obj.opacitytweens.length - 1].chain(opacitytween);          
    }
     
    obj.opacitytweens.push(opacitytween);

    return obj;
  }
}

function fade(opts){
  if (typeof opts === 'undefined') return false;
  if (!undef(opts.object)) var obj = opts.object;
  else if (!undef(opts.objects)) var obj = opts.objects;
  
  if (Array.isArray(obj)){

    for (var i=0; i < obj.length; i++){
      opts.object = obj[i].material;
      opts.extraOnComplete = function(object, tween){
        this.opacitytweens.shift();
      }.bind(obj[i]);
      
      var opacitytween = tween(opts);
      
      if (typeof obj[i].opacitytweens === 'undefined') obj[i].opacitytweens = [];  
      if (obj[i].opacitytweens.length === 0){
        opacitytween.start();
      }
      else{
        obj[i].opacitytweens[obj[i].opacitytweens.length - 1].chain(opacitytween);          
      }
       
      obj[i].opacitytweens.push(opacitytween); 
    }  
    
    return;
  }
  else{
  
    opts.object = obj.material; 
    
    opts.extraOnComplete = function(object, tween){
      this.opacitytweens.shift();
    }.bind(obj);
   
    var opacitytween = tween(opts);
     
    if (typeof obj.opacitytweens === 'undefined') obj.opacitytweens = [];  
    if (obj.opacitytweens.length === 0){
      opacitytween.start();
    }
    else{
      obj.opacitytweens[obj.opacitytweens.length - 1].chain(opacitytween);          
    }
     
    obj.opacitytweens.push(opacitytween);

    return obj;
  }
}

function killTweens(obj){
  //WARNING TODO: killtweens seems to cause update loop error 
  //in main TWEEN update where numTweens is > than _tweens.length
  //if killTweens is called in onComplete of tween (or maybe at all)
  if (!obj) return;

  if (obj.positiontween){
    stopMoving(obj);
  }
  if (obj.rotationtween){
    stopRotating(obj);
  } 
  if (obj.opacitytween){
    stopFading(obj);
  }
  return obj;
}

function pauseTweens(obj){
  if (!obj) return;

  if (obj.positiontween){
    pauseMoving(obj);
  }
  if (obj.rotationtween){
    pauseRotating(obj);
  }
  if (obj.opacitytween){
    resumeRotating(obj);
  }
  return obj;
}

function resumeTweens(obj){
	if (!obj) return;

	if (obj.positiontween){
		resumeMoving(obj);
	}
	if (obj.rotationtween){
		resumeRotating(obj);
	}
	if (obj.opacitytween){
		resumeFading(obj);
	}
	return obj;
}

function stopMoving(obj){
	for(var i = 0; i < obj.positiontweens.length; i++){
		obj.positiontweens[i].stop();
	}
	obj.positiontweens = [];

	return obj;
}
function pauseMoving(obj){
	for(var i = 0; i < obj.positiontweens.length; i++){
		obj.positiontweens[i].pause();
	}

	return obj;
}
function resumeMoving(obj){
	for(var i = 0; i < obj.positiontweens.length; i++){
		obj.positiontweens[i].resume();
	}

	return obj;
}
function stopRotating(obj){
	for(var i = 0; i < obj.rotationtweens.length; i++){
		obj.rotationtweens[i].stop();
	}
	obj.rotationtweens = [];

	return obj;
}
function pauseRotating(obj){
	for(var i = 0; i < obj.rotationtweens.length; i++){
		obj.rotationtweens[i].pause();
	}

	return obj;
}
function resumeRotating(obj){
	for(var i = 0; i < obj.rotationtweens.length; i++){
		obj.rotationtweens[i].resume();
	}
  
	return obj;
}
function stopFading(obj){
	for(var i = 0; i < obj.opacitytweens.length; i++){
		obj.opacitytweens[i].stop();
	}
	obj.opacitytweens = [];

	return obj;
}
function pauseFading(obj){
	for(var i = 0; i < obj.opacitytweens.length; i++){
		obj.opacitytweens[i].pause();
	}

	return obj;
}
function resumeFading(obj){
	for(var i = 0; i < obj.opacitytweens.length; i++){
		obj.opacitytweens[i].resume();
	}

	return obj;
}	

function tween(opts){

	if ((undef(opts.object) && undef(opts.objects)) || undef(opts.to)) return false;
	if (!undef(opts.object)) var obj = opts.object;
	else if (!undef(opts.objects)) var obj = opts.objects;
  
	var time = (!undef(opts.time)) ? opts.time : 1;
	var delay = (!undef(opts.delay)) ? opts.delay : 0;
	var ease = (!undef(opts.ease)) ? opts.ease : TWEEN.Easing.Linear.None;
  
	var map = {};
	if (!undef(opts.map)) map = opts.map; 
	if (!undef(opts.to)) map = opts.to; 
  
	var interp = (!undef(opts.interpolation)) ? opts.interpolation : false;
	if (interp === "linear") interp = TWEEN.Interpolation.Linear;
	if (interp === "bezier") interp = TWEEN.Interpolation.Bezier;
	if (interp === "through" || interp === "thru") interp = TWEEN.Interpolation.CatmullRom;
  
	var onstart = (typeof opts.onStart !== 'undefined') ? opts.onStart : noop; 
	var onupdate = (typeof opts.onUpdate !== 'undefined') ? opts.onUpdate : noop;
	var oncomplete = (typeof opts.onComplete !== 'undefined') ? opts.onComplete : noop;
	var extraoncomplete = (typeof opts.extraOnComplete !== 'undefined') ? opts.extraOnComplete : noop;
	var onrepeat = (typeof opts.onRepeat !== 'undefined') ? opts.onRepeat : noop;
  
	var updateall = opts.hasOwnProperty('updateall') ? opts.updateall : false;
  
	var onbegin = function(object, tween){
		offsetprops(object, tween);
		tween.__onstart(object, tween);  
	};
	var onfinish = function(object, tween){
		tween.__oncomplete(object, tween);
		tween.__extraoncomplete(object, tween);  
	};
	var onagain = function(object, tween){
		offsetprops(object, tween);
		tween.__onrepeat(object, tween);  
	};
	var onrunning = function(object, tween){
		tween.__onupdate(object, tween);  
	};

	if (Array.isArray(obj)){
		for (var i = 0; i < obj.length; i++){
			var tween = new TWEEN.Tween(obj[i]).to(map, time*1000).delay(delay*1000).easing(ease);
			if (interp) tween.interpolation(interp);
			tween.__map = map; 
			tween.__onstart = onstart;
			tween.__onupdate = onupdate;
			tween.__oncomplete = oncomplete;
			tween.__extraoncomplete = extraoncomplete;
			tween.__onrepeat = onrepeat;
			tween.onStart(onbegin);
			tween.onRepeat(onagain);
			if (i==0) tween.onUpdate(onupdate);
			else if (updateall) tween.onUpdate(onupdate);
			tween.onComplete(onfinish);
			if (!undef(opts.repeat)) tween.repeat(opts.repeat);
			if (opts.begin) tween.start();
		}  
	}
	else {
		var tween = new TWEEN.Tween(obj).to(map, time*1000).delay(delay*1000).easing(ease);
		if (interp) tween.interpolation(interp);
		tween.__map = map; 
		tween.__onstart = onstart;
		tween.__onupdate = onupdate;
		tween.__oncomplete = oncomplete;
		tween.__extraoncomplete = extraoncomplete;
		tween.__onrepeat = onrepeat;
		tween.onStart(onbegin);
		tween.onRepeat(onagain);
		tween.onUpdate(onrunning);
		tween.onComplete(onfinish);
		if (!undef(opts.repeat)) tween.repeat(opts.repeat);
		if (opts.begin) tween.start();
	}
		
	return tween;
	
}

function offsetprops(object, tween){

	var oldmap = tween.__map;
	var props = listprops(tween.__map);
	var values = listvalues(tween.__map);
	var newmap = {};

	var i = 0;
	for( var prop in tween.__map ) {
    
		if( tween.__map.hasOwnProperty( prop ) ) {
			if (prop.indexOf('offset') !== -1){     
				var nstr = prop.replace('offset','');        
				if (Array.isArray(oldmap[prop])){
					var ostate = 0;
					newmap[nstr] = [];
					var tempmap = values[i];         
					for (var j = 1; j < oldmap[prop].length; j++){
						if (!undef(tempmap[j])){
							ostate += tempmap[j];
							newmap[nstr].push(object[nstr] + ostate);
						}           
					}              
				} 
				else if (!undef(oldmap[prop])) newmap[nstr] = object[nstr] + values[i];
			}
			else newmap[props[i]] = values[i]; 
		}
		i++;
	}
    
	tween.adjust(newmap);
	
}

function listprops(obj) {
    var proparray = [];
    for( var prop in obj ) {
        if( obj.hasOwnProperty( prop ) ) {
             proparray.push(prop);
        }
    }
    return proparray;
}

function listvalues(obj) {
    var valuearray = [];
    for( var prop in obj ) {
        if( obj.hasOwnProperty( prop ) ) {
             valuearray.push(obj[prop]);
        }
    }
    return valuearray;
}

function travelPhysicsSpline(opts){
    if (!opts) return false;
    var delta = opts.delta || 32;
    //var spline = new Spline({points: opts.points,
                    // duration: opts.duration, sharpness: opts.roundness});
    
    var stuff = [opts, spline, delta];
    var interv = runInterval(function (arr){
        var vect = arr[1].pos(arr[1].currenttime);
        arr[0].position.x = vect.x;
        arr[0].position.y = vect.y;
        arr[1].currenttime += arr[2]; 
        if (arr[1].currenttime >= arr[1].duration) this.stop();
    }, stuff, delta);
    return interv;
}

function pmoveto(opts){
	tolog('pmoveto');
	//move along spline or in line
	//give up if giveup true after timer
  
	if (undef(opts)) return false;
	if (undef(opts.object)) return false;
	var obj = opts.object;
  
	//if (!undef(opts.objects)) obj = opts.objects;
  
	var giveup = (!undef(opts.giveup)) ? opts.giveup : false;
	var maxspeed = (!undef(opts.maxspeed)) ? opts.maxspeed : 1;
	var slowdown = (!undef(opts.slowdown)) ? opts.slowdown : false; //on arrival
	var time = (!undef(opts.time)) ? opts.time : 1;
	var delay = (!undef(opts.delay)) ? opts.delay : 0;
	var spline = (!undef(opts.spline)) ? opts.spline : false;
  
	var x = (!undef(opts.offsetx)) ? opts.offsetx : 0;
	var y = (!undef(opts.offsety)) ? opts.offsety : 0;
	//var z = (!undef(opts.offsetz)) opts.offsetz : 0;
	if (!undef(opts.x)) x = opts.x;//-opts.x + obj.position.x;
	if (!undef(opts.y)) y = opts.y;//-opts.y + obj.position.y;
	//if (!undef(opts.z)) z = opts.z - opts.position.z;
  
	if (spline){
		
	}
	else {
		obj.physicsbody.ApplyForce(new b2v2(x,y), obj.physicsbody.GetWorldCenter());
	} 
  
}

function protateto(opts){ 
  
}

function toDegrees (angle) {
  return angle * (180 / Math.PI);
}

function waitfor(condition, func, delta){
	if (undef(delta)) delta = 1000;
	if (condition() === true){
		func();
	}
	else runTimeout(waitfor(condition, func, delta), delta);

}

THREE.ColorConverter = {

	setHSV: function ( color, h, s, v ) {

		// https://gist.github.com/xpansive/1337890#file-index-js
		color.setHSL( h, ( s * v ) / ( ( h = ( 2 - s ) * v ) < 1 ? h : ( 2 - h ) ), h * 0.5 );

	},

	getHSV: function( color ) {

		var hsl = color.getHSL();

		// based on https://gist.github.com/xpansive/1337890#file-index-js
		hsl.s *= ( hsl.l < 0.5 ) ? hsl.l : ( 1 - hsl.l );

		return {
			h: hsl.h,
			s: 2 * hsl.s / ( hsl.l + hsl.s ),
			v: hsl.l + hsl.s
		};
	},

	// where c, m, y, k is between 0 and 1
	
	setCMYK: function ( color, c, m, y, k ) {

		var r = ( 1 - c ) * ( 1 - k );
		var g = ( 1 - m ) * ( 1 - k );
		var b = ( 1 - y ) * ( 1 - k );

		return color.setRGB( r, g, b );

	},

	getCMYK: function ( color ) {

		var r = color.r;
		var g = color.g;
		var b = color.b;
		var k = 1 - Math.max(r, g, b);
		var c = ( 1 - r - k ) / ( 1 - k );
		var m = ( 1 - g - k ) / ( 1 - k );
		var y = ( 1 - b - k ) / ( 1 - k );

		return {
			c: c, m: m, y: y, k: k
		};

	}
};