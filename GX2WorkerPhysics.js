//global = {};

importScripts('physics/p2.js');
//importScripts('physics/p2.js', 'physics/p2.extras.js');

var lastCallTime = 0;
var timeSinceLastCall = 0;
var now = 0;
var maxSubSteps = 3;

var world = new p2.World();

onmessage = function(e){
	var result = '';
	now = Date.now() / 1000;
	timeSinceLastCall = now-lastCallTime;
	lastCallTime = now;
	//var world = new p2.World({                   // Enable stats
	//	gravity : [0, 0],                      // Set gravity
	//	broadphase : new p2.SAPBroadphase()    // Broadphase algorithm
	//});
	//world.fromJSON(e.data);
	world.step(1/60, 1/60, maxSubSteps);
	//world.step(1/60, 1/60, maxSubSteps);
	result = world.toJSON();
	sendback(result);
	//sendback(e.data + 'fixed');
};
 
function sendback(sb){
	postMessage(sb);
}