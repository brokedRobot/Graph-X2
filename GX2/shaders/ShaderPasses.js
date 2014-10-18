/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.RenderPass = function ( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

	this.scene = scene;
	this.camera = camera;

	this.overrideMaterial = overrideMaterial;

	this.clearColor = clearColor;
	this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 1;

	this.oldClearColor = new THREE.Color();
	this.oldClearAlpha = 1;

	this.enabled = true;
	this.clear = true;
	this.needsSwap = false;

};

THREE.RenderPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		this.scene.overrideMaterial = this.overrideMaterial;

		if ( this.clearColor ) {

			this.oldClearColor.copy( renderer.getClearColor() );
			this.oldClearAlpha = renderer.getClearAlpha();

			renderer.setClearColor( this.clearColor, this.clearAlpha );

		}

		renderer.render( this.scene, this.camera, readBuffer, this.clear );

		if ( this.clearColor ) {

			renderer.setClearColor( this.oldClearColor, this.oldClearAlpha );

		}

		this.scene.overrideMaterial = null;

	}

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
 */

THREE.CopyShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"opacity":  { type: "f", value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float opacity;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel = texture2D( tDiffuse, vUv );",
			"gl_FragColor = opacity * texel;",

		"}"

	].join("\n")

};

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.ShaderPass = function ( shader, textureID ) {

	this.textureID = ( textureID !== undefined ) ? textureID : "tDiffuse";

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	this.material = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	this.renderToScreen = false;

	this.enabled = true;
	this.needsSwap = true;
	this.clear = false;

};

THREE.ShaderPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		//this.uniforms[ "time" ].value += delta;

		if ( this.uniforms[ this.textureID ] ) {

			this.uniforms[ this.textureID ].value = readBuffer;

		}

		THREE.EffectComposer.quad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera );

		} else {

			renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera, writeBuffer, this.clear );

		}

	}

};

/**
 * @author brokedRobot / http://prismshards.com/
 *
 * dilate motion blur implementation
 */

THREE.DilateMotionShader = {

	uniforms: {

		"tDiffuse": {type: "t", value: null},
		"vector":  {type: "v2", value: new THREE.Vector2(0.0, 0.0)},
		"iResolution":  {type: "v3", value: new THREE.Vector3(2*0.50, 2*0.50, 1.0)},
		"passes":  {type: "i", value: 1},
		"time": { type: "f", value: 0.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			//"vUv = (uv - 0.5) * 2.0;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [
	
		"varying vec2 vUv;",
		"uniform float time;",
		"uniform vec2 vector;",
		"uniform vec3 iResolution;",
		"uniform sampler2D tDiffuse;",
				
		"const int nSamples = 64;",

		"vec2 rotate(vec2 v, float t)",
		"{",
			"float ct = cos(t);",
			"float st = sin(t);",
			"return vec2(ct*v.x-st*v.y,st*v.x+ct*v.y);",
			//"return v;",
		"}",
				
		"vec2 transform(float time, vec2 offset)",
		"{",
			//"time = 0.0;",
			"vec2 mid = vec2(0.5, 0.5);",
			//"return mid+offset;",
			"return rotate(vec2(cos(time)*0.02, sin(time)*0.02) + \
				offset - mid, sin(time))*(0.0*cos(time)/2.0 + 1.0) + mid;",
			
			//"return vec2(cos(time)*0.02, sin(time)*0.02) + \
				//offset;", //drunk
			
			//"return vec2(time*0.02, time*0.02) + offset;",
			//"return (vector*time*0.01 + offset);",
		"}",

		"const float TIMESHIFT = 1.0;",
			
		"const float TIME0 = 0.0/6.0;",
		"const float TIME1 = 3.0/6.0;",
		"const float TIME2 = 6.0/6.0;",
		"const float TIME3 = 9.0/6.0;",
		"const float TIME4 = 12.0/6.0;",

		"const float WEIGHT01 = 2.0;",
		"const float WEIGHT12 = 3.0;",
		"const float WEIGHT23 = 2.0;",
		"const float WEIGHT34 = 1.0;",

		"const vec3 LUMINANCE = vec3(0.213, 0.715, 0.072);",

		"void main(void)",
		"{",
			"vec2 offset = vUv.xy / iResolution.xy;",

			"vec3 timeTex = texture2D(tDiffuse, offset).xyz;",
			"float timeOffset = (time)+dot(LUMINANCE, timeTex)*TIMESHIFT;",

			"offset.y -= 0.5;",
			"offset.y *= iResolution.y / iResolution.x;",
			"offset.y += 0.5;",
			
			// time offsets 
			///*
			"vec2 uv0 = transform(timeOffset-TIME0, offset);",
			"vec2 uv1 = transform(timeOffset-TIME1, offset);",
			"vec2 uv2 = transform(timeOffset-TIME2, offset);",
			"vec2 uv3 = transform(timeOffset-TIME3, offset);",
			"vec2 uv4 = transform(timeOffset-TIME4, offset);",
			//*/
			/*
			"vec2 uv0 = vec2(0.0, 0.1);",
			"vec2 uv1 = vec2(0.0, 0.2);",
			"vec2 uv2 = vec2(0.0, 0.3);",
			"vec2 uv3 = vec2(0.0, 0.4);",
			"vec2 uv4 = vec2(0.0, 0.5);",
			*/
			"vec2 delta01 = uv1-uv0;",
			"vec2 delta12 = uv2-uv1;",
			"vec2 delta23 = uv3-uv2;",
			"vec2 delta34 = uv4-uv3;",

			"delta01 /= float(nSamples/4);",
			"delta12 /= float(nSamples/4);",
			"delta23 /= float(nSamples/4);",
			"delta34 /= float(nSamples/4);",
			
			"vec3 col01 = texture2D(tDiffuse,uv0).xyz;",
			"for(int i=1; i<nSamples/4; i++)",
			"{",
				"uv0 += delta01;",
				"col01 += texture2D(tDiffuse,uv0).xyz;",
			"}",

			"vec3 col12 = texture2D(tDiffuse,uv1).xyz;",
			"for(int i=1; i<nSamples/4; i++)",
			"{",
				"uv1 += delta12;",
				"col12 += texture2D(tDiffuse,uv1).xyz;",
			"}",

			"vec3 col23 = texture2D(tDiffuse,uv2).xyz;",
			"for(int i=1; i<nSamples/4; i++)",
			"{",
				"uv2 += delta23;",
				"col23 += texture2D(tDiffuse,uv2).xyz;",
			"}",
			
			"vec3 col34 = texture2D(tDiffuse,uv3).xyz;",
			"for(int i=1; i<nSamples/4; i++)",
			"{",
				"uv3 += delta34;",
				"col34 += texture2D(tDiffuse,uv3).xyz;",
			"}",

			"vec3 col = col01*WEIGHT01 + col12*WEIGHT12 + \
				col23*WEIGHT23 + col34*WEIGHT34;",
			"col /= (WEIGHT01+WEIGHT12+WEIGHT23+WEIGHT34)*float(nSamples/4);",
			
			"gl_FragColor = vec4(mix(col,timeTex,dot(LUMINANCE,col)),1.0);",
			//"gl_FragColor = vec4(col,1.0);",
			//"gl_FragColor = vec4(texture2D(tDiffuse,vUv).xyz,1.0);",
		"}",

	].join("\n")

};

/**
 * @author brokedRobot / http://prismshards.com/
 *
 * simple motion blur implementation
 */

THREE.VectorMotionShader = {

	uniforms: {

		"tDiffuse": {type: "t", value: null},
		"vector":  {type: "v2", value: new THREE.Vector2(0.0, 0.0)},
		"passes":  {type: "i", value: 1}

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform int passes;",	
		"uniform vec2 vector;",
		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",
 
			"vec4 color = texture2D(tDiffuse, vUv);", 
			
			"vec2 nvUv = vUv + vector;", 
			"const int maxSteps = 20;", 
			"int steps = 1;", 
			
			"for (int i = 1; i < maxSteps; i++){", 
			 
				"if(i == passes)",
					"break;",
					
				"vec4 currentColor = texture2D(tDiffuse, nvUv);", 
				"nvUv += vector;",
				  
				"color += currentColor;", 
 
			"}",  
			  
			"vec4 finalColor = color / float(passes);",
			
			"gl_FragColor = finalColor;",

		"}"

	].join("\n")

};

// by srtuss, 2013
// was trying to find some sort of "mechanical" fractal for texture/heightmap
// generation, but then i ended up with this.

THREE.ElectricShader = {
	uniforms: {
		"iResolution": { type: "v3", value: new THREE.Vector3(0.0015,0.0015,0.25) },
		"time": { type: "f", value: 0.0 }
	},

	vertexShader: [
		"uniform float time;",
		"uniform vec3 iResolution;",
		"varying vec2 vUv;",
		"void main() {",
		"vUv = uv/1.0;",
		"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"
	].join("\n"),

	fragmentShader: '\
		uniform float time;\
		uniform vec3 iResolution;\
		varying vec2 vUv;\
		vec2 rotate(vec2 p, float a)\
		{\
			return vec2(p.x * cos(a) - p.y * sin(a), p.x * sin(a) + p.y * cos(a));\
		}\
\
		float rand(float n)\
		{\
			return fract(sin(n) * 43758.5453123);\
		}\
\
		vec2 rand2(in vec2 p)\
		{\
			return fract(vec2(sin(p.x * 591.32 + p.y * 154.077), cos(p.x * 391.32 + p.y * 49.077)));\
		}\
\
		float noise1(float p)\
		{\
			float fl = floor(p);\
			float fc = fract(p);\
			return mix(rand(fl), rand(fl + 1.0), fc);\
		}\
\
		float voronoi(in vec2 x)\
		{\
			vec2 p = floor(x);\
			vec2 f = fract(x);\
			\
			vec2 res = vec2(8.0);\
			for(int j = -1; j <= 1; j ++)\
			{\
				for(int i = -1; i <= 1; i ++)\
				{\
					vec2 b = vec2(i, j);\
					vec2 r = vec2(b) - f + rand2(p + b);\
					\
					float d = max(abs(r.x), abs(r.y));\
					\
					if(d < res.x)\
					{\
						res.y = res.x;\
						res.x = d;\
					}\
					else if(d < res.y)\
					{\
						res.y = d;\
					}\
				}\
			}\
			return res.y - res.x;\
		}\
		float flicker = noise1(time * 2.0) * 0.8 + 0.4;\
		\
		void main(void)\
		{\
			vec2 uvb = vUv.xy;\
			uvb = (uvb - 0.5) * 2.0;\
			vec2 suv = uvb;\
			uvb.x *= iResolution.x / iResolution.y;\
			\
			float v = 0.0;\
			\
			uvb *= 0.9 + sin(time * 0.1) * 0.4;\
			uvb = rotate(uvb, sin(time * 0.3) * 1.0);\
			uvb += time * 0.4;\
			\
			float a = 0.6, f = 1.0;\
			\
			for(int i = 0; i < 3; i ++)\
			{\
				float v1 = voronoi(uvb * f + 5.0);\
				float v2 = 0.0;\
				\
				if(i > 0)\
				{\
					v2 = voronoi(uvb * f * 0.5 + 50.0 + time);\
					\
					float va = 0.0, vb = 0.0;\
					va = 1.0 - smoothstep(0.0, 0.1, v1);\
					vb = 1.0 - smoothstep(0.0, 0.08, v2);\
					v += a * pow(va * (0.5 + vb), 2.0);\
				}\
				\n\
				v1 = 1.0 - smoothstep(0.0, 0.3, v1);\
				\
				v2 = a * (noise1(v1 * 5.5 + 0.1));\
				\
				if(i == 0)\
					v += v2 * flicker;\
				else\
					v += v2;\
				\
				f *= 3.0;\
				a *= 0.7;\
			}\
			v *= exp(-0.6 * length(suv)) * 1.2;\
			\
			/*use texture channel0 for color? why not.\
			vec3 cexp = texture2D(iChannel0, uvb * 0.001).xyz * 3.0 + texture2D(iChannel0, uvb * 0.01).xyz;//vec3(1.0, 2.0, 4.0);\
			cexp *= 1.4;*/\
			\
			vec3 cexp = vec3(6.0, 4.0, 2.0);\
			\
			vec3 col = vec3(pow(v, cexp.x), pow(v, cexp.y), pow(v, cexp.z)) * 2.0;\
			\
			gl_FragColor = vec4(col, 1.0);\
		}\
	'}

THREE.BlobsShader = {
	uniforms: {
		"iResolution": { type: "v3", value: new THREE.Vector3(0.25,0.25,0.25) },
		"time": { type: "f", value: 0.0 }
	},

	vertexShader: [
		"uniform float time;",
		"uniform vec3 iResolution;",
		"varying vec2 vUv;",
		"void main() {",
		"vUv = uv/4.0;",
		"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"
	].join("\n"),

	fragmentShader: '\
\
		uniform float time;\
		uniform vec3 iResolution;\
		varying vec2 vUv;\
\
		float makePoint(float x,float y,float fx,float fy,float sx,float sy,float t){\
		   float xx=x+sin(t*fx)*sx;\
		   float yy=y+cos(t*fy)*sy;\
		   return 1.0/sqrt(xx*xx+yy*yy);\
		}\
\
		void main( void ) {\
\
			float timeb = time/1.25;\
		   vec2 p=(vUv.xy/iResolution.x)*2.0-vec2(1.0,iResolution.y/iResolution.x);\
\
		   p=p*2.0;\
		   \
		   float x=p.x;\
		   float y=p.y;\
\
		   float a=\
			   makePoint(x,y,3.3,2.9,0.3,0.3,timeb);\
		   a=a+makePoint(x,y,1.9,2.0,0.4,0.4,timeb);\
		   a=a+makePoint(x,y,0.8,0.7,0.4,0.5,timeb);\
		   a=a+makePoint(x,y,2.3,0.1,0.6,0.3,timeb);\
		   a=a+makePoint(x,y,0.8,1.7,0.5,0.4,timeb);\
		   a=a+makePoint(x,y,0.3,1.0,0.4,0.4,timeb);\
		   a=a+makePoint(x,y,1.4,1.7,0.4,0.5,timeb);\
		   a=a+makePoint(x,y,1.3,2.1,0.6,0.3,timeb);\
		   a=a+makePoint(x,y,1.8,1.7,0.5,0.4,timeb);\
		   \
		   float b=\
			   makePoint(x,y,1.2,1.9,0.3,0.3,timeb);\
		   b=b+makePoint(x,y,0.7,2.7,0.4,0.4,timeb);\
		   b=b+makePoint(x,y,1.4,0.6,0.4,0.5,timeb);\
		   b=b+makePoint(x,y,2.6,0.4,0.6,0.3,timeb);\
		   b=b+makePoint(x,y,0.7,1.4,0.5,0.4,timeb);\
		   b=b+makePoint(x,y,0.7,1.7,0.4,0.4,timeb);\
		   b=b+makePoint(x,y,0.8,0.5,0.4,0.5,timeb);\
		   b=b+makePoint(x,y,1.4,0.9,0.6,0.3,timeb);\
		   b=b+makePoint(x,y,0.7,1.3,0.5,0.4,timeb);\
\
		   float c=\
			   makePoint(x,y,3.7,0.3,0.3,0.3,timeb);\
		   c=c+makePoint(x,y,1.9,1.3,0.4,0.4,timeb);\
		   c=c+makePoint(x,y,0.8,0.9,0.4,0.5,timeb);\
		   c=c+makePoint(x,y,1.2,1.7,0.6,0.3,timeb);\
		   c=c+makePoint(x,y,0.3,0.6,0.5,0.4,timeb);\
		   c=c+makePoint(x,y,0.3,0.3,0.4,0.4,timeb);\
		   c=c+makePoint(x,y,1.4,0.8,0.4,0.5,timeb);\
		   c=c+makePoint(x,y,0.2,0.6,0.6,0.3,timeb);\
		   c=c+makePoint(x,y,1.3,0.5,0.5,0.4,timeb);\
		   \
		   vec3 d=vec3(a,b,c)/32.0;\
		   \
		   gl_FragColor = vec4(d.x,d.y,d.z,1.0);\
		}\
	'}
	
THREE.Sky1Shader = {
	uniforms: {
		"iResolution": { type: "v3", value: new THREE.Vector3(300*1.8,300*1.8,1) },
		"iMouse": { type: "v3", value: new THREE.Vector3(300*1.8,300*1.8,1) },
		"time": { type: "f", value: 0.0 },
		"angle": { type: "v3", value: new THREE.Vector3(200,100,10) },
		"windspeed": { type: "f", value: 0.3 },
		"morphspeed": { type: "f", value: 0.12 },
		"lightcolor": { type: "v3", value: new THREE.Vector3(2.8,2.3,0.7) },
		"darkcolor": { type: "v3", value: new THREE.Vector3(.5,.55,.7) },
		"skycolor": { type: "v3", value: new THREE.Vector3(0.2,0.46,0.8) }
	},

	vertexShader: [
		"uniform float time;",
		"uniform vec3 iResolution;",
		"varying vec2 vUv;",
		"void main() {",
		"vUv = uv/1.0;",
		"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"
	].join("\n"),

	fragmentShader: [
		"uniform float time;",
		"uniform vec3 iResolution;",
		"uniform vec3 iMouse;",
		"varying vec2 vUv;",
		"",
		"const int quality = 14;",
		"const int illum_quality = 2;",
		"const int noise_use_smoothstep = 0;",
		"",
		"uniform float windspeed;",
		"uniform float morphspeed;",
		"",
		"float density_modifier = 0.00;",
		"float density_osc_amp = 0.04;",
		"float density_osc_freq = 0.07;",
		"",
		"uniform vec3 lightcolor;",
		"uniform vec3 darkcolor;",
		"uniform vec3 skycolor;",
		"",
		"float hash(float x)",
		"{",
			"return fract(sin(x*.0127863)*17143.321);",
		"}",
		"",
		"float hash(vec2 x)",
		"{",
			"return fract(cos(dot(x.xy,vec2(2.31,53.21))*124.123)*412.0); ",
		"}",
		"",
		"float hashmix(float x0, float x1, float interp)",
		"{",
			"x0 = hash(x0);",
			"x1 = hash(x1);",
			"if (noise_use_smoothstep==1)",
				"interp = smoothstep(0.0,1.0,interp);",
			"return mix(x0,x1,interp);",
		"}",
		"",
		"float hashmix(vec2 p0, vec2 p1, vec2 interp)",
		"{",
			"float v0 = hashmix(p0[0]+p0[1]*128.0,p1[0]+p0[1]*128.0,interp[0]);",
			"float v1 = hashmix(p0[0]+p1[1]*128.0,p1[0]+p1[1]*128.0,interp[0]);",
			"if (noise_use_smoothstep==1)",
				"interp = smoothstep(vec2(0.0),vec2(1.0),interp);",
			"return mix(v0,v1,interp[1]);",
		"}",
		"",
		"float hashmix(vec3 p0, vec3 p1, vec3 interp)",
		"{",
			"float v0 = hashmix(p0.xy+vec2(p0.z*143.0,0.0),p1.xy+vec2(p0.z*143.0,0.0),interp.xy);",
			"float v1 = hashmix(p0.xy+vec2(p1.z*143.0,0.0),p1.xy+vec2(p1.z*143.0,0.0),interp.xy);",
			"if (noise_use_smoothstep==1)",
				"interp = smoothstep(vec3(0.0),vec3(1.0),interp);",
			"return mix(v0,v1,interp[2]);",
		"}",
		"",
		"float hashmix(vec4 p0, vec4 p1, vec4 interp)",
		"{",
			"float v0 = hashmix(p0.xyz+vec3(p0.w*17.0,0.0,0.0),p1.xyz+vec3(p0.w*17.0,0.0,0.0),interp.xyz);",
			"float v1 = hashmix(p0.xyz+vec3(p1.w*17.0,0.0,0.0),p1.xyz+vec3(p1.w*17.0,0.0,0.0),interp.xyz);",
			"if (noise_use_smoothstep==1)",
				"interp = smoothstep(vec4(0.0),vec4(1.0),interp);",
			"return mix(v0,v1,interp[3]);",
		"}",
		"",
		"float noise(float p)",
		"{",
			"float pm = mod(p,1.0);",
			"float pd = p-pm;",
			"return hashmix(pd,pd+1.0,pm);",
		"}",
		"",
		"float noise(vec2 p)",
		"{",
			"vec2 pm = mod(p,1.0);",
			"vec2 pd = p-pm;",
			"return hashmix(pd,(pd+vec2(1.0,1.0)), pm);",
		"}",
		"",
		"float noise(vec3 p)",
		"{",
			"vec3 pm = mod(p,1.0);",
			"vec3 pd = p-pm;",
			"return hashmix(pd,(pd+vec3(1.0,1.0,1.0)), pm);",
		"}",
		"",
		"float noise(vec4 p)",
		"{",
			"vec4 pm = mod(p,1.0);",
			"vec4 pd = p-pm;",
			"return hashmix(pd,(pd+vec4(1.0,1.0,1.0,1.0)), pm);",
		"}",
		"",
		"vec3 rotate_y(vec3 v, float angle)",
		"{",
			"vec3 vo = v; float cosa = cos(angle); float sina = sin(angle);",
			"v.x = cosa*vo.x - sina*vo.z;",
			"v.z = sina*vo.x + cosa*vo.z;",
			"return v;",
		"}",
		"",
		"vec3 rotate_x(vec3 v, float angle)",
		"{",
			"vec3 vo = v; float cosa = cos(angle); float sina = sin(angle);",
			"v.y = cosa*vo.y - sina*vo.z;",
			"v.z = sina*vo.y + cosa*vo.z;",
			"return v;",
		"}",
		"",
		"vec3 cc(vec3 color, float factor,float factor2)",
		"{",
			"float w = color.x+color.y+color.z;",
			"return mix(color,vec3(w)*factor,w*factor2);",
		"}",
		"",
		"vec3 plane(vec3 p, vec3 d)",
		"{",
			"vec3 n = vec3(.0,1.0,.0);",
			"vec3 p0 = n*4.8;",
			"float f=dot(p0-p,n)/dot(n,d);",
			"if (f>.0)",
			"return p+d*f;",
			"else",
				"return vec3(.0,.0,.0);",
		"}",
		"",
		"vec3 ldir = normalize(vec3(-1.0,-1.0,-1.0));",
		"float timeb = .0;",
		"",
		"float density(vec3 p)",
		"{",
			"if (p.y>15.0) return 0.0;",
			"p.x+=timeb*float(windspeed);",
			"vec4 xp = vec4(p*0.4,time*morphspeed+noise(p));",
			"float nv=pow(pow((noise(xp*2.0)*.5+noise(xp.zx*0.9)*.5),2.0)*2.1,	2.);",
			"nv = max(0.1,nv);",
			"nv = min(0.6,nv);",
			"return nv;",
		"}",
		"",
		"float illumination(vec3 p,float density_coef)",
		"{",
			"vec3 l = ldir;",
			"float il = 1.0;",
			"float ill = 1.0;",
			"",
			"float illum_q_coef = 10.0/float(illum_quality);",
				"",
			"for(int i=0; i<int(illum_quality); i++)",
			"{",
				"il-=density(p-l*hash(p.xy+vec2(il,p.z))*0.5)*density_coef*illum_q_coef;",
				"p-=l*illum_q_coef;",
				"",
				"if (il <= 0.0)",
				"{",
					"il=0.0;",
					"break;",
				"}",
				"if (il == ill)",
				"{",
					"break;",
				"}",
				"ill = il;",
			"}",
			"",
			"return il;",
		"}",
	"",
	"void main(void)",
	"{	",
		//use this if you want camera angle to not matter
		//"vec2 uv = gl_FragCoord.xy / iResolution.xy - 0.5;",
		"vec2 uv = vUv - 0.5;",
		"uv.x *= iResolution.x/iResolution.y;",
		"vec3 mouse = vec3(vec2(iMouse.x,iMouse.y)/2. - 0.5,iMouse.z-.5);",
		"",
		"timeb = time+385.0;",
		"",
		"vec3 p = vec3(.0,.0,.0);",
		"vec3 d = vec3(uv,1.0);",
		"d.z-=length(d)*.2;",
		"",
		"d = rotate_x(d,-1.19-1.0*iMouse.x);",
		"d = rotate_y(d,1.5+-7.0*iMouse.y);",
		"",
		"d = normalize(d);",
		"",
		"float acc = .0;",
		"",
		"p = plane(p,d);",
		"",
		"float illum_acc = 0.0;",
		"float dense_acc = 0.0;",
		"float density_coef =0.13+float(density_modifier)",
			"+sin(time*float(density_osc_freq))*float(density_osc_amp);",
		"float quality_coef = 20.0/float(quality);",
		"",
		"for (int i=0; i<quality; i++)",
		"{",
			"p+=d*quality_coef*.5;",
			"",
			"float nv = density(p+d*hash(uv+vec2(time,dense_acc))*0.25)*density_coef*quality_coef;",
			"",
			"vec3 sp = p;",
			"dense_acc+=nv;",
			"",
			"if (dense_acc>1.0)",
			"{",
				"dense_acc=1.0;",
				"break;",
			"}",
			"",
			"float il = illumination(p,density_coef);",
			"",
			"illum_acc+=max(0.0,nv*il*(1.0-dense_acc));",
			"",
		"}",
		"",
		"d=normalize(d);",
		"",
		"vec3 illum_color = lightcolor*illum_acc*0.50;",
		"",
		"float sun = dot(d,-ldir); sun=.5*sun+.501; sun = pow(sun,400.0);",
		"sun += (pow(dot(d,-ldir)*.5+.5,44.0))*.2;",
		"vec3 sky_color = skycolor*(1.1-d.y*.3)*1.1;",
		"",
		"vec3 dense_color = mix(illum_color,darkcolor,.6)*1.4;",
		"",
		"sky_color=sky_color*(1.0-uv.y*0.2)+vec3(.9,.9,.9)*sun;",
		"",
		"vec3 color = mix(sky_color,(dense_color+illum_color*0.33)*1.0,smoothstep(0.0,1.0,dense_acc)); color-=length(uv)*0.2;",
		"",
		"color+=hash(color.xy+uv)*0.01;",
		"color =cc(color,0.42,0.45);",
		"",
		"gl_FragColor = vec4(color,1.0);",
	"}"].join("\n")
}
	
/**
 * @author felixturner / http://airtight.cc/
 *
 * Bad TV Shader
 * Simulates a bad TV via horizontal distortion and vertical roll
 * Uses Ashima WebGl Noise: https://github.com/ashima/webgl-noise
 *
 * time: steadily increasing float passed in
 * distortion: amount of thick distortion
 * distortion2: amount of fine grain distortion
 * speed: distortion vertical travel speed
 * rollSpeed: vertical roll speed
 */

THREE.BadTVShader = {
	uniforms: {
		"tDiffuse": { type: "t", value: null },
		"time":     { type: "f", value: 0.0 },
		"distortion":     { type: "f", value: 3.0 },
		"distortion2":     { type: "f", value: 5.0 },
		"speed":     { type: "f", value: 0.2 },
		"rollSpeed":     { type: "f", value: 0.1 },
	},

	vertexShader: [
		"varying vec2 vUv;",
		"void main() {",
		"vUv = uv;",
		"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float time;",
		"uniform float distortion;",
		"uniform float distortion2;",
		"uniform float speed;",
		"uniform float rollSpeed;",
		"varying vec2 vUv;",
		
		// Start Ashima 2D Simplex Noise

		"vec3 mod289(vec3 x) {",
		"  return x - floor(x * (1.0 / 289.0)) * 289.0;",
		"}",

		"vec2 mod289(vec2 x) {",
		"  return x - floor(x * (1.0 / 289.0)) * 289.0;",
		"}",

		"vec3 permute(vec3 x) {",
		"  return mod289(((x*34.0)+1.0)*x);",
		"}",

		"float snoise(vec2 v)",
		"  {",
		"  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0",
		"                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)",
		"                     -0.577350269189626,  // -1.0 + 2.0 * C.x",
		"                      0.024390243902439); // 1.0 / 41.0",
		"  vec2 i  = floor(v + dot(v, C.yy) );",
		"  vec2 x0 = v -   i + dot(i, C.xx);",

		"  vec2 i1;",
		"  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);",
		"  vec4 x12 = x0.xyxy + C.xxzz;",
		" x12.xy -= i1;",

		"  i = mod289(i); // Avoid truncation effects in permutation",
		"  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))",
		"		+ i.x + vec3(0.0, i1.x, 1.0 ));",

		"  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);",
		"  m = m*m ;",
		"  m = m*m ;",

		"  vec3 x = 2.0 * fract(p * C.www) - 1.0;",
		"  vec3 h = abs(x) - 0.5;",
		"  vec3 ox = floor(x + 0.5);",
		"  vec3 a0 = x - ox;",

		"  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );",

		"  vec3 g;",
		"  g.x  = a0.x  * x0.x  + h.x  * x0.y;",
		"  g.yz = a0.yz * x12.xz + h.yz * x12.yw;",
		"  return 130.0 * dot(m, g);",
		"}",

		// End Ashima 2D Simplex Noise

		"void main() {",

			"vec2 p = vUv;",
			"float ty = time*speed;",
			"float yt = p.y - ty;",

			//smooth distortion
			"float offset = snoise(vec2(yt*3.0,0.0))*0.2;",
			// boost distortion
			"offset = pow( offset*distortion,3.0)/distortion;",
			//add fine grain distortion
			"offset += snoise(vec2(yt*50.0,0.0))*distortion2*0.001;",
			//combine distortion on X with roll on Y
			"gl_FragColor = texture2D(tDiffuse,  vec2(fract(p.x + offset),fract(p.y-time*rollSpeed) ));",

		"}"

	].join("\n")

};


/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Bleach bypass shader [http://en.wikipedia.org/wiki/Bleach_bypass]
 * - based on Nvidia example
 * http://developer.download.nvidia.com/shaderlibrary/webpages/shader_library.html#post_bleach_bypass
 */

THREE.BleachBypassShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"opacity":  { type: "f", value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float opacity;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 base = texture2D( tDiffuse, vUv );",

			"vec3 lumCoeff = vec3( 0.25, 0.65, 0.1 );",
			"float lum = dot( lumCoeff, base.rgb );",
			"vec3 blend = vec3( lum );",

			"float L = min( 1.0, max( 0.0, 10.0 * ( lum - 0.45 ) ) );",

			"vec3 result1 = 2.0 * base.rgb * blend;",
			"vec3 result2 = 1.0 - 2.0 * ( 1.0 - blend ) * ( 1.0 - base.rgb );",

			"vec3 newColor = mix( result1, result2, L );",

			"float A2 = opacity * base.a;",
			"vec3 mixRGB = A2 * newColor.rgb;",
			"mixRGB += ( ( 1.0 - A2 ) * base.rgb );",

			"gl_FragColor = vec4( mixRGB, base.a );",

		"}"

	].join("\n")

};

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.BloomPass = function( strength, kernelSize, sigma, resolution ) {

	strength = ( strength !== undefined ) ? strength : 1;
	kernelSize = ( kernelSize !== undefined ) ? kernelSize : 25;
	sigma = ( sigma !== undefined ) ? sigma : 4.0;
	resolution = ( resolution !== undefined ) ? resolution : 256;

	// render targets

	var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };

	this.renderTargetX = new THREE.WebGLRenderTarget( resolution, resolution, pars );
	this.renderTargetY = new THREE.WebGLRenderTarget( resolution, resolution, pars );

	// screen material

	var screenShader = THREE.ShaderExtras[ "screen" ];

	this.screenUniforms = THREE.UniformsUtils.clone( screenShader.uniforms );

	this.screenUniforms[ "opacity" ].value = strength;

	this.materialScreen = new THREE.ShaderMaterial( {

		uniforms: this.screenUniforms,
		vertexShader: screenShader.vertexShader,
		fragmentShader: screenShader.fragmentShader,
		blending: THREE.AdditiveBlending,
		transparent: true

	} );

	// convolution material

	var convolutionShader = THREE.ShaderExtras[ "convolution" ];

	this.convolutionUniforms = THREE.UniformsUtils.clone( convolutionShader.uniforms );

	this.convolutionUniforms[ "uImageIncrement" ].value = THREE.BloomPass.blurx;
	this.convolutionUniforms[ "cKernel" ].value = THREE.ShaderExtras.buildKernel( sigma );

	this.materialConvolution = new THREE.ShaderMaterial( {

		uniforms: this.convolutionUniforms,
		vertexShader:   "#define KERNEL_SIZE " + kernelSize + ".0\n" + convolutionShader.vertexShader,
		fragmentShader: "#define KERNEL_SIZE " + kernelSize + "\n"   + convolutionShader.fragmentShader

	} );

	this.enabled = true;
	this.needsSwap = false;
	this.clear = false;

};

THREE.BloomPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {

		if ( maskActive ) renderer.context.disable( renderer.context.STENCIL_TEST );

		// Render quad with blured scene into texture (convolution pass 1)

		THREE.EffectComposer.quad.material = this.materialConvolution;

		this.convolutionUniforms[ "tDiffuse" ].texture = readBuffer;
		this.convolutionUniforms[ "uImageIncrement" ].value = THREE.BloomPass.blurX;

		renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera, this.renderTargetX, true );


		// Render quad with blured scene into texture (convolution pass 2)

		this.convolutionUniforms[ "tDiffuse" ].texture = this.renderTargetX;
		this.convolutionUniforms[ "uImageIncrement" ].value = THREE.BloomPass.blurY;

		renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera, this.renderTargetY, true );

		// Render original scene with superimposed blur to texture

		THREE.EffectComposer.quad.material = this.materialScreen;

		this.screenUniforms[ "tDiffuse" ].texture = this.renderTargetY;

		if ( maskActive ) renderer.context.enable( renderer.context.STENCIL_TEST );

		renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera, readBuffer, this.clear );

	}

};

THREE.BloomPass.blurX = new THREE.Vector2( 0.001953125, 0.0 );
THREE.BloomPass.blurY = new THREE.Vector2( 0.0, 0.001953125 );


/**
 * @author tapio / http://tapio.github.com/
 *
 * Brightness and contrast adjustment
 * https://github.com/evanw/glfx.js
 * brightness: -1 to 1 (-1 is solid black, 0 is no change, and 1 is solid white)
 * contrast: -1 to 1 (-1 is solid gray, 0 is no change, and 1 is maximum contrast)
 */

THREE.BrightnessContrastShader = {

	uniforms: {

		"tDiffuse":   { type: "t", value: null },
		"brightness": { type: "f", value: 0 },
		"contrast":   { type: "f", value: 0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float brightness;",
		"uniform float contrast;",

		"varying vec2 vUv;",

		"void main() {",

			"gl_FragColor = texture2D( tDiffuse, vUv );",

			"gl_FragColor.rgb += brightness;",

			"if (contrast > 0.0) {",
				"gl_FragColor.rgb = (gl_FragColor.rgb - 0.5) / (1.0 - contrast) + 0.5;",
			"} else {",
				"gl_FragColor.rgb = (gl_FragColor.rgb - 0.5) * (1.0 + contrast) + 0.5;",
			"}",

		"}"

	].join("\n")

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Color correction
 */

THREE.ColorCorrectionShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"powRGB":   { type: "v3", value: new THREE.Vector3( 2, 2, 2 ) },
		"mulRGB":   { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform vec3 powRGB;",
		"uniform vec3 mulRGB;",

		"varying vec2 vUv;",

		"void main() {",

			"gl_FragColor = texture2D( tDiffuse, vUv );",
			"gl_FragColor.rgb = mulRGB * pow( gl_FragColor.rgb, powRGB );",

		"}"

	].join("\n")

};


/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Colorify shader
 */

THREE.ColorifyShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"color":    { type: "c", value: new THREE.Color( 0xffffff ) }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform vec3 color;",
		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel = texture2D( tDiffuse, vUv );",

			"vec3 luma = vec3( 0.299, 0.587, 0.114 );",
			"float v = dot( texel.xyz, luma );",

			"gl_FragColor = vec4( v * color, texel.w );",

		"}"

	].join("\n")

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Convolution shader
 * ported from o3d sample to WebGL / GLSL
 * http://o3d.googlecode.com/svn/trunk/samples/convolution.html
 */

THREE.ConvolutionShader = {

	defines: {

		"KERNEL_SIZE_FLOAT": "25.0",
		"KERNEL_SIZE_INT": "25",

	},

	uniforms: {

		"tDiffuse":        { type: "t", value: null },
		"uImageIncrement": { type: "v2", value: new THREE.Vector2( 0.001953125, 0.0 ) },
		"cKernel":         { type: "fv1", value: [] }

	},

	vertexShader: [

		"uniform vec2 uImageIncrement;",

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv - ( ( KERNEL_SIZE_FLOAT - 1.0 ) / 2.0 ) * uImageIncrement;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float cKernel[ KERNEL_SIZE_INT ];",

		"uniform sampler2D tDiffuse;",
		"uniform vec2 uImageIncrement;",

		"varying vec2 vUv;",

		"void main() {",

			"vec2 imageCoord = vUv;",
			"vec4 sum = vec4( 0.0, 0.0, 0.0, 0.0 );",

			"for( int i = 0; i < KERNEL_SIZE_INT; i ++ ) {",

				"sum += texture2D( tDiffuse, imageCoord ) * cKernel[ i ];",
				"imageCoord += uImageIncrement;",

			"}",

			"gl_FragColor = sum;",

		"}"


	].join("\n"),

	buildKernel: function ( sigma ) {

		// We lop off the sqrt(2 * pi) * sigma term, since we're going to normalize anyway.

		function gauss( x, sigma ) {

			return Math.exp( - ( x * x ) / ( 2.0 * sigma * sigma ) );

		}

		var i, values, sum, halfWidth, kMaxKernelSize = 25, kernelSize = 2 * Math.ceil( sigma * 3.0 ) + 1;

		if ( kernelSize > kMaxKernelSize ) kernelSize = kMaxKernelSize;
		halfWidth = ( kernelSize - 1 ) * 0.5;

		values = new Array( kernelSize );
		sum = 0.0;
		for ( i = 0; i < kernelSize; ++i ) {

			values[ i ] = gauss( i - halfWidth, sigma );
			sum += values[ i ];

		}

		// normalize the kernel

		for ( i = 0; i < kernelSize; ++i ) values[ i ] /= sum;

		return values;

	}

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Dot screen shader
 * based on glfx.js sepia shader
 * https://github.com/evanw/glfx.js
 */

THREE.DotScreenShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"tSize":    { type: "v2", value: new THREE.Vector2( 256, 256 ) },
		"center":   { type: "v2", value: new THREE.Vector2( 0.5, 0.5 ) },
		"angle":    { type: "f", value: 1.57 },
		"scale":    { type: "f", value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform vec2 center;",
		"uniform float angle;",
		"uniform float scale;",
		"uniform vec2 tSize;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"float pattern() {",

			"float s = sin( angle ), c = cos( angle );",

			"vec2 tex = vUv * tSize - center;",
			"vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;",

			"return ( sin( point.x ) * sin( point.y ) ) * 4.0;",

		"}",

		"void main() {",

			"vec4 color = texture2D( tDiffuse, vUv );",

			"float average = ( color.r + color.g + color.b ) / 3.0;",

			"gl_FragColor = vec4( vec3( average * 10.0 - 5.0 + pattern() ), color.a );",

		"}"

	].join("\n")

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Film grain & scanlines shader
 *
 * - ported from HLSL to WebGL / GLSL
 * http://www.truevision3d.com/forums/showcase/staticnoise_colorblackwhite_scanline_shaders-t18698.0.html
 *
 * Screen Space Static Postprocessor
 *
 * Produces an analogue noise overlay similar to a film grain / TV static
 *
 * Original implementation and noise algorithm
 * Pat 'Hawthorne' Shearon
 *
 * Optimized scanlines + noise version with intensity scaling
 * Georg 'Leviathan' Steinrohder
 *
 * This version is provided under a Creative Commons Attribution 3.0 License
 * http://creativecommons.org/licenses/by/3.0/
 */

THREE.FilmShader = {

	uniforms: {

		"tDiffuse":   { type: "t", value: null },
		"time":       { type: "f", value: 0.0 },
		"nIntensity": { type: "f", value: 0.5 },
		"sIntensity": { type: "f", value: 0.05 },
		"sCount":     { type: "f", value: 4096 },
		"grayscale":  { type: "i", value: 1 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		// control parameter
		"uniform float time;",

		"uniform bool grayscale;",

		// noise effect intensity value (0 = no effect, 1 = full effect)
		"uniform float nIntensity;",

		// scanlines effect intensity value (0 = no effect, 1 = full effect)
		"uniform float sIntensity;",

		// scanlines effect count value (0 = no effect, 4096 = full effect)
		"uniform float sCount;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"float rand(vec2 co){",

    	"return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);",

    	"}",


		"void main() {",

			// sample the source
			"vec4 cTextureScreen = texture2D( tDiffuse, vUv );",

			// make some noise
			// "float x = vUv.x * vUv.y * time *  1000.0;",
			// "x = mod( x, 13.0 ) * mod( x, 123.0 );",
			// "float dx = mod( x, 0.01 );",

			// add noise
			//"vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp( 0.1 + dx * 100.0, 0.0, 1.0 );",
			
			//no noise
			//"vec3 cResult = cTextureScreen.rgb;",

			// "vec2 position = gl_FragCoord.xy - floor(time*4.0);",
			// "vec3 cResult = cTextureScreen.rgb + rand(position.xy)*0.3;",

			// float color = rand( position.xy );

			// gl_FragColor = vec4( color, color, color, 1 );

			//from http://glsl.heroku.com/e#6017.0
			//vec2 position = gl_FragCoord.xy - floor(mouse*resolution);
			//float color = rand( position.xy );
			//gl_FragColor = vec4( color, color, color, 1 );




			//fat noise
			// "float res = 16.0;",
			//  "float xStepped = floor((gl_FragCoord.x + time)*res);",
			//  "float yStepped = floor((gl_FragCoord.y + time)*res);",
			//  "vec3 cResult = cTextureScreen.rgb + vec3(rand(vec2(xStepped,yStepped))-0.5)*0.3;",


			"vec3 cResult = cTextureScreen.rgb;",


			// get us a sine and cosine
			"vec2 sc = vec2( sin( vUv.y * sCount ), cos( vUv.y * sCount ) );",

			// add scanlines
			"cResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * sIntensity;",

			// interpolate between source and result by intensity
			"cResult = cTextureScreen.rgb + clamp( nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );",

			// convert to grayscale if desired
			// "if( grayscale ) {",

			// 	"cResult = vec3( cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11 );",

			// "}",

			"gl_FragColor =  vec4( cResult, cTextureScreen.a );",

		"}"

	].join("\n")

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Film grain & scanlines shader
 *
 * - ported from HLSL to WebGL / GLSL
 * http://www.truevision3d.com/forums/showcase/staticnoise_colorblackwhite_scanline_shaders-t18698.0.html
 *
 * Screen Space Static Postprocessor
 *
 * Produces an analogue noise overlay similar to a film grain / TV static
 *
 * Original implementation and noise algorithm
 * Pat 'Hawthorne' Shearon
 *
 * Optimized scanlines + noise version with intensity scaling
 * Georg 'Leviathan' Steinrohder
 *
 * This version is provided under a Creative Commons Attribution 3.0 License
 * http://creativecommons.org/licenses/by/3.0/
 */

THREE.FilmShader = {

	uniforms: {

		"tDiffuse":   { type: "t", value: null },
		"time":       { type: "f", value: 0.0 },
		"nIntensity": { type: "f", value: 0.5 },
		"sIntensity": { type: "f", value: 0.05 },
		"sCount":     { type: "f", value: 4096 },
		"grayscale":  { type: "i", value: 1 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		// control parameter
		"uniform float time;",

		"uniform bool grayscale;",

		// noise effect intensity value (0 = no effect, 1 = full effect)
		"uniform float nIntensity;",

		// scanlines effect intensity value (0 = no effect, 1 = full effect)
		"uniform float sIntensity;",

		// scanlines effect count value (0 = no effect, 4096 = full effect)
		"uniform float sCount;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"float rand(vec2 co){",

    	"return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);",

    	"}",


		"void main() {",

			// sample the source
			"vec4 cTextureScreen = texture2D( tDiffuse, vUv );",

			// make some noise
			// "float x = vUv.x * vUv.y * time *  1000.0;",
			// "x = mod( x, 13.0 ) * mod( x, 123.0 );",
			// "float dx = mod( x, 0.01 );",

			// add noise
			//"vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp( 0.1 + dx * 100.0, 0.0, 1.0 );",
			
			//no noise
			//"vec3 cResult = cTextureScreen.rgb;",

			// "vec2 position = gl_FragCoord.xy - floor(time*4.0);",
			// "vec3 cResult = cTextureScreen.rgb + rand(position.xy)*0.3;",

			// float color = rand( position.xy );

			// gl_FragColor = vec4( color, color, color, 1 );

			//from http://glsl.heroku.com/e#6017.0
			//vec2 position = gl_FragCoord.xy - floor(mouse*resolution);
			//float color = rand( position.xy );
			//gl_FragColor = vec4( color, color, color, 1 );




			//fat noise
			// "float res = 16.0;",
			//  "float xStepped = floor((gl_FragCoord.x + time)*res);",
			//  "float yStepped = floor((gl_FragCoord.y + time)*res);",
			//  "vec3 cResult = cTextureScreen.rgb + vec3(rand(vec2(xStepped,yStepped))-0.5)*0.3;",


			"vec3 cResult = cTextureScreen.rgb;",


			// get us a sine and cosine
			"vec2 sc = vec2( sin( vUv.y * sCount ), cos( vUv.y * sCount ) );",

			// add scanlines
			"cResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * sIntensity;",

			// interpolate between source and result by intensity
			"cResult = cTextureScreen.rgb + clamp( nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );",

			// convert to grayscale if desired
			// "if( grayscale ) {",

			// 	"cResult = vec3( cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11 );",

			// "}",

			"gl_FragColor =  vec4( cResult, cTextureScreen.a );",

		"}"

	].join("\n")

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Focus shader
 * based on PaintEffect postprocess from ro.me
 * http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
 */

THREE.FocusShader = {

	uniforms : {

		"tDiffuse":       { type: "t", value: null },
		"screenWidth":    { type: "f", value: 1024 },
		"screenHeight":   { type: "f", value: 1024 },
		"sampleDistance": { type: "f", value: 0.94 },
		"waveFactor":     { type: "f", value: 0.00125 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float screenWidth;",
		"uniform float screenHeight;",
		"uniform float sampleDistance;",
		"uniform float waveFactor;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 color, org, tmp, add;",
			"float sample_dist, f;",
			"vec2 vin;",
			"vec2 uv = vUv;",

			"add = color = org = texture2D( tDiffuse, uv );",

			"vin = ( uv - vec2( 0.5 ) ) * vec2( 1.4 );",
			"sample_dist = dot( vin, vin ) * 2.0;",

			"f = ( waveFactor * 100.0 + sample_dist ) * sampleDistance * 4.0;",

			"vec2 sampleSize = vec2(  1.0 / screenWidth, 1.0 / screenHeight ) * vec2( f );",

			"add += tmp = texture2D( tDiffuse, uv + vec2( 0.111964, 0.993712 ) * sampleSize );",
			"if( tmp.b < color.b ) color = tmp;",

			"add += tmp = texture2D( tDiffuse, uv + vec2( 0.846724, 0.532032 ) * sampleSize );",
			"if( tmp.b < color.b ) color = tmp;",

			"add += tmp = texture2D( tDiffuse, uv + vec2( 0.943883, -0.330279 ) * sampleSize );",
			"if( tmp.b < color.b ) color = tmp;",

			"add += tmp = texture2D( tDiffuse, uv + vec2( 0.330279, -0.943883 ) * sampleSize );",
			"if( tmp.b < color.b ) color = tmp;",

			"add += tmp = texture2D( tDiffuse, uv + vec2( -0.532032, -0.846724 ) * sampleSize );",
			"if( tmp.b < color.b ) color = tmp;",

			"add += tmp = texture2D( tDiffuse, uv + vec2( -0.993712, -0.111964 ) * sampleSize );",
			"if( tmp.b < color.b ) color = tmp;",

			"add += tmp = texture2D( tDiffuse, uv + vec2( -0.707107, 0.707107 ) * sampleSize );",
			"if( tmp.b < color.b ) color = tmp;",

			"color = color * vec4( 2.0 ) - ( add / vec4( 8.0 ) );",
			"color = color + ( add / vec4( 8.0 ) - color ) * ( vec4( 1.0 ) - vec4( sample_dist * 0.5 ) );",

			"gl_FragColor = vec4( color.rgb * color.rgb * vec3( 0.95 ) + color.rgb, 1.0 );",

		"}"


	].join("\n")
};


/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 * Two pass Gaussian blur filter (horizontal and vertical blur shaders)
 * - described in http://www.gamerendering.com/2008/10/11/gaussian-blur-filter-shader/
 *   and used in http://www.cake23.de/traveling-wavefronts-lit-up.html
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
 */

THREE.HorizontalBlurShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"h":        { type: "f", value: 1.0 / 512.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float h;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 sum = vec4( 0.0 );",

			"sum += texture2D( tDiffuse, vec2( vUv.x - 4.0 * h, vUv.y ) ) * 0.051;",
			"sum += texture2D( tDiffuse, vec2( vUv.x - 3.0 * h, vUv.y ) ) * 0.0918;",
			"sum += texture2D( tDiffuse, vec2( vUv.x - 2.0 * h, vUv.y ) ) * 0.12245;",
			"sum += texture2D( tDiffuse, vec2( vUv.x - 1.0 * h, vUv.y ) ) * 0.1531;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;",
			"sum += texture2D( tDiffuse, vec2( vUv.x + 1.0 * h, vUv.y ) ) * 0.1531;",
			"sum += texture2D( tDiffuse, vec2( vUv.x + 2.0 * h, vUv.y ) ) * 0.12245;",
			"sum += texture2D( tDiffuse, vec2( vUv.x + 3.0 * h, vUv.y ) ) * 0.0918;",
			"sum += texture2D( tDiffuse, vec2( vUv.x + 4.0 * h, vUv.y ) ) * 0.051;",

			"gl_FragColor = sum;",

		"}"

	].join("\n")

};

/**
 * @author tapio / http://tapio.github.com/
 *
 * Hue and saturation adjustment
 * https://github.com/evanw/glfx.js
 * hue: -1 to 1 (-1 is 180 degrees in the negative direction, 0 is no change, etc.
 * saturation: -1 to 1 (-1 is solid gray, 0 is no change, and 1 is maximum contrast)
 */

THREE.HueSaturationShader = {

	uniforms: {

		"tDiffuse":   { type: "t", value: null },
		"hue":        { type: "f", value: 0 },
		"saturation": { type: "f", value: 0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float hue;",
		"uniform float saturation;",

		"varying vec2 vUv;",

		"void main() {",

			"gl_FragColor = texture2D( tDiffuse, vUv );",

			// hue
			"float angle = hue * 3.14159265;",
			"float s = sin(angle), c = cos(angle);",
			"vec3 weights = (vec3(2.0 * c, -sqrt(3.0) * s - c, sqrt(3.0) * s - c) + 1.0) / 3.0;",
			"float len = length(gl_FragColor.rgb);",
			"gl_FragColor.rgb = vec3(",
				"dot(gl_FragColor.rgb, weights.xyz),",
				"dot(gl_FragColor.rgb, weights.zxy),",
				"dot(gl_FragColor.rgb, weights.yzx)",
			");",

			// saturation
			"float average = (gl_FragColor.r + gl_FragColor.g + gl_FragColor.b) / 3.0;",
			"if (saturation > 0.0) {",
				"gl_FragColor.rgb += (average - gl_FragColor.rgb) * (1.0 - 1.0 / (1.001 - saturation));",
			"} else {",
				"gl_FragColor.rgb += (average - gl_FragColor.rgb) * (-saturation);",
			"}",

		"}"

	].join("\n")

};

/**
 * @author felixturner / http://airtight.cc/
 *
 * Kaleidoscope Shader
 * Radial reflection around center point
 * Ported from: http://pixelshaders.com/editor/
 * by Toby Schachman / http://tobyschachman.com/
 *
 * sides: number of reflections
 * angle: initial angle in radians
 */

THREE.KaleidoShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"sides":    { type: "f", value: 6.0 },
		"angle":    { type: "f", value: 0.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float sides;",
		"uniform float angle;",
		
		"varying vec2 vUv;",

		"void main() {",

			"vec2 p = vUv - 0.5;",
			"float r = length(p);",
			"float a = atan(p.y, p.x) + angle;",
			"float tau = 2. * 3.1416 ;",
			"a = mod(a, tau/sides);",
			"a = abs(a - tau/sides/2.) ;",
			"p = r * vec2(cos(a), sin(a));",
			"vec4 color = texture2D(tDiffuse, p + 0.5);",
			"gl_FragColor = color;",

		"}"

	].join("\n")

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Luminosity
 * http://en.wikipedia.org/wiki/Luminosity
 */

THREE.LuminosityShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel = texture2D( tDiffuse, vUv );",

			"vec3 luma = vec3( 0.299, 0.587, 0.114 );",

			"float v = dot( texel.xyz, luma );",

			"gl_FragColor = vec4( v, v, v, texel.w );",

		"}"

	].join("\n")

};

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.MaskPass = function ( scene, camera ) {

	this.scene = scene;
	this.camera = camera;

	this.enabled = true;
	this.clear = true;
	this.needsSwap = false;

	this.inverse = false;

};

THREE.MaskPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		var context = renderer.context;

		// don't update color or depth

		context.colorMask( false, false, false, false );
		context.depthMask( false );

		// set up stencil

		var writeValue, clearValue;

		if ( this.inverse ) {

			writeValue = 0;
			clearValue = 1;

		} else {

			writeValue = 1;
			clearValue = 0;

		}

		context.enable( context.STENCIL_TEST );
		context.stencilOp( context.REPLACE, context.REPLACE, context.REPLACE );
		context.stencilFunc( context.ALWAYS, writeValue, 0xffffffff );
		context.clearStencil( clearValue );

		// draw into the stencil buffer

		renderer.render( this.scene, this.camera, readBuffer, this.clear );
		renderer.render( this.scene, this.camera, writeBuffer, this.clear );

		// re-enable update of color and depth

		context.colorMask( true, true, true, true );
		context.depthMask( true );

		// only render where stencil is set to 1

		context.stencilFunc( context.EQUAL, 1, 0xffffffff );  // draw if == 1
		context.stencilOp( context.KEEP, context.KEEP, context.KEEP );

	}

};


THREE.ClearMaskPass = function () {

	this.enabled = true;

};

THREE.ClearMaskPass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		var context = renderer.context;

		context.disable( context.STENCIL_TEST );

	}

};

/**
 * @author felixturner / http://airtight.cc/
 *
 * Mirror Shader
 * Copies half the input to the other half
 *
 * side: side of input to mirror (0 = left, 1 = right, 2 = top, 3 = bottom)
 */

THREE.MirrorShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"side":     { type: "i", value: 1 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform int side;",
		
		"varying vec2 vUv;",

		"void main() {",

			"vec2 p = vUv;",
			"if (side == 0){",
				"if (p.x > 0.5) p.x = 1.0 - p.x;",
			"}else if (side == 1){",
				"if (p.x < 0.5) p.x = 1.0 - p.x;",
			"}else if (side == 2){",
				"if (p.y < 0.5) p.y = 1.0 - p.y;",
			"}else if (side == 3){",
				"if (p.y > 0.5) p.y = 1.0 - p.y;",
			"} ",
			"vec4 color = texture2D(tDiffuse, p);",
			"gl_FragColor = color;",

		"}"

	].join("\n")

};

/**
 * @author felixturner / http://airtight.cc/
 *
 * RGB Shift Shader
 * Shifts red and blue channels from center in opposite directions
 * Ported from http://kriss.cx/tom/2009/05/rgb-shift/
 * by Tom Butterworth / http://kriss.cx/tom/
 *
 * amount: shift distance (1 is width of input)
 * angle: shift angle in radians
 */

THREE.RGBShiftShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"amount":   { type: "f", value: 0.005 },
		"angle":    { type: "f", value: 0.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float amount;",
		"uniform float angle;",

		"varying vec2 vUv;",

		"void main() {",

			"vec2 offset = amount * vec2( cos(angle), sin(angle));",
			"vec4 cr = texture2D(tDiffuse, vUv + offset);",
			"vec4 cga = texture2D(tDiffuse, vUv);",
			"vec4 cb = texture2D(tDiffuse, vUv - offset);",
			"gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);",

		"}"

	].join("\n")

};

/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SavePass = function( renderTarget ) {

	var shader = THREE.ShaderExtras[ "screen" ];

	this.textureID = "tDiffuse";

	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	this.material = new THREE.ShaderMaterial( {

		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader

	} );

	this.renderTarget = renderTarget;

	if ( this.renderTarget === undefined ) {

		this.renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBufer: false };
		this.renderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, this.renderTargetParameters );

	}

	this.enabled = true;
	this.needsSwap = false;
	this.clear = false;

};

THREE.SavePass.prototype = {

	render: function ( renderer, writeBuffer, readBuffer, delta ) {

		if ( this.uniforms[ this.textureID ] ) {

			this.uniforms[ this.textureID ].texture = readBuffer;

		}

		THREE.EffectComposer.quad.material = this.material;

		renderer.render( THREE.EffectComposer.scene, THREE.EffectComposer.camera, this.renderTarget, this.clear );

	}

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Sepia tone shader
 * based on glfx.js sepia shader
 * https://github.com/evanw/glfx.js
 */

THREE.SepiaShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"amount":   { type: "f", value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float amount;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 color = texture2D( tDiffuse, vUv );",
			"vec3 c = color.rgb;",

			"color.r = dot( c, vec3( 1.0 - 0.607 * amount, 0.769 * amount, 0.189 * amount ) );",
			"color.g = dot( c, vec3( 0.349 * amount, 1.0 - 0.314 * amount, 0.168 * amount ) );",
			"color.b = dot( c, vec3( 0.272 * amount, 0.534 * amount, 1.0 - 0.869 * amount ) );",

			"gl_FragColor = vec4( min( vec3( 1.0 ), color.rgb ), color.a );",

		"}"

	].join("\n")

};

/**
 * @author felixturner / http://airtight.cc/
 *
 * Static effect. Additively blended digital noise.
 *
 * amount - amount of noise to add (0 - 1)
 * size - size of noise grains (pixels)
 *
 */

THREE.StaticShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"time":     { type: "f", value: 0.0 },
		"amount":   { type: "f", value: 0.5 },
		"size":     { type: "f", value: 4.0 }
	},

	vertexShader: [

	"varying vec2 vUv;",

	"void main() {",

		"vUv = uv;",
		"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

	"}"

	].join("\n"),

	fragmentShader: [

	"uniform sampler2D tDiffuse;",
	"uniform float time;",
	"uniform float amount;",
	"uniform float size;",

	"varying vec2 vUv;",

	"float rand(vec2 co){",
		"return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);",
	"}",

	"void main() {",
		"vec2 p = vUv;",
		"vec4 color = texture2D(tDiffuse, p);",
		"float xs = floor(gl_FragCoord.x / size);",
		"float ys = floor(gl_FragCoord.y / size);",
		"vec4 snow = vec4(rand(vec2(xs * time,ys * time))*amount);",

		//"gl_FragColor = color + amount * ( snow - color );", //interpolate

		"gl_FragColor = color+ snow;", //additive

	"}"

	].join("\n")

};

/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 *
 * Two pass Gaussian blur filter (horizontal and vertical blur shaders)
 * - described in http://www.gamerendering.com/2008/10/11/gaussian-blur-filter-shader/
 *   and used in http://www.cake23.de/traveling-wavefronts-lit-up.html
 *
 * - 9 samples per pass
 * - standard deviation 2.7
 * - "h" and "v" parameters should be set to "1 / width" and "1 / height"
 */

THREE.VerticalBlurShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"v":        { type: "f", value: 1.0 / 512.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform float v;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 sum = vec4( 0.0 );",

			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 4.0 * v ) ) * 0.051;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 3.0 * v ) ) * 0.0918;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 2.0 * v ) ) * 0.12245;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y - 1.0 * v ) ) * 0.1531;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y ) ) * 0.1633;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 1.0 * v ) ) * 0.1531;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 2.0 * v ) ) * 0.12245;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 3.0 * v ) ) * 0.0918;",
			"sum += texture2D( tDiffuse, vec2( vUv.x, vUv.y + 4.0 * v ) ) * 0.051;",

			"gl_FragColor = sum;",

		"}"

	].join("\n")

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Vignette shader
 * based on PaintEffect postprocess from ro.me
 * http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
 */

THREE.VignetteShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"offset":   { type: "f", value: 1.0 },
		"darkness": { type: "f", value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform float offset;",
		"uniform float darkness;",

		"uniform sampler2D tDiffuse;",

		"varying vec2 vUv;",

		"void main() {",

			// Eskil's vignette

			"vec4 texel = texture2D( tDiffuse, vUv );",
			"vec2 uv = ( vUv - vec2( 0.5 ) ) * vec2( offset );",
			"gl_FragColor = vec4( mix( texel.rgb, vec3( 1.0 - darkness ), dot( uv, uv ) ), texel.a );",

			/*
			// alternative version from glfx.js
			// this one makes more "dusty" look (as opposed to "burned")

			"vec4 color = texture2D( tDiffuse, vUv );",
			"float dist = distance( vUv, vec2( 0.5 ) );",
			"color.rgb *= smoothstep( 0.8, offset * 0.799, dist *( darkness + offset ) );",
			"gl_FragColor = color;",
			*/

		"}"

	].join("\n")

};


//colorshader
var colorShader1 = {
	uniforms: {
		"tDiffuse": { type: "t", value: null },
		"time":     { type: "f", value: 0.0 },
		"resolution":     { type: "v2", value: new THREE.Vector2() }
	},

	vertexShader: [
		"varying vec2 vUv;",
		"void main() {",
		"vUv = uv;",
		"vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
    "gl_Position = projectionMatrix * mvPosition;",
		"}"

	].join("\n"),

	fragmentShader: [

		"uniform vec2 resolution;",
		"uniform float time;",
    
		"varying vec2 vUv;",   	

		"void main() {",

			"vec2 p = -1.0 + 2.0 * vUv;",
			"float a = time*40.0;",
			"float d,e,f,g=1.0/40.0,h,i,r,q;",

			"e=400.0*(p.x*0.5+0.5);",
      "f=400.0*(p.y*0.5+0.5);",
      "i=200.0+sin(e*g+a/150.0)*20.0;",
      "d=200.0+cos(f*g/2.0)*18.0+cos(e*g)*7.0;",
      "r=sqrt(pow(i-e,2.0)+pow(d-f,2.0));",
      "q=f/r;",
      "e=(r*cos(q))-a/2.0;f=(r*sin(q))-a/2.0;",
      "d=sin(e*g)*176.0+sin(e*g)*164.0+r;",
      "h=((f+d)+a/2.0)*g;",
      "i=cos(h+r*p.x/1.3)*(e+e+a)+cos(q*g*6.0)*(r+h/3.0);",
      "h=sin(f*g)*144.0-sin(e*g)*212.0*p.x;",
      "h=(h+(f-e)*q+sin(r-(a+h)/7.0)*10.0+i/4.0)*g;",
      "i+=cos(h*2.3*sin(a/350.0-q))*184.0*sin(q-(r*4.3+a/12.0)*g)+tan(r*g+h)*184.0*cos(r*g+h);",
      "i=mod(i/5.6,256.0)/64.0;",
      "if(i<0.0) i+=4.0;",
      "if(i>=2.0) i=4.0-i;",
      "d=r/350.0;",
      "d+=sin(d*d*8.0)*0.52;",
      "f=(sin(a*g)+1.0)/2.0;",
      "gl_FragColor=vec4(vec3(f*i/1.6,i/2.0+d/13.0,i)*d*p.x+vec3(i/1.3+d/8.0,i/2.0+d/18.0,i)*d*(1.0-p.x),1.0);",

		"}"

	].join("\n")

};
