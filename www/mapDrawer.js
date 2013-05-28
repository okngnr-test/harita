
var result = '';
var zoomLevel = 1;

onmessage = function (event) {
	zoomLevel = event.data.zoomLevel;
	
	drawMap(event.data);
	
	postMessage(result);
};

function drawMap(mapJSON)
{
	result = '<svg style="background:#b7d18c;">';
	
	var framePoints = new Object();
	
	for(var i in mapJSON.frameCorners)
	{
		var framePoint = new Object();
		
		framePoint.latitude = mapJSON.frameCorners[i].latitude;
		framePoint.longitude = mapJSON.frameCorners[i].longitude;
		
		framePoints[i] = framePoint;
	}
	
	for(a in mapJSON.polygons)
	{
		if(mapJSON.polygons[a].showZoomLevel <= zoomLevel)
		{
			var points = '';
			
			for(b in mapJSON.polygons[a].breakPoints)
			{
				var breakPoint = new Object();
				
				breakPoint.latitude = mapJSON.polygons[a].breakPoints[b].latitude;
				breakPoint.longitude = mapJSON.polygons[a].breakPoints[b].longitude;
				
				var position = convertCoordsToPx(breakPoint, framePoints);
				
				points += ' ' + position.x + ',' + position.y;
			}
			
			result += '<polygon points="'+points+'" style="fill:'+mapJSON.polygons[a].backgroundColor+';stroke:'+mapJSON.polygons[a].borderColor+';stroke-width:'+mapJSON.polygons[a].borderWidth+'" id="map-polygon-'+a+'" data-zindex="'+mapJSON.polygons[a].zIndex+'" />';
		}
	}
	
	for(a in mapJSON.lines)
	{
		if(mapJSON.lines[a].showZoomLevel <= zoomLevel)
		{
			var startPoint = new Object();
			var endPoint   = new Object();
			
			startPoint.latitude = mapJSON.lines[a].startLatitude;
			startPoint.longitude = mapJSON.lines[a].startLongitude;
			
			endPoint.latitude = mapJSON.lines[a].endLatitude;
			endPoint.longitude = mapJSON.lines[a].endLongitude;
			
			var beginPosition = convertCoordsToPx(startPoint, framePoints);
			var endPosition   = convertCoordsToPx(endPoint, framePoints);
		
			result += '<line x1="'+beginPosition.x+'" y1="'+beginPosition.y+'" x2="'+endPosition.x+'" y2="'+endPosition.y+'" style="stroke:'+mapJSON.lines[a].lineColor+';stroke-width:'+mapJSON.lines[a].lineWidth+'" stroke-linecap="round" id="map-line-'+a+'" data-zindex="'+mapJSON.lines[a].zIndex+'" />';
		}
	}
	
	for(a in mapJSON.polylines)
	{
		if(mapJSON.polylines[a].showZoomLevel <= zoomLevel)
		{
			var points = '';
			
			for(b in mapJSON.polylines[a].breakPoints)
			{
				var breakPoint = new Object();
				
				breakPoint.latitude = mapJSON.polylines[a].breakPoints[b].latitude;
				breakPoint.longitude = mapJSON.polylines[a].breakPoints[b].longitude;
				
				var position = convertCoordsToPx(breakPoint, framePoints);
				
				points += ' ' + position.x + ',' + position.y;
			}
			
			result += '<polyline points="'+points+'" style="stroke:'+mapJSON.polylines[a].lineColor+';stroke-width:'+mapJSON.polylines[a].lineWidth+';fill:none;" stroke-linecap="round" id="map-polyline-'+a+'" data-zindex="'+mapJSON.polylines[a].zIndex+'" />';
		}
	}
	
	for(a in mapJSON.circles)
	{
		if(mapJSON.circles[a].showZoomLevel <= zoomLevel)
		{
			var centerPoint = new Object();
			var endPoint    = new Object();
			
			centerPoint.latitude = mapJSON.circles[a].centerLatitude;
			centerPoint.longitude = mapJSON.circles[a].centerLongitude;
			
			endPoint.latitude = mapJSON.circles[a].endLatitude;
			endPoint.longitude = mapJSON.circles[a].endLongitude;
			
			var centerPosition = convertCoordsToPx(centerPoint, framePoints);
			var endPosition    = convertCoordsToPx(endPoint, framePoints);
			
			var radius = Math.sqrt(Math.pow(Math.abs(centerPosition.x - endPosition.x), 2) + Math.pow(Math.abs(centerPosition.y - endPosition.y), 2));
		
			result += '<circle id="map-circle-'+a+'" cx="'+centerPosition.x+'" cy="'+centerPosition.y+'" r="'+radius+'" stroke="'+mapJSON.circles[a].borderColor+'" stroke-width="'+mapJSON.circles[a].borderWidth+'" fill="'+mapJSON.circles[a].backgroundColor+'" data-zindex="'+mapJSON.circles[a].zIndex+'" />';
		}
	}
	
	for(a in mapJSON.images)
	{
		if(mapJSON.images[a].showZoomLevel <= zoomLevel)
		{
			var point = new Object();
				
			point.latitude = mapJSON.images[a].latitude;
			point.longitude = mapJSON.images[a].longitude;
			
			var position = convertCoordsToPx(point, framePoints);
		
			result += '<image xlink:href="img/'+mapJSON.images[a].imageName+'" x="'+parseInt(position.x - (mapJSON.images[a].imageWidth * zoomLevel) / 2)+'" y="'+parseInt(position.y - (mapJSON.images[a].imageHeight * zoomLevel) / 2)+'" height="'+(mapJSON.images[a].imageHeight * zoomLevel)+'" width="'+(mapJSON.images[a].imageWidth * zoomLevel)+'" />';
		}
	}
	
	var userPoints = '';
	
	for(a in mapJSON.userRoute)
	{
		var breakPoint = new Object();
				
		breakPoint.latitude = mapJSON.userRoute[a].latitude;
		breakPoint.longitude = mapJSON.userRoute[a].longitude;
		
		var position = convertCoordsToPx(breakPoint, framePoints);
		
		userPoints += ' ' + position.x + ',' + position.y;
	}
	
	result += '<polyline points="'+userPoints+'" style="stroke:#ff0000;stroke-width:4;fill:none;" stroke-linecap="round" id="map-polyline-user-route" data-zindex="10" />';
	
	var location = new Object();
		
	location.latitude = 41.179213;
	location.longitude = 28.982521;
	
	var position = convertCoordsToPx(location, mapJSON.frameCorners);
	
	//result += '<image xlink:href="img/'+mapJSON.locationArrow[0].imageName+'" x="'+position.x+'" y="'+position.y+'" height="40" width="30" />';
	
	result += '</svg>';
}

function convertCoordsToPx(point, framePoints)
{
	var latitudePerPx = (Math.abs(framePoints[0].latitude - framePoints[2].latitude)) / (400 * Math.pow(2, zoomLevel-1));
	var longitudePerPx = (Math.abs(framePoints[0].longitude - framePoints[1].longitude)) / (400 * Math.pow(2, zoomLevel-1));
	
	var latDif = Math.abs(framePoints[0].latitude - point.latitude);
	var longDif = Math.abs(framePoints[0].longitude - point.longitude);
	
	var position = new Object();
	
	position.x = longDif / longitudePerPx;
	position.y = latDif / latitudePerPx;
	
	return position;
}
