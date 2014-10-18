
function getImpactVector(evt){
	var impactx = (evt.bodyA.velocity.x * evt.bodyA.mass) - (evt.bodyB.velocity.x * evt.bodyB.mass);
	var impacty = (evt.bodyA.velocity.y * evt.bodyA.mass) - (evt.bodyB.velocity.y * evt.bodyB.mass);
	return {x: impactx, y: impacty};
}

function physicsGraveyard(){

   for (var i = 0; i < physicsgraveyard.length; i++){
      physicsgraveyard[i].destroyPhysicsBody();
   }
   physicsgraveyard = [];
   
}

function clearPhysics(){

   for (var i = 0; i < bodies.length; i++){
      if (physicstype == 'box2d') bodies[i].GetWorld().DestroyBody( bodies[i] );
   }
   bodies = [];
   
}  

function p2Particle(opts){

	if (undef(opts)) var opts = {};
	
	var parentobj = opts.hasOwnProperty('parentobj') ? opts.parentobj : false;
	
	var mass = opts.hasOwnProperty('mass') ? opts.mass : 0;
	var position = opts.hasOwnProperty('position') ? [opts.position.x, opts.position.y] : [0,0];
	var angleUnits = opts.hasOwnProperty('angleunits') ? opts.angleunits : 'deg';
	var angle = opts.hasOwnProperty('angle') ? opts.angle : 0;
	var angularVelocity = opts.hasOwnProperty('angularvelocity') ? opts.angularvelocity : 0;
		if (opts.hasOwnProperty('torque')) angularVelocity = opts.torque;

	var particleShape = new p2.Particle();
	var particle = new p2.Body({
		mass: mass,
		position: position,
		angle: angle,
		angularVelocity : angularVelocity
	});
	particle.addShape(particleShape);
	parentobj.system.world.addBody(particle);
	particle.parentobj = parentobj;
	
	return particle; 

}

function p2Circle(opts){

	if (undef(opts)) var opts = {};
	
	var parentobj = opts.hasOwnProperty('parentobj') ? opts.parentobj : false;
	
	var mass = opts.hasOwnProperty('mass') ? opts.mass : 0;
	var radius = opts.hasOwnProperty('radius') ? opts.radius/100 : 1;
	var position = opts.hasOwnProperty('position') ? [opts.position.x/100, opts.position.y/100] : [0,0];
	var angleUnits = opts.hasOwnProperty('angleunits') ? opts.angleunits : 'deg';
	var angle = opts.hasOwnProperty('angle') ? opts.angle : 0;
	var angularVelocity = opts.hasOwnProperty('angularvelocity') ? opts.angularvelocity : 0;
		if (opts.hasOwnProperty('torque')) angularVelocity = opts.torque;

	var circleShape = new p2.Circle(radius);
	var circle = new p2.Body({
		mass: mass,
		position: position,
		angle: angle,
		angularVelocity : angularVelocity
	});
	circle.addShape(circleShape);
	parentobj.system.world.addBody(circle);
	circle.parentobj = parentobj;
	
	return circle;

}

function p2Rectangle(opts){

	if (undef(opts)) var opts = {};
	
	var parentobj = opts.hasOwnProperty('parentobj') ? opts.parentobj : false;
	
	var mass = opts.hasOwnProperty('mass') ? opts.mass : 0;
	var width = opts.hasOwnProperty('width') ? opts.width/100 : 1;
		if (opts.hasOwnProperty('w')) width = opts.w/100;
	var height = opts.hasOwnProperty('height') ? opts.height/100 : 1;
		if (opts.hasOwnProperty('h')) height = opts.h/100;
	var position = opts.hasOwnProperty('position') ? [opts.position.x/100, opts.position.y/100] : [0,0];
	var angleUnits = opts.hasOwnProperty('angleunits') ? opts.angleunits : 'deg';
	var angle = opts.hasOwnProperty('angle') ? opts.angle : 0;
	var angularVelocity = opts.hasOwnProperty('angularvelocity') ? opts.angularvelocity : 0;
		if (opts.hasOwnProperty('torque')) angularVelocity = opts.torque;

	var rectangleShape = new p2.Rectangle(width, height);
	var rectangle = new p2.Body({
		mass: mass,
		position: position,
		angle: angle,
		angularVelocity : angularVelocity
	});
	rectangle.addShape(rectangleShape);
	parentobj.system.world.addBody(rectangle);
	rectangle.parentobj = parentobj;
	
	return rectangle;

}

function p2Convex(opts){

	if (undef(opts)) var opts = {};
	
	var parentobj = opts.hasOwnProperty('parentobj') ? opts.parentobj : false;
	
	var ngon = opts.hasOwnProperty('ngon') ? opts.ngon : 0;
	
	var verts = opts.hasOwnProperty('verts') ? opts.verts : [];
	
	if (ngon != 0){
		for(var i=0, N=ngon; i<N; i++){
			var a = 2*Math.PI / N * i;
			verts.push([0.5*Math.cos(a),0.5*Math.sin(a)]);
		}
	}
	
	var mass = opts.hasOwnProperty('mass') ? opts.mass : 0;
	var position = opts.hasOwnProperty('position') ? [opts.position.x, opts.position.y] : [0,0];
	var angleUnits = opts.hasOwnProperty('angleunits') ? opts.angleunits : 'deg';
	var angle = opts.hasOwnProperty('angle') ? opts.angle : 0;
	var angularVelocity = opts.hasOwnProperty('angularvelocity') ? opts.angularvelocity : 0;
		if (opts.hasOwnProperty('torque')) angularVelocity = opts.torque;

	var convexShape = new p2.Convex(verts);
	var convex = new p2.Body({
		mass: mass,
		position: position,
		angle: angle,
		angularVelocity : angularVelocity
	});
	convex.addShape(convexShape);
	parentobj.system.world.addBody(convex);
	convex.parentobj = parentobj;
	
	return convex;

}

function p2Concave(opts){

	if (undef(opts)) var opts = {};
	
	var parentobj = opts.hasOwnProperty('parentobj') ? opts.parentobj : false;
	
	var verts = opts.hasOwnProperty('verts') ? opts.verts : [[0,0],[1,0],[0.5,1]];
	
	var mass = opts.hasOwnProperty('mass') ? opts.mass : 0;
	var position = opts.hasOwnProperty('position') ? [opts.position.x, opts.position.y] : [0,0];
	var angleUnits = opts.hasOwnProperty('angleunits') ? opts.angleunits : 'deg';
	var angle = opts.hasOwnProperty('angle') ? opts.angle : 0;
	var angularVelocity = opts.hasOwnProperty('angularvelocity') ? opts.angularvelocity : 0;
		if (opts.hasOwnProperty('torque')) angularVelocity = opts.torque;

	var concave = new p2.Body({ mass : 1, position:[0,2] });
	concave.fromPolygon(verts);

	parentobj.system.world.addBody(concave);
	concave.parentobj = parentobj;
	
	return concave;
	
}

function p2Capsule(opts){

	if (undef(opts)) var opts = {};
	
	var parentobj = opts.hasOwnProperty('parentobj') ? opts.parentobj : false;
	
	var mass = opts.hasOwnProperty('mass') ? opts.mass : 0;
	var position = opts.hasOwnProperty('position') ? [opts.position.x, opts.position.y] : [0,0];
	var angleUnits = opts.hasOwnProperty('angleunits') ? opts.angleunits : 'deg';
	var angle = opts.hasOwnProperty('angle') ? opts.angle : 0;
	var angularVelocity = opts.hasOwnProperty('angularvelocity') ? opts.angularvelocity : 0;
		if (opts.hasOwnProperty('torque')) angularVelocity = opts.torque;

	var capsuleShape = new p2.Capsule();
	var capsule = new p2.Body({
		mass: mass,
		position: position,
		angle: angle,
		angularVelocity : angularVelocity
	});
	capsule.addShape(capsuleShape);
	parentobj.system.world.addBody(capsule);
	capsule.parentobj = parentobj;
	
	return capsule;

}

function p2Line(opts){

	if (undef(opts)) var opts = {};
	
	var parentobj = opts.hasOwnProperty('parentobj') ? opts.parentobj : false;
	
	var mass = opts.hasOwnProperty('mass') ? opts.mass : 0;
	var length = opts.hasOwnProperty('length') ? opts.length : 1;
	var position = opts.hasOwnProperty('position') ? [opts.position.x, opts.position.y] : [0,0];
	var angleUnits = opts.hasOwnProperty('angleunits') ? opts.angleunits : 'deg';
	var angle = opts.hasOwnProperty('angle') ? opts.angle : 0;
	var angularVelocity = opts.hasOwnProperty('angularvelocity') ? opts.angularvelocity : 0;
		if (opts.hasOwnProperty('torque')) angularVelocity = opts.torque;

	var lineShape = new p2.Line(length);
	var line = new p2.Body({
		mass: mass,
		position: position,
		angle: angle,
		angularVelocity : angularVelocity
	});
	line.addShape(lineShape);
	parentobj.system.world.addBody(line);
	line.parentobj = parentobj;
	
	return line;

}

function p2Plane(opts){

	if (undef(opts)) var opts = {};
	
	var parentobj = opts.hasOwnProperty('parentobj') ? opts.parentobj : false;
	
	var mass = opts.hasOwnProperty('mass') ? opts.mass : 0;
	var position = opts.hasOwnProperty('position') ? [opts.position.x, opts.position.y] : [0,0];
	var angleUnits = opts.hasOwnProperty('angleunits') ? opts.angleunits : 'deg';
	var angle = opts.hasOwnProperty('angle') ? opts.angle : 0;
	var angularVelocity = opts.hasOwnProperty('angularvelocity') ? opts.angularvelocity : 0;
		if (opts.hasOwnProperty('torque')) angularVelocity = opts.torque;

	var planeShape = new p2.Plane();
	var plane = new p2.Body({
		mass: mass,
		position: position,
		angle: angle,
		angularVelocity : angularVelocity
	});
	plane.addShape(planeShape);
	parentobj.system.world.addBody(plane);
	plane.parentobj = parentobj;
	
	return plane;
	
}

function p2Jelly(opts){

	if (undef(opts.model)) return;

	var model = opts.model;
	
	var verts = model.mesh.geometry.vertices;
	var faces = model.mesh.geometry.faces;
	
	var particles = [];
	
	var springiness = opts.hasOwnProperty('springiness') ? opts.springiness : 700;
	var damping = opts.hasOwnProperty('damping') ? opts.damping : 10;
	var mass = opts.hasOwnProperty('mass') ? opts.mass : 1;
	var maxForce = opts.hasOwnProperty('maxForce') ? opts.maxforce : Number.MAX_VALUE;
	
	var radius = opts.hasOwnProperty('radius') ? opts.radius : 5;
	
	var width = opts.hasOwnProperty('width') ? opts.width : 10;
	var height = opts.hasOwnProperty('height') ? opts.height : 10;
	
	var shape = opts.hasOwnProperty('shape') ? opts.shape : 'circle';
	
	var fixedrotation = opts.hasOwnProperty('fixedrotation') ? opts.fixedrotation : true;
	
	var prismatic = opts.hasOwnProperty('prismatic') ? opts.prismatic : false;
	var lock = opts.hasOwnProperty('lock') ? opts.lock : true;
	var distance = opts.hasOwnProperty('distance') ? opts.distance : true;
	var spring = opts.hasOwnProperty('spring') ? opts.spring : true;
	
	var ul = opts.hasOwnProperty('upperlimit') ? opts.upperlimit : 0.5;
	var ll = opts.hasOwnProperty('lowerlimit') ? opts.lowerlimit : -0.5;
	
	var xscale = opts.hasOwnProperty('xscale') ? opts.xscale : model.mesh.scale.x;
	var yscale = opts.hasOwnProperty('yscale') ? opts.yscale : model.mesh.scale.y;
	
	var smultiplier = opts.hasOwnProperty('smultiplier') ? opts.smultiplier : 1;
	
	model.restitution = opts.hasOwnProperty('restitution') ? opts.restitution : 1;
	
	for (var i=0; i<verts.length; i++){
		
		switch (shape){
			case 'rect': case 'rectangle':
				var particle = new p2Rectangle({
						mass: mass,
						width: width,
						height: height,
						position: {
							x: model.position.x + verts[i].z*xscale*smultiplier,//100,
							y: model.position.y + verts[i].x*yscale*smultiplier,//100
						},
						fixedRotation: fixedrotation,
						parentobj: model
					});
				break;
			case 'circ': case 'circle': default:
				var particle = new p2Circle({
						mass: mass,
						radius: radius,
						position: {
							x: model.position.x + verts[i].z*xscale*smultiplier,//100, 
							y: model.position.y + verts[i].x*yscale*smultiplier,//100
						},
						fixedRotation: fixedrotation,
						parentobj: model
					});
				break;
			case 'part': case 'particle':
				var particle = new p2.Particle({
						parentobj: model
				});
				break;
		}
		
		particle.parentobj = model;
	
		var par = {vertex: verts[i], body: particle, model: model};
		par.set_p0 = function(){
			this.position_0 = v2(this.body.position[0], this.body.position[1]);
		}.bind(par);
		par.set_p1 = function(){
			this.position_1 = v2(this.body.position[0], this.body.position[1]);
		}.bind(par);
		par.updatePhysics = function(){
			
			if (undef(this.position_0)) return;
			
			var newpos0 = v2(this.position_0.x, this.position_0.y);
			var newpos1 = v2(this.position_1.x, this.position_1.y);
								  
			newpos0.x *= 100; newpos0.y *= 100;
			newpos1.x *= 100; newpos1.y *= 100;
			
			if (this.model.system.currentarea.map.collisionmap)
				var newposition = this.model.system.currentarea.map.collisionmap.preventColorCollision(
					newpos0, newpos1, this.body, this.model.collisioncolors);
			else var newposition = newpos1;
			
			if (newposition.x != newpos1.x || newposition.y != newpos1.y){
				
				var tvec = v2(
					newpos1.x - newpos0.x,
					newpos1.y - newpos0.y
				);
				
				par.model.applyForce([-tvec.x*this.model.restitution,-tvec.y*this.model.restitution]);
				
			}
			
			///todo: event collision
			/*var offsettemp = new Vec3(newpos1.x, newpos1.y, 0);
			var offset = offsettemp.sub(this.position);

			///pass an object {position: {x: this.body.position[0]...etc.
			var eventcols = isEventCollision(this, offset.multiplyScalar(1));
			if (eventcols){
				for (var i=0; i < eventcols.length; i++){ 
					if (!eventcols[i].passable) newposition = newpos0;
				} 
			}*/
			
			this.body.position = [newposition.x/100, newposition.y/100];
			
			//this.setPosition({'x': newposition.x, 'y': newposition.y});// - this.physicsoffset.x;
			
		}.bind(par);
	
		particles.push(par);
		
	}
	
	for (var i=0; i<faces.length; i++){
	
		if (faces[i] instanceof THREE.Face4){
		
			var pA = particles[faces[i].a];
			var pB = particles[faces[i].b];
			var pC = particles[faces[i].c];
			var pD = particles[faces[i].d];
			
			if (prismatic){
				var dista = new p2.PrismaticConstraint(pA.body,pB.body, {
					localAnchorA : [0,0],
					localAnchorB : [pB.body.position[0] - pA.body.position[0], pB.body.position[1] - pA.body.position[1]],
					localAxisA :   [1,0],
					maxForce: maxForce
				});
				dista.upperLimitEnabled = true;
				dista.upperLimit = ul;
				dista.lowerLimitEnabled = true;
				dista.lowerLimit = ll;
				model.system.world.addConstraint(dista);
				
				var distb = new p2.PrismaticConstraint(pB.body,pC.body, {
					localAnchorA : [0,0],
					localAnchorB : [pC.body.position[0] - pB.body.position[0], pC.body.position[1] - pB.body.position[1]],
					localAxisA :   [1,0],
					maxForce: maxForce
				});
				distb.upperLimitEnabled = true;
				distb.upperLimit = ul;
				distb.lowerLimitEnabled = true;
				distb.lowerLimit = ll;
				model.system.world.addConstraint(distb);
				
				var distc = new p2.PrismaticConstraint(pC.body,pD.body, {
					localAnchorA : [0,0],
					localAnchorB : [pD.body.position[0] - pC.body.position[0], pD.body.position[1] - pC.body.position[1]],
					localAxisA :   [1,0],
					maxForce: maxForce
				});
				distc.upperLimitEnabled = true;
				distc.upperLimit = ul;
				distc.lowerLimitEnabled = true;
				distc.lowerLimit = ll;
				model.system.world.addConstraint(distc);
				
				var distd = new p2.PrismaticConstraint(pD.body,pA.body, {
					localAnchorA : [0,0],
					localAnchorB : [pA.body.position[0] - pD.body.position[0], pA.body.position[1] - pD.body.position[1]],
					localAxisA :   [1,0],
					maxForce: maxForce
				});
				distd.upperLimitEnabled = true;
				distd.upperLimit = ul;
				distd.lowerLimitEnabled = true;
				distd.lowerLimit = ll;
				model.system.world.addConstraint(distd);
			}
			if (lock){
				var pva = [(pB.body.position[0]-pA.body.position[0]),(pB.body.position[1]-pA.body.position[1])];
				var dista = new p2.LockConstraint(pA.body,pB.body, {
					localOffsetB : pva,
					localAngleB : 0,
					maxForce: maxForce
				});
				model.system.world.addConstraint(dista);
				
				var pvb = [(pC.body.position[0]-pB.body.position[0]),(pC.body.position[1]-pB.body.position[1])];
				var distb = new p2.LockConstraint(pB.body,pC.body, {
					localOffsetB : pvb,
					localAngleB : 0,
					maxForce: maxForce
				});
				model.system.world.addConstraint(distb);
				
				var pvc = [(pD.body.position[0]-pC.body.position[0]),(pD.body.position[1]-pC.body.position[1])];
				var distc = new p2.LockConstraint(pC.body,pD.body, {
					localOffsetB : pvc,
					localAngleB : 0,
					maxForce: maxForce
				});
				model.system.world.addConstraint(distc);
				
				var pvd = [(pA.body.position[0]-pD.body.position[0]),(pA.body.position[1]-pD.body.position[1])];
				var distd = new p2.LockConstraint(pD.body,pA.body, {
					localOffsetB : pvd,
					localAngleB : 0,
					maxForce: maxForce
				});
				model.system.world.addConstraint(distd);
			}
			if (distance){
				var da = distance2d({x: pA.body.position[0], y: pA.body.position[1]}, 
									{x: pB.body.position[0], y: pB.body.position[1]});
				var dista = new p2.DistanceConstraint(pA.body, pB.body, da);
				model.system.world.addConstraint(dista);
				
				var db = distance2d({x: pB.body.position[0], y: pB.body.position[1]}, 
									{x: pC.body.position[0], y: pC.body.position[1]});
				var distb = new p2.DistanceConstraint(pB.body, pC.body, db);
				model.system.world.addConstraint(distb);
				
				var dc = distance2d({x: pC.body.position[0], y: pC.body.position[1]}, 
									{x: pD.body.position[0], y: pD.body.position[1]});
				var distc = new p2.DistanceConstraint(pC.body, pD.body, dc);
				model.system.world.addConstraint(distc);
				
				var dd = distance2d({x: pD.body.position[0], y: pD.body.position[1]}, 
									{x: pA.body.position[0], y: pA.body.position[1]});
				var distd = new p2.DistanceConstraint(pD.body, pA.body, dd);
				model.system.world.addConstraint(distd);
			}
			if (spring){
				var spring = new p2.Spring(pA.body, pC.body, {
					stiffness: springiness,
					restLength: distance2d(
						{x: pA.body.position[0], y: pA.body.position[1]},
						{x: pC.body.position[0], y: pC.body.position[1]}
					)
				});
				model.system.world.addSpring(spring);
				//pA.spring = spring;
				//pC.spring = spring;
				var spring = new p2.Spring(pB.body, pD.body, {
					stiffness: springiness,
					restLength: distance2d(
						{x: pB.body.position[0], y: pB.body.position[1]},
						{x: pD.body.position[0], y: pD.body.position[1]}
					)
				});
				model.system.world.addSpring(spring);
				//pB.spring = spring;
				//pD.spring = spring;
			}
			
		
		}
		else if (faces[i] instanceof THREE.Face3){
		
			
		
		}
	
	}
	
	model.meshupdate = function(){
	
		var avg1 = 0;
		var avg2 = 0;
	
		for (var i=0; i<this.particles.length; i++){
		
			this.particles[i].updatePhysics();
		
			avg1 += this.particles[i].body.position[0]*100;
			avg2 += this.particles[i].body.position[1]*100;
		
			this.particles[i].vertex.z = -this.position.x*(100/this.mesh.scale.x)/100 + this.particles[i].body.position[0]*(100/this.mesh.scale.x);
			this.particles[i].vertex.x = -this.position.y*(100/this.mesh.scale.x)/100 + this.particles[i].body.position[1]*(100/this.mesh.scale.y);

		}
		
		avg1 /= this.particles.length;
		avg2 /= this.particles.length;

		this.position.set(avg1, avg2, this.position.z);
		
		//console.log(this.position);
		
		this.mesh.geometry.verticesNeedUpdate = true;
	
	}.bind(model);

	model.particles = particles;
	model.meshupdating = true;
	
	model.mesh.geometry.verticesNeedUpdate = true;
	
	model.setVelocity = function(v){
		console.log(this.particles);
		for (var i=0; i<this.particles.length; i++){
			this.particles[i].body.velocity = v;
		}
	}.bind(model);
	model.applyForce = function(f){
		//console.log(this.particles);
		for (var i=0; i<this.particles.length; i++){
			this.particles[i].body.applyForce(f,this.particles[i].body.position);
		}
	}.bind(model);

}

function p2DistanceConstraint(bodyA, bodyB, opts){
	
	if (undef(opts)) opts = {};
	if (undef(opts.distance)) opts.distance = 100;
	
	var dc = new p2.DistanceConstraint(bodyA, bodyB, opts.distance/100);
	
	if (!undef(opts.breaklimit)) dc._breaklimit = opts.breaklimit;
	else dc._breaklimit = Infinity;
	
	bodyA.parentobj.system.world.addConstraint(dc);
	
	return dc;

}

function p2RevoluteConstraint(bodyA, bodyB, opts){

	if (undef(opts)) opts = {
		pivotA: [1.0, 0],
		pivotB : [-1.0, 0]
	}

	var rc = new p2.RevoluteConstraint(bodyA, opts.pivotA, bodyB, opts.pivotB);
	
	if (!undef(opts.upperlimit)){
		rc.upperLimitEnabled = true;
		rc.upperLimit = opts.upperlimit;
	}
	
	if (!undef(opts.lowerlimit)){
		rc.lowerLimitEnabled = true;
		rc.lowerLimit = opts.lowerlimit;
	}
	
	if (!undef(opts.breaklimit)) rc._breaklimit = opts.breaklimit;
	else rc._breaklimit = Infinity;
	
	bodyA.parentobj.system.world.addConstraint(rc);
	
	return rc;
	
}

function p2PrismaticConstraint(bodyA, bodyB, opts){
	
	if (undef(opts)) opts = {
		localAnchorA : [ 1, 0],
		localAnchorB : [-1, 0],
		localAxisA :   [ 0, 1]
	}
	
	var pc = new p2.PrismaticConstraint(bodyA, bodyB, opts);

	if (!undef(opts.upperlimit)){
		pc.upperLimitEnabled = true;
		pc.upperLimit = opts.upperlimit;
	}
	
	if (!undef(opts.lowerlimit)){
		pc.lowerLimitEnabled = true;
		pc.lowerLimit = opts.lowerlimit;
	}
	
	if (!undef(opts.breaklimit)) pc._breaklimit = opts.breaklimit;
	else pc._breaklimit = Infinity;
	
	bodyA.parentobj.system.world.addConstraint(pc);
	
	return pc;

}

function p2LockConstraint(bodyA, bodyB, opts){
	
	if (undef(opts)) opts = { 
		localOffsetB: [1,0], 
		localAngleB: Math.PI/4,
		maxForce: Number.MAX_VALUE
	}
	
	var lc = new p2.LockConstraint(bodyA, bodyB, opts);
	
	if (!undef(opts.breaklimit)) lc._breaklimit = opts.breaklimit;
	else lc._breaklimit = Infinity;
	
	bodyA.parentobj.system.world.addConstraint(lc);
	
	return lc;

}

function p2GearConstraint(bodyA, bodyB, opts){

	if (undef(opts)) opts = {};
	
	if (undef(opts.ratio)) opts.ratio = 1;
	if (undef(opts.jointA)) opts.jointA = [-1,0];
	if (undef(opts.jointA)) opts.jointB = [0,0];
	if (undef(opts.jointA)) opts.jointC = [1,0];
	if (undef(opts.jointA)) opts.jointD = [0,0];
	if (undef(opts.position)) opts.position = bodyA.position;

	var dummyBody = new p2.Body({position: opts.position});
	bodyA.parentobj.system.world.addBody(dummyBody);

	var c1 = new p2.RevoluteConstraint(dummyBody,opts.jointA,bodyA,opts.jointB),
		c2 = new p2.RevoluteConstraint(dummyBody,opts.jointC,bodyB,opts.jointD);
	bodyA.parentobj.system.world.addConstraint(c1);
	bodyA.parentobj.system.world.addConstraint(c2);

	var gc = new p2.GearConstraint(bodyA, bodyB, opts);
	bodyA.parentobj.system.world.addConstraint(gc);
	
	if (!undef(opts.breaklimit)) gc._breaklimit = opts.breaklimit;
	else gc._breaklimit = Infinity;
	
	return gc;
	
}

function p2Spring(bodyA, bodyB, opts){

	if (undef(opts)) var opts = {
		stiffness: 1000,
		restLength: 0.35,
		damping : 10
	};

	var sc = new p2.Spring(bodyA, bodyB, opts);
	
	if (!undef(opts.breaklimit)) sc._breaklimit = opts.breaklimit;
	else sc._breaklimit = Infinity;
	
	bodyA.parentobj.system.world.addSpring(sc);
	
	return sc;

}