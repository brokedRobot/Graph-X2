function getDirectionFromVector(direction){
	
	if (direction.x >= 0){
	//right quadrant
		if (direction.y >= 0){
		//up-right quadrant
			if (Math.abs(direction.x) >= Math.abs(direction.y)){
			//going right more  
				if (Math.abs(direction.y) >= 0.5*Math.abs(direction.x)){
					return 'ur';
				}
				else{
					return 'r';
				}
			}
			else{
			//going up more
				if (Math.abs(direction.y) >= 2*Math.abs(direction.x)){
					return 'u';
				}
				else{
					return 'ur';
				}
			}
		}
		else{
		//down-right quadrant
			if (Math.abs(direction.x) >= Math.abs(direction.y)){
			//going right more  
				if (Math.abs(direction.y) >= 0.5*Math.abs(direction.x)){
					return 'dr';
				}
				else{
					return 'r';
				}
			}
			else{
			//going down more
				if (Math.abs(direction.y) >= 2*Math.abs(direction.x)){
					return 'd';
				}
				else{
					return 'dr';
				}
			}
		} 
	}
	else{
	//left quadrant
		if (direction.y >= 0){
		//up-left quadrant
			if (Math.abs(direction.x) >= Math.abs(direction.y)){
			//going left more  
				if (Math.abs(direction.y) >= 0.5*Math.abs(direction.x)){
					return 'ul';
				}
				else{
					return 'l';
				}
			}
			else{
			//going up more
				if (Math.abs(direction.y) >= 2*Math.abs(direction.x)){
					return 'u'
				}
				else{
					return 'ul';
				}
			}
		}
		else{
			//down-left quadrant
			if (Math.abs(direction.x) >= Math.abs(direction.y)){
			//going left more  
				if (Math.abs(direction.y) >= 0.5*Math.abs(direction.x)){
					return 'dl';
				}
				else{
					return 'l';
				}
			}
			else{
			//going down more
				if (Math.abs(direction.y) >= 2*Math.abs(direction.x)){
					return 'd';
				}
				else{
					return 'dl';
				}
			}
		} 
	} 
	return 'c';
}

function rpgControls(playerNum){

	if (document.activeElement == $('.messageinput')[0]) return;

	if (undef(playerNum)) var playerNum = 0;
	else playerNum--;

	var player = this, newdirection = 'c', changedirection = false;
	var system = player.system;
	var mainmouse = player.system.mouse;
	var currentarea = player.system.currentarea;
	var camera = player.system.camera;
	
	var vel = {x: player.physicsbody.velocity[0], y: player.physicsbody.velocity[1]};
	var desiredxvel = desiredyvel = 0, speed = 0.839*7*15*1.5, slowingfactor = 5;
	var leftpressed = false, rightpressed = false,
		uppressed = false, downpressed = false;
			
	if (keyboard.down("left")){
		if (system.doubletap_leftready) console.log('dbltap_left'); 
		else {
			system.doubletaptimer = setTimeout(function(){system.doubletap_leftready = false;}, 500);
			system.doubletap_leftready = true;
		}
	}
		
	if (player.running) speed *= 1.45;
		
	if (player.hasOwnProperty('speed')) speed = player.speed;
	if (player.hasOwnProperty('runspeed')) runspeed = player.runspeed;
	
	if (!player.autodirection){
		if (system.analog.down){
			newdirection = system.analog.direction;
		}
		else if ((mainmouse.down || mainmouse.touches.length > 0)){// && mainmouse.canmoveplayer){
			//console.log(mainmouse.touches);
			if (mainmouse.canmoveplayer){
			
				var targetOffset = mainmouse.container.children[0].getBoundingClientRect();
			
				var tempwidth = targetOffset.right - targetOffset.left;
				var tempheight = targetOffset.bottom - targetOffset.top; 
				
				//re-establish mouse world coordinates
				if (mainmouse.down){
					var vecOrigin = new THREE.Vector3( mainmouse.x, mainmouse.y, -500000 );
					var vecTarget = new THREE.Vector3( mainmouse.x, mainmouse.y, 100000 );
				}
				else if (mainmouse.touches.length > 0){
					var vecOrigin = new THREE.Vector3( mainmouse.touches[0].x, mainmouse.touches[0].y, -500000 );
					var vecTarget = new THREE.Vector3( mainmouse.touches[0].x, mainmouse.touches[0].y, 100000 );
				}
				
				mainmouse.projector = new THREE.Projector();
				mainmouse.projector.unprojectVector( vecOrigin, mainmouse.camera );
				mainmouse.projector.unprojectVector( vecTarget, mainmouse.camera );
				vecTarget.sub( vecOrigin ).normalize();
				
				mainmouse.worldx = vecOrigin.x;
				mainmouse.worldy = vecOrigin.y;
			
				if (mainmouse.down){
					var wx = (mainmouse.worldx)/(currentarea.graph.scale.x);
					var wy = (mainmouse.worldy)/(currentarea.graph.scale.y);
				}
				else if (mainmouse.touches.length > 0){
					var wx = mainmouse.touches[0].worldx/(currentarea.graph.scale.x);
					var wy = mainmouse.touches[0].worldy/(currentarea.graph.scale.y);
				}
				var vector = vec3(wx, wy, 0).sub(this.position.clone());

				var tnum = 40;
				if (player.running) tnum = 20;
				
				if (system.framecounter % tnum === 0) newdirection = getDirectionFromVector(vector);
				else newdirection = player.direction;
			}
		}
		else {
			 
			leftpressed = ( keyboard.pressed("a") || keyboard.pressed("left") );
			rightpressed = ( keyboard.pressed("d") || keyboard.pressed("right") );
			uppressed = ( keyboard.pressed("w") || keyboard.pressed("up") );
			downpressed = ( keyboard.pressed("s") || keyboard.pressed("down") );
			
			if (Gamepad.supported) {
			
				var pads = Gamepad.getStates();
				
				var pad = pads[playerNum]; // assume only 1 player.
				var prevpad = {
					dup: 0,
					ddown: 0,
					dleft: 0,
					dright: 0,
					lstickx: 0,
					lsticky: 0,
					rstickx: 0,
					rsticky: 0,
					button0: 0,
					button1: 0,
					button2: 0,
					button3: 0,
					start: 0,
					select: 0,
					rshoulder0: 0,
					rshoulder1: 0,
					lshoulder0: 0,
					lshoulder1: 0,
				};
				
				if (pad) {
					
					if (pad.rightShoulder0){
						//console.log(pad);
						prevpad.rshoulder0 = 1;
					}
					if (pad.rightShoulder1){
						prevpad.rshoulder1 = 1;
					}
					if (pad.leftShoulder0){
						prevpad.lshoulder0 = 1;
					}
					if (pad.leftShoulder1){
						prevpad.lshoulder1 = 1;
					}
					if (pad.dpadUp){
						uppressed = true;
						prevpad.dup = 1;
					}
					if (pad.dpadDown){
						downpressed = true;
						prevpad.ddown = 1;
					}
					if (pad.dpadLeft){
						leftpressed = true;
						prevpad.dleft = 1;
					}
					if (pad.dpadRight){
						rightpressed = true;
						prevpad.dright = 1;
					}
					if (pad.leftStickX > 0.2){	
						rightpressed = true;
						prevpad.lstickx = pad.leftStickX;
					}
					if (pad.leftStickX < -0.2){	
						leftpressed = true;
						prevpad.lstickx = pad.leftStickX;
					}
					if (pad.leftStickY > 0.2){
						downpressed = true;
						prevpad.lsticky = pad.leftStickY;
					}
					if (pad.leftStickY < -0.2){
						uppressed = true;
						prevpad.lsticky = pad.leftStickY;
					}
					if (pad.rightStickX > 0.2){	
						prevpad.rstickx = pad.rightStickX;
					}
					if (pad.rightStickX < -0.2){	
						prevpad.rstickx = pad.rightStickX;
					}
					if (pad.rightStickY > 0.2){	
						prevpad.rsticky = pad.rightStickY;
					}
					if (pad.rightStickY < -0.2){	
						prevpad.rsticky = pad.rightStickY;
					}
					if ( pad.faceButton0 ){ // A on Xbox
						prevpad.button0 = 1;
					}
					if ( pad.faceButton1 ){ // B on Xbox
						prevpad.button1 = 1;
					}
					if ( pad.faceButton2 ){ // X on Xbox
						prevpad.button2 = 1;
					}
					if ( pad.faceButton3 ){ // Y on Xbox
						prevpad.button3 = 1;
					}
					if ( pad.start ){
						prevpad.start = 1;
					}
					if ( pad.select ){
						prevpad.select = 1;
					}
					
				}
				
				this.previouspad = {};
				
			}
			
			if (leftpressed || rightpressed || uppressed || downpressed){
				if ( leftpressed  && uppressed ) { 
					newdirection = 'ul'; 
				}
				else if ( leftpressed && downpressed ) { 
					newdirection = "dl";
				}
				else if ( rightpressed && uppressed  ) {  
					newdirection = "ur"; 
				}
				else if ( rightpressed && downpressed ) {
					newdirection = "dr";
				}
				else if ( leftpressed ) {   
					newdirection = "l"; 
				}
				else if ( rightpressed ) {                  
					newdirection = "r";
				}
				else if ( uppressed ) { 	
					newdirection = "u"; 
				}
				else if ( downpressed ) {   	
					newdirection = "d";
				}
			}
			else {
				newdirection = 'c';
			}		
		} 
	}
	else {
		if (player.autodirection) newdirection = player.autodirection;
		else newdirection = 'c';
	}
	
	if (player.dodirectionfinding){
	
		/*if (player.directionfinding[8] == 'reverse'){
			switch (newdirection){
				case 'u':
					newdirection = 'd';
					break;
				case 'd':
					newdirection = 'u';
					break;
				case 'l':
					newdirection = 'l';
					break;
				case 'r':
					newdirection = 'r';
					break;
				default:
					break;
			}
		}*/
	
		var s1 = 0;
		var s2 = 0;
		
		switch (newdirection){
			case 'u':
				s2 = -speed/100;
				break;
			case 'd':
				s2 = speed/100;
				break;
			case 'l':
				s1 = -speed/100;
				break;
			case 'r':
				s1 = speed/100;
				break;
			default:
				break;
		}
		
		if (currentarea.map.collisionmap)
			var isCollision = currentarea.map.collisionmap.checkForColorCollision(
				'square',
				player.position_0.x*100 + s1,
				-player.position_0.y*100 + s2,
				player.collisioncolors
			);
		else var isCollision = false;
		
		///if reverse, keep trying to go left or right here
		
		if (isCollision){
			console.log('collide');
			switch (newdirection){
				case 'u':
					if (player.directionfinding[0] == 'r') var sp1 = speed/100;
					if (player.directionfinding[0] == 'l') var sp1 = -speed/100;
					
					if (currentarea.map.collisionmap.checkForColorCollision('square', 
						player.position_0.x*100 + sp1,
						-player.position_0.y*100,
						player.collisioncolors
					)){
						if (player.directionfinding[0] == 'r') player.directionfinding[0] = 'l';
						else if (player.directionfinding[0] == 'l') player.directionfinding[0] = 'r';
						//player.directionfinding[4]++;
						//if (player.directionfinding[4] == 2) player.directionfinding[8] = 'reverse';
					}
					else {
						//can go left or right
						//if (player.directionfinding[8] == 'reverse')
					}
					
					//if (player.directionfinding[8] == 'reverse') newdirection = 'd';
					//else 
					newdirection = player.directionfinding[0];
					break;
				case 'd':
					if (player.directionfinding[1] == 'r') var sp1 = speed/100;
					if (player.directionfinding[1] == 'l') var sp1 = -speed/100;
					if (currentarea.map.collisionmap.checkForColorCollision('square', 
						player.position_0.x*100 + sp1,
						-player.position_0.y*100,
						player.collisioncolors
					)){
						if (player.directionfinding[1] == 'r') player.directionfinding[1] = 'l';
						else if (player.directionfinding[1] == 'l') player.directionfinding[1] = 'r';
					}
					newdirection = player.directionfinding[1];
					break;
				case 'l':
					if (player.directionfinding[2] == 'u') var sp1 = -speed/100;
					if (player.directionfinding[2] == 'd') var sp1 = speed/100;
					if (currentarea.map.collisionmap.checkForColorCollision('square', 
						player.position_0.x*100,
						-player.position_0.y*100 + sp1,
						player.collisioncolors
					)){
						if (player.directionfinding[2] == 'u') player.directionfinding[2] = 'd';
						else if (player.directionfinding[2] == 'd') player.directionfinding[2] = 'u';
					}
					newdirection = player.directionfinding[2];
					break;
				case 'r':
					if (player.directionfinding[3] == 'u') var sp1 = -speed/100;
					if (player.directionfinding[3] == 'd') var sp1 = speed/100;
					if (currentarea.map.collisionmap.checkForColorCollision('square', 
						player.position_0.x*100,
						-player.position_0.y*100 + sp1,
						player.collisioncolors
					)){
						if (player.directionfinding[3] == 'u') player.directionfinding[3] = 'd';
						else if (player.directionfinding[3] == 'd') player.directionfinding[3] = 'u';
					}
					newdirection = player.directionfinding[3];
					break;
			}
		}
	}

	if (newdirection !== player.direction) {
		changedirection = true;
		player.animating = true;
	}
	switch (newdirection){
		case 'l':
			if (changedirection) {
				//player.toFrame(this.animatorframes[0]*1+1);
				if (player.running) player.animpattern(player.runframes.left, true);
				else player.animpattern(player.walkframes.left, true);
			}
			desiredxvel = -speed;
			break;
		case 'r':
			if (changedirection) {
				//player.toFrame(this.animatorframes[0]*2+1);
				if (player.running) player.animpattern(player.runframes.right, true);
				else player.animpattern(player.walkframes.right, true);
			}
			desiredxvel = speed;
			break;
		case 'u':
			if (changedirection) {
				//player.toFrame(this.animatorframes[0]*3+1);
				if (player.running) player.animpattern(player.runframes.up, true);
				else player.animpattern(player.walkframes.up, true);
			}
			desiredyvel = speed;
			break;
		case 'd':
			if (changedirection) {
				//player.toFrame(this.animatorframes[0]*0+1);
				if (player.running) player.animpattern(player.runframes.down, true);
				else player.animpattern(player.walkframes.down, true);
			}
			desiredyvel = -speed;
			break;
		case 'ul':
			if (changedirection) {
				if (player.eightway){
					//player.toFrame(this.animatorframes[0]*7+1);
					player.player.animpattern(player.runframes.upleft, true);
				}
				else {
					//player.toFrame(this.animatorframes[0]*3+1);
					if (player.running) player.animpattern(player.runframes.up, true);
					else player.animpattern(player.walkframes.up, true);
				}
			}
			desiredxvel = -speed;
			desiredyvel = speed;
			/*if (currentarea.map.collisionmap){
				var diagCollision = currentarea.map.collisionmap.checkForColorCollision(
					'square',
					player.position_0.x*100 + -desiredxvel/100,
					-player.position_0.y*100 + -desiredyvel/100,
					player.collisioncolors
				);
				if (diagCollision){
					desiredxvel *= 1.5;
					desiredyvel *= 1.5;
				}
			}*/
			break;
		case 'ur':
			if (changedirection) {
				if (player.eightway){
					//player.toFrame(this.animatorframes[0]*6+1);
					player.setRow(7);
				}
				else {
					//player.toFrame(this.animatorframes[0]*3+1);
					if (player.running) player.animpattern(player.runframes.up, true);
					else player.animpattern(player.walkframes.up, true);
				}
			}
			desiredxvel = speed;
			desiredyvel = speed;
			/*if (currentarea.map.collisionmap){
				var diagCollision = currentarea.map.collisionmap.checkForColorCollision(
					'square',
					player.position_0.x*100 + -desiredxvel/100,
					-player.position_0.y*100 + -desiredyvel/100,
					player.collisioncolors
				);
				if (diagCollision){
					desiredxvel *= 1.5;
					desiredyvel *= 1.5;
				}
			}*/
			break;
		case 'dl':
			if (changedirection) {
				if (player.eightway){
					//player.toFrame(this.animatorframes[0]*5+1);
					player.animpattern(player.runframes.down, true);
				}
				else {
					//player.toFrame(this.animatorframes[0]*0+1);
					if (player.running) player.animpattern(player.runframes.down, true);
					else player.animpattern(player.walkframes.down, true);
				}
			}
			desiredxvel = -speed;
			desiredyvel = -speed;
			/*if (currentarea.map.collisionmap){
				var diagCollision = currentarea.map.collisionmap.checkForColorCollision(
					'square',
					player.position_0.x*100 + -desiredxvel/100,
					-player.position_0.y*100 + -desiredyvel/100,
					player.collisioncolors
				);
				if (diagCollision){
					desiredxvel *= 1.5;
					desiredyvel *= 1.5;
				}	
			}*/
			break;
		case 'dr':
			if (changedirection) {
				if (player.eightway){
					//player.toFrame(this.animatorframes[0]*4+1);
					player.animpattern(player.runframes.down, true);
				}
				else {
					//player.toFrame(this.animatorframes[0]*0+1);
					if (player.running) player.animpattern(player.runframes.down, true);
					else player.animpattern(player.walkframes.down, true);
				}
			}
			desiredxvel = speed;
			desiredyvel = -speed;
			/*if (currentarea.map.collisionmap){
				var diagCollision = currentarea.map.collisionmap.checkForColorCollision(
					'square',
					player.position_0.x*100 + -desiredxvel/100,
					-player.position_0.y*100 + -desiredyvel/100,
					player.collisioncolors
				);
				if (diagCollision){
					desiredxvel *= 1.5;
					desiredyvel *= 1.5;
				}
			}*/
			break;
		case 'c':
			desiredxvel = desiredyvel = 0;
			player.animating = false;
			if (player.running) var frames = player.runframes;
			else var frames = player.walkframes;
			if (changedirection) switch (player.direction){
				case 'l':
					player.toFrame(frames.left[0]);
					break;
				case 'r':
					player.toFrame(frames.right[0]);
					break;
				case 'u':
					player.toFrame(frames.up[0]);
					break;
				case 'd':
					player.toFrame(frames.down[0]);
					break;
				case 'ul':
					if (player.eightway) player.toFrame(frames.upleft[0]);
					else player.toFrame(frames.up[0]);
					break;
				case 'ur':
					if (player.eightway) player.toFrame(frames.upright[0]);
					else player.toFrame(frames.up[0]);
					break;
				case 'dl':
					if (player.eightway) player.toFrame(frames.downleft[0]);
					else player.toFrame(frames.down[0]);
					break;
				case 'dr':
					if (player.eightway) player.toFrame(frames.downright[0]);
					else player.toFrame(frames.down[0]);
					break;
				default:       
			}  
			break;
		default:       
	}  
	
	player.direction = newdirection;
	if (newdirection !== 'c') player.facing = newdirection;
	
	var xvelchange = desiredxvel - vel.x;
	var yvelchange = desiredyvel - vel.y;
	
	var ximpulse = player.physicsbody.mass * xvelchange;
	var yimpulse = player.physicsbody.mass * yvelchange;
	player.physicsbody.velocity = [(player.physicsbody.mass * xvelchange)/100,
								(player.physicsbody.mass * yvelchange)/100];
										   
	/*if (player.position.x >= currentarea.map.xmin &&
		player.position.x <= currentarea.map.xmax ){
			camera.position.x = player.position.x*currentarea.graph.scale.x;            
	}
	if (player.position.y >= currentarea.map.ymin &&
		player.position.y <= currentarea.map.ymax){
			camera.position.y = player.position.y*currentarea.graph.scale.y; 
	}*/
	camera.position.x = player.position.x*currentarea.graph.scale.x;
	camera.position.y = player.position.y*currentarea.graph.scale.y; 
	
	if (camera.position.x > currentarea.map.xmax) camera.position.x = currentarea.map.xmax;
	if (camera.position.x < currentarea.map.xmin) camera.position.x = currentarea.map.xmin;
	if (camera.position.y > currentarea.map.ymax) camera.position.y = currentarea.map.ymax;
	if (camera.position.y < currentarea.map.ymin) camera.position.y = currentarea.map.ymin;
            
	if ( keyboard.up("space") || keyboard.up("enter") || (pad && pad.faceButton1)) {
		var event;
		var dist = player.eventdistance;
		switch (player.facing){
			case 'l':
				event = currentarea.isEventCollision(player, new Vec3(-dist, 0-player.pictureoffset.y, 0));
				break;
			case 'r':
				event = currentarea.isEventCollision(player, new Vec3(dist, 0-player.pictureoffset.y, 0));
				break;
			case 'u':
				event = currentarea.isEventCollision(player, new Vec3(0, dist-player.pictureoffset.y, 0));
				break;
			case 'd':
				event = currentarea.isEventCollision(player, new Vec3(0, -dist-player.pictureoffset.y, 0));
				break;
			case 'ul':
				event = currentarea.isEventCollision(player, new Vec3(-dist, dist-player.pictureoffset.y, 0));
				break;
			case 'ur':
				event = currentarea.isEventCollision(player, new Vec3(dist, dist-player.pictureoffset.y, 0));
				break;
			case 'dl':
				event = currentarea.isEventCollision(player, new Vec3(-dist, -dist-player.pictureoffset.y, 0));
				break;
			case 'dr':
				event = currentarea.isEventCollision(player, new Vec3(dist, -dist-player.pictureoffset.y, 0));
				break;
			default:
		}
		if (event){
			if (event[0].click) event[0].click();
		} 
		console.log(event);
	}
}


function npcControls(){

	var player = this, newdirection = 'c', changedirection = false;
	var desiredxvel = desiredyvel = 0, speed = 0.839*7, slowingfactor = 5;
	var leftpressed = false, rightpressed = false,
		uppressed = false, downpressed = false;
		
	var runspeed = speed*2;
		
	if (player.hasOwnProperty('speed')) speed = player.speed;
	if (player.hasOwnProperty('runspeed')) runspeed = player.runspeed;
	
	if (player.autodirection) newdirection = player.autodirection;
	else newdirection = 'c';
	
	if (player.stopCondition && player.stopCondition() === true) newdirection = 'c';

	if (newdirection !== player.direction) {changedirection = true;
	player.animating = true;}
	switch (newdirection){
		case 'l':
			if (changedirection){
				player.toFrame(this.animatorframes[0]*1+1);
				player.setRow(2);
			}
			desiredxvel = -speed;
			break;
		case 'r':
			if (changedirection){
				player.toFrame(this.animatorframes[0]*2+1);
				player.setRow(3);
			}
			desiredxvel = speed;
			break;
		case 'u':
			if (changedirection){
				player.toFrame(this.animatorframes[0]*3+1);
				player.setRow(4);
			}
			desiredyvel = speed;
			break;
		case 'd':
			if (changedirection){
				player.toFrame(this.animatorframes[0]*0+1);
				player.setRow(1);
			}
			desiredyvel = -speed;
			break;
		case 'ul':
			if (changedirection){
				if (player.eightway){
					player.toFrame(this.animatorframes[0]*7+1);
					player.setRow(8);
				}
				else {
					player.toFrame(this.animatorframes[0]*3+1);
					player.setRow(4);
				}
			}
			desiredxvel = -speed;
			desiredyvel = speed;
			break;
		case 'ur':
			if (changedirection){
				if (player.eightway){
					player.toFrame(this.animatorframes[0]*6+1);
					player.setRow(7);
				}
				else {
					player.toFrame(this.animatorframes[0]*3+1);
					player.setRow(4);
				}
			}
			desiredxvel = speed;
			desiredyvel = speed;
			break;
		case 'dl':
			if (changedirection){
				if (player.eightway){
					player.toFrame(this.animatorframes[0]*5+1);
					player.setRow(6);
				}
				else {
					player.toFrame(this.animatorframes[0]*0+1);
					player.setRow(1);
				}
			}
			desiredxvel = -speed;
			desiredyvel = -speed;  
			break;
		case 'dr':
			if (changedirection){
				if (player.eightway){
					player.toFrame(this.animatorframes[0]*4+1);
					player.setRow(4);
				}
				else {
					player.toFrame(this.animatorframes[0]*0+1);
					player.setRow(1);
				}
			}
			desiredxvel = speed;
			desiredyvel = -speed;
			break;
		case 'c':
			desiredxvel = desiredyvel = 0;
			player.animating = false;
			if (changedirection) switch (player.direction){
				case 'l':
					player.toFrame(this.animatorframes[0]*1+1);
					break;
				case 'r':
					player.toFrame(this.animatorframes[0]*2+1);
					break;
				case 'u':
					player.toFrame(this.animatorframes[0]*3+1);
					break;
				case 'd':
					player.toFrame(this.animatorframes[0]*0+1);
					break;
				case 'ul':
					if (!player.eightway) player.toFrame(this.animatorframes[0]*0+1);
					else player.toFrame(this.animatorframes[0]*7+1);
					break;
				case 'ur':
					if (!player.eightway) player.toFrame(this.animatorframes[0]*1+1);
					else player.toFrame(this.animatorframes[0]*6+1);
					break;
				case 'dl':
					if (!player.eightway) player.toFrame(this.animatorframes[0]*2+1);
					else player.toFrame(this.animatorframes[0]*5+1);
					break;
				case 'dr':
					if (!player.eightway) player.toFrame(this.animatorframes[0]*3+1);
					else player.toFrame(this.animatorframes[0]*4+1);
					break;
				default:       
			}  
			break;
		default:       
	}  
	
	player.direction = newdirection;
	if (newdirection !== 'c') player.facing = newdirection;
	
	
	if (player.physicsupdating){
		var vel = player.physicsbody.GetLinearVelocity();
		var xvelchange = desiredxvel - vel.x;
		var yvelchange = desiredyvel - vel.y;
		var ximpulse = player.physicsbody.GetMass() * xvelchange;
		var yimpulse = player.physicsbody.GetMass() * yvelchange;
		player.physicsbody.ApplyImpulse(new b2v2(ximpulse,yimpulse),
											   player.physicsbody.GetWorldCenter());
	}
	else {
		player.position.x += desiredxvel;
		player.position.y += desiredyvel;
	}
											   
}

function shmupControls(playerNum){

	if (undef(playerNum)) var playerNum = 0;

	var player = this, newdirection = 'c', changedirection = false;
	if (player.system.physicstype == 'box2d') var vel = player.physicsbody.GetLinearVelocity();
	if (player.system.physicstype == 'p2') var vel = {x: player.physicsbody.velocity[0], y: player.physicsbody.velocity[1]};
	var desiredxvel = desiredyvel = 0, speed = 0.839*7*15*1.5, slowingfactor = 5;
	var leftpressed = false, rightpressed = false,
		uppressed = false, downpressed = false;
		
	var runspeed = speed*2;
		
	if (player.hasOwnProperty('speed')) speed = player.speed;
	if (player.hasOwnProperty('runspeed')) runspeed = player.runspeed;
	
	if (!player.autodirection){
		if (system.analog.down){
			newdirection = system.analog.direction;
		}
		else if ((mainmouse.down || mainmouse.touches.length > 0)){// && mainmouse.canmoveplayer){
			//console.log(mainmouse.touches);
			if (mainmouse.canmoveplayer){
				if (mainmouse.down){
					var wx = (mainmouse.worldx)/currentarea.graph.scale.x;
					var wy = (mainmouse.worldy)/currentarea.graph.scale.y;
				}
				else if (mainmouse.touches.length > 0){
					var wx = mainmouse.touches[0].worldx;
					var wy = mainmouse.touches[0].worldy;
				}
				var vector = vec3(wx, wy, 0).sub(this.position.clone());
				//console.log(vector);
				//console.log(mainmouse.worldx, mainmouse.worldy);
				//worldx update not firing when moving character...
				console.log(vector.x, vector.y);
				if (system.framecounter % 40 === 0) newdirection = getDirectionFromVector(vector);
				else newdirection = player.direction;
			}
		}
		else {
			 
			leftpressed = ( keyboard.pressed("a") || keyboard.pressed("left") );
			rightpressed = ( keyboard.pressed("d") || keyboard.pressed("right") );
			uppressed = ( keyboard.pressed("w") || keyboard.pressed("up") );
			downpressed = ( keyboard.pressed("s") || keyboard.pressed("down") );
			
			if (Gamepad.supported){
			
				var pads = Gamepad.getStates();
				
				var pad = pads[playerNum]; // assume only 1 player.
				var prevpad = {
					dup: 0,
					ddown: 0,
					dleft: 0,
					dright: 0,
					lstickx: 0,
					lsticky: 0,
					rstickx: 0,
					rsticky: 0,
					button0: 0,
					button1: 0,
					button2: 0,
					button3: 0,
					start: 0,
					select: 0,
					rshoulder0: 0,
					rshoulder1: 0,
					lshoulder0: 0,
					lshoulder1: 0,
				};
				
				if (pad){
					
					if (pad.rightShoulder0){
						//console.log(pad);
						prevpad.rshoulder0 = 1;
					}
					if (pad.rightShoulder1){
						prevpad.rshoulder1 = 1;
					}
					if (pad.leftShoulder0){
						prevpad.lshoulder0 = 1;
					}
					if (pad.leftShoulder1){
						prevpad.lshoulder1 = 1;
					}
					if (pad.dpadUp){
						uppressed = true;
						prevpad.dup = 1;
					}
					if (pad.dpadDown){
						downpressed = true;
						prevpad.ddown = 1;
					}
					if (pad.dpadLeft){
						leftpressed = true;
						prevpad.dleft = 1;
					}
					if (pad.dpadRight){
						rightpressed = true;
						prevpad.dright = 1;
					}
					if (pad.leftStickX > 0.2){	
						rightpressed = true;
						prevpad.lstickx = pad.leftStickX;
					}
					if (pad.leftStickX < -0.2){	
						leftpressed = true;
						prevpad.lstickx = pad.leftStickX;
					}
					if (pad.leftStickY > 0.2){
						downpressed = true;
						prevpad.lsticky = pad.leftStickY;
					}
					if (pad.leftStickY < -0.2){
						uppressed = true;
						prevpad.lsticky = pad.leftStickY;
					}
					if (pad.rightStickX > 0.2){	
						prevpad.rstickx = pad.rightStickX;
					}
					if (pad.rightStickX < -0.2){	
						prevpad.rstickx = pad.rightStickX;
					}
					if (pad.rightStickY > 0.2){	
						prevpad.rsticky = pad.rightStickY;
					}
					if (pad.rightStickY < -0.2){	
						prevpad.rsticky = pad.rightStickY;
					}
					if ( pad.faceButton0 ){ // A on Xbox
						prevpad.button0 = 1;
					}
					if ( pad.faceButton1 ){ // B on Xbox
						prevpad.button1 = 1;
					}
					if ( pad.faceButton2 ){ // X on Xbox
						prevpad.button2 = 1;
					}
					if ( pad.faceButton3 ){ // Y on Xbox
						prevpad.button3 = 1;
					}
					if ( pad.start ){
						prevpad.start = 1;
					}
					if ( pad.select ){
						prevpad.select = 1;
					}
					
				}
				
				this.previouspad = {};
				
			}
			
			if (leftpressed || rightpressed || uppressed || downpressed){
				if ( leftpressed  && uppressed ) { 
					newdirection = 'ul'; 
				}
				else if ( leftpressed && downpressed ) { 
					newdirection = "dl";
				}
				else if ( rightpressed && uppressed  ) {  
					newdirection = "ur"; 
				}
				else if ( rightpressed && downpressed ) {
					newdirection = "dr";
				}
				else if ( leftpressed ) {   
					newdirection = "l"; 
				}
				else if ( rightpressed ) {                  
					newdirection = "r";
				}
				else if ( uppressed ) { 	
					newdirection = "u"; 
				}
				else if ( downpressed ) {   	
					newdirection = "d";
				}
			}
			else {
				newdirection = 'c';
			}		
		} 
	}
	else {
		if (player.autodirection) newdirection = player.autodirection;
		else newdirection = 'c';
	}
	
	if (player.dodirectionfinding){
	
		/*if (player.directionfinding[8] == 'reverse'){
			switch (newdirection){
				case 'u':
					newdirection = 'd';
					break;
				case 'd':
					newdirection = 'u';
					break;
				case 'l':
					newdirection = 'l';
					break;
				case 'r':
					newdirection = 'r';
					break;
				default:
					break;
			}
		}*/
	
		var s1 = 0;
		var s2 = 0;
		
		switch (newdirection){
			case 'u':
				s2 = -speed/100;
				break;
			case 'd':
				s2 = speed/100;
				break;
			case 'l':
				s1 = -speed/100;
				break;
			case 'r':
				s1 = speed/100;
				break;
			default:
				break;
		}
		
		if (currentarea.map.collisionmap)
			var isCollision = currentarea.map.collisionmap.checkForColorCollision(
				'square',
				player.position_0.x*100 + s1,
				-player.position_0.y*100 + s2,
				player.collisioncolors
			);
		else var isCollision = false;
		
		///if reverse, keep trying to go left or right here
		
		if (isCollision){
			console.log('collide');
			switch (newdirection){
				case 'u':
					if (player.directionfinding[0] == 'r') var sp1 = speed/100;
					if (player.directionfinding[0] == 'l') var sp1 = -speed/100;
					
					if (currentarea.map.collisionmap.checkForColorCollision('square', 
						player.position_0.x*100 + sp1,
						-player.position_0.y*100,
						player.collisioncolors
					)){
						if (player.directionfinding[0] == 'r') player.directionfinding[0] = 'l';
						else if (player.directionfinding[0] == 'l') player.directionfinding[0] = 'r';
						//player.directionfinding[4]++;
						//if (player.directionfinding[4] == 2) player.directionfinding[8] = 'reverse';
					}
					else{
						//can go left or right
						//if (player.directionfinding[8] == 'reverse')
					}
					
					//if (player.directionfinding[8] == 'reverse') newdirection = 'd';
					//else 
					newdirection = player.directionfinding[0];
					break;
				case 'd':
					if (player.directionfinding[1] == 'r') var sp1 = speed/100;
					if (player.directionfinding[1] == 'l') var sp1 = -speed/100;
					if (currentarea.map.collisionmap.checkForColorCollision('square', 
						player.position_0.x*100 + sp1,
						-player.position_0.y*100,
						player.collisioncolors
					)){
						if (player.directionfinding[1] == 'r') player.directionfinding[1] = 'l';
						else if (player.directionfinding[1] == 'l') player.directionfinding[1] = 'r';
					}
					newdirection = player.directionfinding[1];
					break;
				case 'l':
					if (player.directionfinding[2] == 'u') var sp1 = -speed/100;
					if (player.directionfinding[2] == 'd') var sp1 = speed/100;
					if (currentarea.map.collisionmap.checkForColorCollision('square', 
						player.position_0.x*100,
						-player.position_0.y*100 + sp1,
						player.collisioncolors
					)){
						if (player.directionfinding[2] == 'u') player.directionfinding[2] = 'd';
						else if (player.directionfinding[2] == 'd') player.directionfinding[2] = 'u';
					}
					newdirection = player.directionfinding[2];
					break;
				case 'r':
					if (player.directionfinding[3] == 'u') var sp1 = -speed/100;
					if (player.directionfinding[3] == 'd') var sp1 = speed/100;
					if (currentarea.map.collisionmap.checkForColorCollision('square', 
						player.position_0.x*100,
						-player.position_0.y*100 + sp1,
						player.collisioncolors
					)){
						if (player.directionfinding[3] == 'u') player.directionfinding[3] = 'd';
						else if (player.directionfinding[3] == 'd') player.directionfinding[3] = 'u';
					}
					newdirection = player.directionfinding[3];
					break;
			}
		}
	}

	if (newdirection !== player.direction) {
		changedirection = true;
		//player.animating = true;
	}
	switch (newdirection){
		case 'l':
			if (changedirection) {
				//player.toFrame(this.animatorframes[0]*1+1);
				//player.setRow(2);
			}
			desiredxvel = -speed;
			break;
		case 'r':
			if (changedirection) {
				//player.toFrame(this.animatorframes[0]*2+1);
				//player.setRow(3);
			}
			desiredxvel = speed;
			break;
		case 'u':
			if (changedirection) {
				//player.toFrame(this.animatorframes[0]*3+1);
				//player.setRow(4);
			}
			desiredyvel = speed;
			break;
		case 'd':
			if (changedirection) {
				//player.toFrame(this.animatorframes[0]*0+1);
				//player.setRow(1);
			}
			desiredyvel = -speed;
			break;
		case 'ul':
			if (changedirection) {
				if (player.eightway){
					//player.toFrame(this.animatorframes[0]*7+1);
					//player.setRow(8);
				}
				else {
					//player.toFrame(this.animatorframes[0]*3+1);
					//player.setRow(4);
				}
			}
			desiredxvel = -speed;
			desiredyvel = speed;
			/*if (currentarea.map.collisionmap){
				var diagCollision = currentarea.map.collisionmap.checkForColorCollision(
					'square',
					player.position_0.x*100 + -desiredxvel/100,
					-player.position_0.y*100 + -desiredyvel/100,
					player.collisioncolors
				);
				if (diagCollision){
					desiredxvel *= 1.5;
					desiredyvel *= 1.5;
				}
			}*/
			break;
		case 'ur':
			if (changedirection) {
				if (player.eightway){
					//player.toFrame(this.animatorframes[0]*6+1);
					//player.setRow(7);
				}
				else {
					//player.toFrame(this.animatorframes[0]*3+1);
					//player.setRow(4);
				}
			}
			desiredxvel = speed;
			desiredyvel = speed;
			/*if (currentarea.map.collisionmap){
				var diagCollision = currentarea.map.collisionmap.checkForColorCollision(
					'square',
					player.position_0.x*100 + -desiredxvel/100,
					-player.position_0.y*100 + -desiredyvel/100,
					player.collisioncolors
				);
				if (diagCollision){
					desiredxvel *= 1.5;
					desiredyvel *= 1.5;
				}
			}*/
			break;
		case 'dl':
			if (changedirection) {
				if (player.eightway){
					//player.toFrame(this.animatorframes[0]*5+1);
					//player.setRow(6);
				}
				else {
					//player.toFrame(this.animatorframes[0]*0+1);
					//player.setRow(1);
				}
			}
			desiredxvel = -speed;
			desiredyvel = -speed;
			/*if (currentarea.map.collisionmap){
				var diagCollision = currentarea.map.collisionmap.checkForColorCollision(
					'square',
					player.position_0.x*100 + -desiredxvel/100,
					-player.position_0.y*100 + -desiredyvel/100,
					player.collisioncolors
				);
				if (diagCollision){
					desiredxvel *= 1.5;
					desiredyvel *= 1.5;
				}	
			}*/
			break;
		case 'dr':
			if (changedirection) {
				if (player.eightway){
					//player.toFrame(this.animatorframes[0]*4+1);
					//player.setRow(5);
				}
				else {
					//player.toFrame(this.animatorframes[0]*0+1);
					//player.setRow(1);
				}
			}
			desiredxvel = speed;
			desiredyvel = -speed;
			/*if (currentarea.map.collisionmap){
				var diagCollision = currentarea.map.collisionmap.checkForColorCollision(
					'square',
					player.position_0.x*100 + -desiredxvel/100,
					-player.position_0.y*100 + -desiredyvel/100,
					player.collisioncolors
				);
				if (diagCollision){
					desiredxvel *= 1.5;
					desiredyvel *= 1.5;
				}
			}*/
			break;
		case 'c':
			desiredxvel = desiredyvel = 0;
			player.animating = false;
			if (changedirection) switch (player.direction){
				case 'l':
					//player.toFrame(this.animatorframes[0]*1+1);
					break;
				case 'r':
					//player.toFrame(this.animatorframes[0]*2+1);
					break;
				case 'u':
					//player.toFrame(this.animatorframes[0]*3+1);
					break;
				case 'd':
					//player.toFrame(this.animatorframes[0]*0+1);
					break;
				case 'ul':
					//if (!player.eightway) player.toFrame(this.animatorframes[0]*0+1);
					//else player.toFrame(this.animatorframes[0]*7+1);
					break;
				case 'ur':
					//if (!player.eightway) player.toFrame(this.animatorframes[0]*1+1);
					//else player.toFrame(this.animatorframes[0]*6+1);
					break;
				case 'dl':
					//if (!player.eightway) player.toFrame(this.animatorframes[0]*2+1);
					//else player.toFrame(this.animatorframes[0]*5+1);
					break;
				case 'dr':
					//if (!player.eightway) player.toFrame(this.animatorframes[0]*3+1);
					//else player.toFrame(this.animatorframes[0]*4+1);
					break;
				default:       
			}  
			break;
		default:       
	}  
	
	player.direction = newdirection;
	if (newdirection !== 'c') player.facing = newdirection;
	
	var xvelchange = desiredxvel - vel.x;
	var yvelchange = desiredyvel - vel.y;
	
	if (player.system.physicstype == 'box2d'){
		var ximpulse = player.physicsbody.GetMass() * xvelchange;
		var yimpulse = player.physicsbody.GetMass() * yvelchange;
		player.physicsbody.ApplyImpulse(new b2v2(ximpulse,yimpulse),
												   player.physicsbody.GetWorldCenter());
	}
	if (player.system.physicstype == 'p2'){
		var ximpulse = player.physicsbody.mass * xvelchange;
		var yimpulse = player.physicsbody.mass * yvelchange;
		player.physicsbody.velocity = [(player.physicsbody.mass * xvelchange)/100,
									(player.physicsbody.mass * yvelchange)/100];
		//console.log(player.physicsbody.position[0],player.physicsbody.position[1]);
	}
	
	
											   
	if (player.position.x >= currentarea.map.xmin &&
		player.position.x <= currentarea.map.xmax ){
			camera.position.x = player.position.x*currentarea.graph.scale.x;            
	}
	if (player.position.y >= currentarea.map.ymin &&
		player.position.y <= currentarea.map.ymax){
			camera.position.y = player.position.y*currentarea.graph.scale.y; 
	}
	//camera.position.x = player.position.x*currentarea.graph.scale.x;
	//camera.position.y = player.position.y*currentarea.graph.scale.y; 
            
	if ( keyboard.up("space") || keyboard.up("enter") || (pad && pad.faceButton1)) {
		//shoot bullet
		lasers[lasercounter].physicsbody.position[0] = player.physicsbody.position[0];
		lasers[lasercounter].physicsbody.position[1] = player.physicsbody.position[1]+10/100;
		lasers[lasercounter].position_0 = v2(player.physicsbody.position[0],player.physicsbody.position[1]+10/100);
		lasers[lasercounter].position_1 = v2(player.physicsbody.position[0],player.physicsbody.position[1]+10/100);
		lasers[lasercounter].physicsbody.velocity = [0,10];
		if (lasercounter == 24) lasercounter = 0;
		else lasercounter++;
	}
}