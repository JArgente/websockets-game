var websocket;
$(document).ready(function(){
	$("#winner").on("touchstart",function(e){
	    e.preventDefault();
	});
	$("#botonPista").on("touchstart",function(e){
	    e.preventDefault();
	});
	$("#botonPista2").on("touchstart",function(e){
		websocket.send("pista");
		document.getElementById("winner").style.display="block";
		document.getElementById("botonPista").style.display="none";
    });
	
	websocket = new WebSocket("ws://192.168.1.44:8080/QuanticTravel/saw");
	websocket.onmessage = function(message){
		if(message.data=="start"){
			document.getElementById("winner").style.display="none";
			document.getElementById("botonPista").style.display="block";
		}
	}
});
