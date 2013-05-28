
	postMessage("I\'m working before postMessage(\'ali\').");
 
	onmessage = function (oEvent) {
	  postMessage("Hi " + oEvent.data);
	};
	
	function convertCoordsToPx(point, framePoints)
	{
		var latitudePerPx = (Math.abs(framePoints[0].latitude - framePoints[2].latitude)) / $('#map-svg-container').height();
		var longitudePerPx = (Math.abs(framePoints[0].longitude - framePoints[1].longitude)) / $('#map-svg-container').width();
		
		var latDif = Math.abs(framePoints[0].latitude - point.latitude);
		var longDif = Math.abs(framePoints[0].longitude - point.longitude);
		
		var position = new Object();
		
		position.x = longDif / longitudePerPx;
		position.y = latDif / latitudePerPx;
		
		return position;
	}
