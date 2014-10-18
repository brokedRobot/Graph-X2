/**
 * @author sole / http://soledadpenades.com
 * @author mrdoob / http://mrdoob.com
 * @author Robert Eisele / http://www.xarg.org
 * @author Philippe / http://philippe.elsass.me
 * @author Robert Penner / http://www.robertpenner.com/easing_terms_of_use.html
 * @author Paul Lewis / http://www.aerotwist.com/
 * @author lechecacharro
 * @author Josh Faul / http://jocafa.com/
 * @author egraether / http://egraether.com/
 * @author endel / http://endel.me
 * @author brokedRobot / http://www.prismshards.com/
 */

var TWEEN = TWEEN || (function (){

	var _tweens = [];
	var _pausedtweens = [];

	return {

		REVISION: '10',
		getAll: function (){
			return _tweens;
		},
		removeAll: function (){
			_tweens = [];
		},
		add: function (tween){
			var i = _tweens.indexOf(tween);
			if (i === -1) {
				_tweens.push(tween);
			}
		},
		remove: function (tween){
			var i = _tweens.indexOf(tween);
			if (i !== -1){
				_tweens.splice( i, 1 );
			}
		},
		pauseAll: function (){
			for(var i = 0; i < _tweens.length; i++){
				if (!_tweens[i].paused) _tweens[i].pause();
			}
		},
		
		resumeAll: function (){
			for(var i = 0; i < _tweens.length; i++){
				if (_tweens[i].paused) _tweens[i].resume();
			}
		},
		update: function (time){
			if (_tweens.length === 0) return false;

			var i = 0, numTweens = _tweens.length, records = [];

			time = time !== undefined ? time : (window.performance !== undefined &&
				window.performance.now !== undefined ? window.performance.now() : Date.now());

			try {
				while (i < numTweens){
					if (!_tweens[i].paused){
						if (_tweens[i].update(time)){
							i++;
						} 
						else {
							_tweens.splice(i, 1);
							numTweens--;
						}
					} 
					else i++;
				}
			}
			catch (err){
				//console.log(numTweens, _tweens, _tweens.length, err, err.stack);
				i++;
			}
			return true;
		}
	};
})();

TWEEN.Tween = function ( object ) {

	var _object = object;
	var _valuesStart = {};
	var _valuesEnd = {};
	var _valuesStartRepeat = {};
	var _duration = 1000;
	var _repeat = 0;
	var _delayTime = 0;
	this.startTime = null;
	var _easingFunction = TWEEN.Easing.Linear.None;
	var _interpolationFunction = TWEEN.Interpolation.Linear;
	this.chainedTweens = [];
	var _onStartCallback = null;
	var _onRepeatCallback = null;
	var _onStartCallbackFired = false;
	var _onUpdateCallback = null;
	var _onCompleteCallback = null;
	this.paused = false;
	this.pauseStart = null;

	// Set all starting values present on the target object
	for ( var field in object ) {
		_valuesStart[ field ] = parseFloat(object[field], 10);
	}
  
	this.getObject = function(){
		return _object;
	};

	this.to = function(properties, duration){
		if ( duration !== undefined ) {
			_duration = duration;
		}
		_valuesEnd = properties;
		return this;
	};

	this.start = function(time){

		TWEEN.add(this);
		
		_onStartCallbackFired = false;
		
		this.startTime = time !== undefined ? time : (window.performance !== undefined &&
			window.performance.now !== undefined ? window.performance.now() : Date.now());
		this.startTime += _delayTime;

		for (var property in _valuesEnd){

			// check if an Array was provided as property value
			if (_valuesEnd[ property ] instanceof Array){

				if (_valuesEnd[ property ].length === 0){
					continue;
				}

				// create a local copy of the Array with the start value at the front
				_valuesEnd[ property ] = [ _object[ property ] ].concat( _valuesEnd[ property ] );

			}

			_valuesStart[ property ] = _object[ property ];

			if( ( _valuesStart[ property ] instanceof Array ) === false ) {
				_valuesStart[ property ] *= 1.0; // Ensures we're using numbers, not strings
			}

			_valuesStartRepeat[ property ] = _valuesStart[ property ] || 0;

		}

		return this;

	};
  
	this.adjust = function (properties) {
    
		_valuesEnd = properties;

		for ( var property in _valuesEnd ) {
			// check if an Array was provided as property value
			if ( _valuesEnd[ property ] instanceof Array ) {
				if ( _valuesEnd[ property ].length === 0 ) {
					continue;
				}
				// create a local copy of the Array with the start value at the front
				_valuesEnd[ property ] = [ _object[ property ] ].concat( _valuesEnd[ property ] );
				_valuesEnd[ property ].shift();

			}

			_valuesStart[ property ] = _object[ property ];

			if( ( _valuesStart[ property ] instanceof Array ) === false ) {
				_valuesStart[ property ] *= 1.0; // Ensures we're using numbers, not strings
			}
			_valuesStartRepeat[ property ] = _valuesStart[ property ] || 0;
		}
		return this;
	};
  
	this.isPaused = function () {
		return this.paused;
	};

	this.stop = function () {
		TWEEN.remove( this );
		return this;
	};

	this.delay = function ( amount ) {
		_delayTime = amount;
		return this;
	};

	this.repeat = function ( times ) {
		_repeat = times;
		return this;
	};

	this.easing = function ( easing ) {
		_easingFunction = easing;
		return this;
	};

	this.interpolation = function ( interpolation ) {
		_interpolationFunction = interpolation;
		return this;
	};

	this.chain = function () {
		this.chainedTweens = arguments;
		return this;
	};

	this.onStart = function ( callback ) {
		_onStartCallback = callback;
		return this;
	};

	this.onUpdate = function ( callback ) {
		_onUpdateCallback = callback;
		return this;
	};

	this.onComplete = function ( callback ) {
		_onCompleteCallback = callback;
		return this;
	};
  
	this.onRepeat = function ( callback ) {
		_onRepeatCallback = callback;
		return this;
	};
  
	this.removeOnComplete = function () {
		_onCompleteCallback = null;
	};
  
	this.pause = function () {

		if(this.paused) return;

		this.paused = true;
		this.pauseStart = new Date().getTime();

		//for (var i = 0; i < this.chainedTweens.length; i++){

		//if ( this.chainedTweens[ i ].this.paused ) continue;

			// this.chainedTweens[ i ].paused = true;
			// this.chainedTweens[ i ].pauseStart = new Date().getTime();
		   
		// }
	  
	};

	this.resume = function () {
  
		if(!this.paused) return;

		this.paused = false;

		var now = new Date().getTime();
		this.startTime += now - this.pauseStart;
     
		// for (var i = 0; i < this.chainedTweens.length; i++){
      
        //if ( this.chainedTweens[ i ].this.paused ) continue;
        
		//  var now = new Date().getTime();
        
		//  this.chainedTweens[ i ].paused = false;
		//  this.chainedTweens[ i ].startTime += now - this.chainedTweens[ i ].pauseStart;
				
		//}
     
	};

	this.update = function ( time ) {

		if ( time < this.startTime ) {
			return true;
		}

		if ( _onStartCallbackFired === false ) {
			if ( _onStartCallback !== null ) {
				_onStartCallback( _object, this );
			}
			_onStartCallbackFired = true;
		}

		var elapsed = ( time - this.startTime ) / _duration;
		elapsed = elapsed > 1 ? 1 : elapsed;

		var value = _easingFunction( elapsed );

		for ( var property in _valuesEnd ) {
			var start = _valuesStart[ property ] || 0;
			var end = _valuesEnd[ property ];
			if ( end instanceof Array ) {
				_object[ property ] = _interpolationFunction( end, value );
			} else {
				if ( typeof(end) === "string" ) {
					end = start + parseFloat(end, 10);
				}
				_object[ property ] = start + ( end - start ) * value;
			}
		}
		if ( _onUpdateCallback !== null ) {
			_onUpdateCallback(_object, this, value );
		}
		if ( elapsed == 1 ) {
			if ( _repeat > 0 ) {
				if( isFinite( _repeat ) ) {
					_repeat--;
				}
				// reassign starting values, restart by making startTime = now
				for( var property in _valuesStartRepeat ) {
					if ( typeof( _valuesEnd[ property ] ) === "string" ) {
						_valuesStartRepeat[ property ] = _valuesStartRepeat[ property ] + parseFloat(_valuesEnd[ property ], 10);
					}
					_valuesStart[ property ] = _valuesStartRepeat[ property ];
				}
				this.startTime = time + _delayTime;
				if ( _onRepeatCallback !== null ) {
					_onRepeatCallback( _object, this );
				}
				return true;
			} else {
				if ( _onCompleteCallback ) {
					_onCompleteCallback( _object, this );
					//console.log('called');
					//_onCompleteCallback = false;
				}
				for ( var i = 0, numChainedTweens = this.chainedTweens.length; i < numChainedTweens; i ++ ) {
					this.chainedTweens[ i ].start( time );
				}
				return false;
			}
		}
		return true;
	};
};

TWEEN.Easing = {

	Linear: {
		None: function ( k ) {
			return k;
		}
	},
	Quadratic: {
		In: function ( k ) {
			return k * k;
		},
		Out: function ( k ) {
			return k * ( 2 - k );
		},
		InOut: function ( k ) {
			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k;
			return - 0.5 * ( --k * ( k - 2 ) - 1 );
		}
	},
	Cubic: {
		In: function ( k ) {
			return k * k * k;
		},
		Out: function ( k ) {
			return --k * k * k + 1;
		},
		InOut: function ( k ) {
			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k;
			return 0.5 * ( ( k -= 2 ) * k * k + 2 );
		}
	},
	Quartic: {
		In: function ( k ) {
			return k * k * k * k;
		},
		Out: function ( k ) {
			return 1 - ( --k * k * k * k );
		},
		InOut: function ( k ) {
			if ( ( k *= 2 ) < 1) return 0.5 * k * k * k * k;
			return - 0.5 * ( ( k -= 2 ) * k * k * k - 2 );
		}
	},
	Quintic: {
		In: function ( k ) {
			return k * k * k * k * k;
		},
		Out: function ( k ) {
			return --k * k * k * k * k + 1;
		},
		InOut: function ( k ) {
			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k * k * k;
			return 0.5 * ( ( k -= 2 ) * k * k * k * k + 2 );
		}
	},
	Sine: {
		In: function ( k ) {
			return 1 - Math.cos( k * Math.PI / 2 );
		},
		Out: function ( k ) {
			return Math.sin( k * Math.PI / 2 );
		},
		InOut: function ( k ) {
			return 0.5 * ( 1 - Math.cos( Math.PI * k ) );
		}
	},
	Exponential: {
		In: function ( k ) {
			return k === 0 ? 0 : Math.pow( 1024, k - 1 );
		},
		Out: function ( k ) {
			return k === 1 ? 1 : 1 - Math.pow( 2, - 10 * k );
		},
		InOut: function ( k ) {
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( ( k *= 2 ) < 1 ) return 0.5 * Math.pow( 1024, k - 1 );
			return 0.5 * ( - Math.pow( 2, - 10 * ( k - 1 ) ) + 2 );
		}
	},
	Circular: {
		In: function ( k ) {
			return 1 - Math.sqrt( 1 - k * k );
		},
		Out: function ( k ) {
			return Math.sqrt( 1 - ( --k * k ) );
		},
		InOut: function ( k ) {
			if ( ( k *= 2 ) < 1) return - 0.5 * ( Math.sqrt( 1 - k * k) - 1);
			return 0.5 * ( Math.sqrt( 1 - ( k -= 2) * k) + 1);
		}
	},
	Elastic: {
		In: function ( k ) {
			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
		},
		Out: function ( k ) {
			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );
		},
		InOut: function ( k ) {
			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
			return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;
		}
	},
	Back: {
		In: function ( k ) {
			var s = 1.70158;
			return k * k * ( ( s + 1 ) * k - s );
		},
		Out: function ( k ) {
			var s = 1.70158;
			return --k * k * ( ( s + 1 ) * k + s ) + 1;
		},
		InOut: function ( k ) {
			var s = 1.70158 * 1.525;
			if ( ( k *= 2 ) < 1 ) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
			return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );
		}
	},
	Bounce: {
		In: function ( k ) {
			return 1 - TWEEN.Easing.Bounce.Out( 1 - k );
		},
		Out: function ( k ) {
			if ( k < ( 1 / 2.75 ) ) {
				return 7.5625 * k * k;
			} else if ( k < ( 2 / 2.75 ) ) {
				return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
			} else if ( k < ( 2.5 / 2.75 ) ) {
				return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
			} else {
				return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
			}
		},
		InOut: function ( k ) {
			if ( k < 0.5 ) return TWEEN.Easing.Bounce.In( k * 2 ) * 0.5;
			return TWEEN.Easing.Bounce.Out( k * 2 - 1 ) * 0.5 + 0.5;
		}
	}
};

TWEEN.Interpolation = {
	Linear: function ( v, k ) {
		var m = v.length - 1, f = m * k, i = Math.floor( f ), fn = TWEEN.Interpolation.Utils.Linear;
		if ( k < 0 ) return fn( v[ 0 ], v[ 1 ], f );
		if ( k > 1 ) return fn( v[ m ], v[ m - 1 ], m - f );
		return fn( v[ i ], v[ i + 1 > m ? m : i + 1 ], f - i );
	},
	Bezier: function ( v, k ) {
		var b = 0, n = v.length - 1, pw = Math.pow, bn = TWEEN.Interpolation.Utils.Bernstein, i;
		for ( i = 0; i <= n; i++ ) {
			b += pw( 1 - k, n - i ) * pw( k, i ) * v[ i ] * bn( n, i );
		}
		return b;
	},
	CatmullRom: function ( v, k ) {
		var m = v.length - 1, f = m * k, i = Math.floor( f ), fn = TWEEN.Interpolation.Utils.CatmullRom;
		if ( v[ 0 ] === v[ m ] ) {
			if ( k < 0 ) i = Math.floor( f = m * ( 1 + k ) );
			return fn( v[ ( i - 1 + m ) % m ], v[ i ], v[ ( i + 1 ) % m ], v[ ( i + 2 ) % m ], f - i );
		} else {
			if ( k < 0 ) return v[ 0 ] - ( fn( v[ 0 ], v[ 0 ], v[ 1 ], v[ 1 ], -f ) - v[ 0 ] );
			if ( k > 1 ) return v[ m ] - ( fn( v[ m ], v[ m ], v[ m - 1 ], v[ m - 1 ], f - m ) - v[ m ] );
			return fn( v[ i ? i - 1 : 0 ], v[ i ], v[ m < i + 1 ? m : i + 1 ], v[ m < i + 2 ? m : i + 2 ], f - i );
		}
	},
	Utils: {
		Linear: function ( p0, p1, t ) {
			return ( p1 - p0 ) * t + p0;
		},
		Bernstein: function ( n , i ) {
			var fc = TWEEN.Interpolation.Utils.Factorial;
			return fc( n ) / fc( i ) / fc( n - i );
		},
		Factorial: ( function () {
			var a = [ 1 ];
			return function ( n ) {
				var s = 1, i;
				if ( a[ n ] ) return a[ n ];
				for ( i = n; i > 1; i-- ) s *= i;
				return a[ n ] = s;
			};
		})(),
		CatmullRom: function ( p0, p1, p2, p3, t ) {
			var v0 = ( p2 - p0 ) * 0.5, v1 = ( p3 - p1 ) * 0.5, t2 = t * t, t3 = t * t2;
			return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 + ( - 3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 + v0 * t + p1;
		}
	}
};

var Easing = TWEEN.Easing;

function _tween(opts){

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

function tweencss(opts){

	if (undef(opts.object) || undef(opts.from) || undef(opts.to)) return;
	
	var obj = opts.object;
	var props = opts.from;
	var to = opts.to;
	
	var ease = (opts.hasOwnProperty('ease')) ? opts.ease : TWEEN.Easing.Linear.None;
	var time = (opts.hasOwnProperty('time')) ? opts.time : 1;
	var units = (opts.hasOwnProperty('units')) ? opts.units : 'px';
	var onend = (opts.hasOwnProperty('onComplete')) ? opts.onComplete : noop;
	
	if (opts.hasOwnProperty('transformPerspective')){
		$(obj).css('-webkit-perspective', opts.transformPerspective+'px');
		$(obj).css('-moz-perspective', opts.transformPerspective+'px');
		$(obj).css('-o-perspective', opts.transformPerspective+'px');
		$(obj).css('-ms-perspective', opts.transformPerspective+'px');
		$(obj).css('perspective', opts.transformPerspective+'px');
	}
	if (opts.hasOwnProperty('perspectiveOrigin')){
		$(obj).css('-webkit-transform-origin', opts.perspectiveOrigin);
		$(obj).css('-moz-transform-origin', opts.perspectiveOrigin);
		$(obj).css('-o-transform-origin', opts.perspectiveOrigin);
		$(obj).css('-ms-transform-origin', opts.perspectiveOrigin);
		$(obj).css('transform-origin', opts.perspectiveOrigin);
		
		$(obj).css('-webkit-perspective-origin', opts.perspectiveOrigin);
		$(obj).css('-moz-perspective-origin', opts.perspectiveOrigin);
		$(obj).css('-o-perspective-origin', opts.perspectiveOrigin);
		$(obj).css('-ms-perspective-origin', opts.perspectiveOrigin);
		$(obj).css('perspective-origin', opts.perspectiveOrigin);
	}
	if (opts.hasOwnProperty('transformOrigin')){
		$(obj).css('-webkit-transform-origin', opts.transformOrigin);
		$(obj).css('-moz-transform-origin', opts.transformOrigin);
		$(obj).css('-o-transform-origin', opts.transformOrigin);
		$(obj).css('-ms-transform-origin', opts.transformOrigin);
		$(obj).css('transform-origin', opts.transformOrigin);
		
		$(obj).css('-webkit-perspective-origin', opts.transformOrigin);
		$(obj).css('-moz-perspective-origin', opts.transformOrigin);
		$(obj).css('-o-perspective-origin', opts.transformOrigin);
		$(obj).css('-ms-perspective-origin', opts.transformOrigin);
		$(obj).css('perspective-origin', opts.transformOrigin);
	}
	if (opts.hasOwnProperty('transformStyle')){
		$(obj).css('-webkit-transform-style', opts.transformStyle);
		$(obj).css('-moz-transform-style', opts.transformStyle);
		$(obj).css('-o-transform-style', opts.transformStyle);
		$(obj).css('-ms-transform-style', opts.transformStyle);
		$(obj).css('transform-style', opts.transformStyle);
	}
	if (opts.hasOwnProperty('backfaceVisibility')){
		$(obj).css('-webkit-backface-visibility', opts.backfaceVisibility);
		$(obj).css('-moz-backface-visibility', opts.backfaceVisibility);
		$(obj).css('-o-backface-visibility', opts.backfaceVisibility);
		$(obj).css('-ms-backface-visibility', opts.backfaceVisibility);
		$(obj).css('backface-visibility', opts.backfaceVisibility);
	}
	
	var trans = tween({
		object: props, 
		delay: (!undef(opts.delay)?opts.delay:0), 
		time: time, 
		to: opts.to, 
		begin: true,
		ease: ease,
		onStart: function(){
			this.owidth = $(this).outerWidth();
			this.oheight = $(this).outerHeight();
		}.bind(obj), 
		onUpdate: function(){
			
			var str = '';
		
			if (props.hasOwnProperty('opacity')){
				$(this).css('opacity', props.opacity);
			}
			if (props.hasOwnProperty('top')){
				$(this).css('top', props.top+units);
			}
			if (props.hasOwnProperty('left')){
				$(this).css('left', props.left+units);
			}
			if (props.hasOwnProperty('width')){
				$(this).css('width', props.width+units);
			}
			if (props.hasOwnProperty('height')){
				$(this).css('height', props.height+units);
			}
			if (props.hasOwnProperty('borderTopLeftRadius')){
				$(this).css('borderTopLeftRadius', props.borderTopLeftRadius+units);
			}
			if (props.hasOwnProperty('borderTopRightRadius')){
				$(this).css('borderTopRightRadius', props.borderTopRightRadius+units);
			}
			if (props.hasOwnProperty('borderBottomLeftRadius')){
				$(this).css('borderBottomLeftRadius', props.borderBottomLeftRadius+units);
			}
			if (props.hasOwnProperty('borderBottomRightRadius')){
				$(this).css('borderBottomRightRadius', props.borderBottomRightRadius+units);
			}
			if (props.hasOwnProperty('scale')){
				str += ' scale3d('+props.scale+','+props.scale+','+props.scale+')';
			}
			if (props.hasOwnProperty('scaleX')){
				str += ' scaleX('+props.scaleX+')';
			}
			if (props.hasOwnProperty('scaleY')){
				str += ' scaleY('+props.scaleY+')';
			}
			if (props.hasOwnProperty('scaleZ')){
				str += ' scaleZ('+props.scaleZ+')';
			}
			if (props.hasOwnProperty('rotation') && props.hasOwnProperty('angleX')
				&& props.hasOwnProperty('angleY') && props.hasOwnProperty('angleZ')){
				str += ' rotate3d('+props.angleX+','+props.angleY+','+props.angleZ+','+props.rotation+'rad)';
			}
			if (props.hasOwnProperty('rotationX')){
				str += ' rotate3d('+1+','+0+','+0+','+props.rotationX+'rad)';
			}
			if (props.hasOwnProperty('rotationY')){
				str += ' rotate3d('+0+','+1+','+0+','+props.rotationY+'rad)';
			}
			if (props.hasOwnProperty('rotationZ')){
				str += ' rotate3d('+0+','+0+','+1+','+props.rotationZ+'rad)';
			}
			if (props.hasOwnProperty('rotate') && props.hasOwnProperty('angleX')
				&& props.hasOwnProperty('angleY') && props.hasOwnProperty('angleZ')){
				str += ' rotate3d('+props.angleX+','+props.angleY+','+props.angleZ+','+props.rotation+'rad)';
			}
			if (props.hasOwnProperty('rotateX')){
				str += ' rotate3d('+1+','+0+','+0+','+props.rotationX+'rad)';
			}
			if (props.hasOwnProperty('rotateY')){
				str += ' rotate3d('+0+','+1+','+0+','+props.rotationY+'rad)';
			}
			if (props.hasOwnProperty('rotateZ')){
				str += ' rotate3d('+0+','+0+','+1+','+props.rotationZ+'rad)';
			}
			if (props.hasOwnProperty('translateX') || props.hasOwnProperty('translateY')
				|| props.hasOwnProperty('translateZ')){
				str += ' translate3d('+(!undef(opts.translateX)?props.translateX:0)+
							','+(!undef(opts.translateY)?props.translateY:0)+','+(!undef(opts.translateZ)?props.translateZ:0)+')';
			}
			
			$(this).css('-webkit-transform', str);
			$(this).css('-o-transform', str);
			$(this).css('-ms-transform', str);
			$(this).css('-webkit-transform', str);
			$(this).css('transform', str);
			
		}.bind(obj),
		onComplete: function(){onend();}
	});
	
	return trans;
	
}


