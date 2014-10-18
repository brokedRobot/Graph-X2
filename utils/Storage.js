Function.prototype.toJSON=Function.toString; //extend JSON to cover Functions

if (false) {
	var fs = require('fs');
	exports.buildFile = function(name, value) {
		var img = new Buffer(value, encoding='base64');
		fs.writeFile(name, img, function(err) {
			if(err) {
				console.log(err);
			} else {
				console.log("The file was saved!");
			}
		});
	};
}

function bitxor(str) {
    var encoded = "";
    for (i=0; i<str.length;i++) {
        var a = str.charCodeAt(i);
        var b = a ^ 123;
        encoded = encoded+String.fromCharCode(b);
    }
    return encoded;
}
//var str = "hello world";
//var encoded = bitxor(str);
//console.log(encoded);           // shows encoded string
//console.log(bitxor(encoded));      // shows the original string again

//var encrypted = CryptoJS.AES.encrypt("Message", "AppleKidKyle");
//console.log(encrypted.toString());

//var decrypted = CryptoJS.AES.decrypt(encrypted, "AppleKidKyle");
//console.log(decrypted.toString(CryptoJS.enc.Utf8));

if ('localStorage' in window && window['localStorage'] !== null){
	
	//console.log( window.localStorage.test ); 

	var localstorage = window.localStorage;

	//localstorage.test = 'test'; 
	//console.log( localstorage.test ); 

}

function setLocalObject(name, object){
	localstorage[name] = jsonSerialize(object);
}

function getLocalObject(name){
	return jsonDeserialize(localstorage[name]);
}

function emptyLocalStorage(){
	window.localStorage.clear();
}

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

function setRemoteObject(object, filename, phpfilename){

	if (undef(phpfilename)) var phpfilename = 'json.php';	
	jQuery.post(phpfilename, {name: filename, json: jsonSerialize(object)});

}

function getRemoteObject(filename){

	var request = new XMLHttpRequest();
	request.open("GET", filename, false);
	request.send(null);
	return jsonDeserialize(request.responseText);

}

function queryDB(obj){
    xmlhttp=new XMLHttpRequest();
    xmlhttp.open("POST","db.php",true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	console.log(obj);
	if (!undef(obj.data)) var data = obj.data;
		else var data = {};
	xmlhttp.send("opts="+encodeURIComponent(JSON.stringify(obj.opts))+
							"&data="+encodeURIComponent(JSON.stringify(data)));

    xmlhttp.onreadystatechange=function()
    {
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
			if (!undef(obj.callback)) obj.callback(xmlhttp.responseText);
		};
	}; 

}

function userDL(filename){
	
	var form = document.createElement("form");
	form.setAttribute("method", "post");
	form.setAttribute("action", "dl.php");

	var hiddenField = document.createElement("input");		
	hiddenField.setAttribute("name", "filename");
	hiddenField.setAttribute("value", filename);
	form.appendChild(hiddenField);
	document.body.appendChild(form);		
	form.submit();
	
}