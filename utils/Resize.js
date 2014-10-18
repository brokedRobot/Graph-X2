
window.onresize = function(){

	for (var i=0; i<systems.length; i++){
	
		if (undef(systems[i])) return;
	
		var temph = systems[i].game.getHeightRatio();
		var tempw = systems[i].game.getWidthRatio();
		
		if (systems[i].game.hud.initialized){
			if (systems[i].game.abutton.mesh) systems[i].game.abutton.mesh.scale.x = 2*(temph / tempw);
			if (systems[i].game.bbutton.mesh) systems[i].game.bbutton.mesh.scale.x = 2*(temph / tempw);
			if (systems[i].game.startbutton.mesh) systems[i].game.startbutton.mesh.scale.x = 2*(temph / tempw);
			if (systems[i].game.selectbutton.mesh) systems[i].game.selectbutton.mesh.scale.x = 2*(temph / tempw);
			if (systems[i].game.menubutton.mesh) systems[i].game.menubutton.mesh.scale.x = 2*(temph / tempw);
			if (systems[i].game.analog.mesh) systems[i].game.analog.mesh.scale.x = 2*(temph / tempw);
			if (systems[i].game.joyarrows.mesh) systems[i].game.joyarrows.mesh.scale.x = 2*(temph / tempw);
		}

		if (systems[i].renderer && systems[i].camera){ 
			systems[i].renderer.setSize( tempw, temph );
			systems[i].camera.aspect = tempw / temph;
			systems[i].camera.updateProjectionMatrix();
		}
		
		if (systems[i].currentarea){
			for (var i = 0; i < systems[i].currentarea.particlesystems.length; i++) {
				systems[i].currentarea.particlesystems[i].particlewindowscale = temph/500;
			}
		}
			
		if (systems[i].game.effects){
			var renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
			systems[i].game.effects.composer.renderTarget1 = new THREE.WebGLRenderTarget( tempw, temph, renderTargetParameters );

			systems[i].game.effects.composer.renderTarget2 = systems[i].game.effects.composer.renderTarget1.clone();
		}
		
		if (systems[i].autocenter){
			$(systems[i].container).css({
				position:'absolute',
				left: ($(window).width() - $(systems[i].container).outerWidth())/2,
				top: ($(window).height() - $(systems[i].container).outerHeight())/2,
			});
		}
		if (systems[i].autoresize && false){
			$(systems[i].renderer.domElement).css({
				width: tempw + 'px',
				height: temph + 'px',
			});
		}
		//console.log(tempw,temph);
		/*$(systems[i].renderer.domElement).css({
			width: tempw + 'px',
			height: temph + 'px',
		});*/
		$(systems[i].container.children[0]).css({
			position:'absolute',
			left: ($(systems[i].container).outerWidth() - $(systems[i].container.children[0]).outerWidth())/2,
			top: ($(systems[i].container).outerHeight() - $(systems[i].container.children[0]).outerHeight())/2,
		});
		console.log(systems[i]);
		
	}

};

function onDocReady(){
   window.onresize();
}
function onWinLoad(){
  window.onresize();
}

if ( document.addEventListener ) {

  document.addEventListener( "DOMContentLoaded", onDocReady, false );
  window.addEventListener( "load", onWinLoad, false );
	
} else if ( document.attachEvent ) {

  document.attachEvent( "onreadystatechange", onDocReady );
  window.attachEvent( "onload", onWinLoad );
	 
}