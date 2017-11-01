/**
 * 
 */

function checkCoords(){
	var coordX= $("#coordX").val();
	var coordY= $("#coordY").val();
	
	if(coordX=="128.7" && coordY=="315.4"){
		$("#formViajar").submit();
	}else{
		$("#errorMessage").css("display","block");
	}
}