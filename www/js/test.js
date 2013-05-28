$(document).ready(function(){
	
	var zoomLevel = 4;
	var minZoomLevel = 1;
	var maxZoomLevel = 7;
	var defaultMapWidth = 400;
	var defaultMapHeight = 400;
	var mapJSON;
	
	var currentMapHeight = 200;
	var currentMapWidth = 200;
	
	var retrievedObject = localStorage.getItem('mapJson1113');
	
	$('#map-container').height($(window).height());
	$('#map-container').width($(window).width());
	
	mapJSON = $.parseJSON(retrievedObject);
	
	initMap();
	
	$(document).on('click', '#zoomInButton', function(){
		/*
		$('#test').addClass('zoomInAnim');
		
		zoomLevel += 1;
		
		window.setTimeout(function(){
			var scrollTop = $(window).scrollTop();
			var scrollLeft = $(window).scrollLeft();
			
			var offsetTop = $('#test').offset().top;
			var offsetLeft = $('#test').offset().left;
			
			$('#test').removeClass('zoomInAnim');
			
			drawMap();
			
			$(window).scrollTop((-offsetTop) + scrollTop);
			$(window).scrollLeft((-offsetLeft) + scrollLeft);
			
		},300);
		*/
		var w;
		if(typeof(Worker)!=="undefined")
		{
			if(typeof(w)=="undefined")
			{
				w= new Worker("map.js");
				
				w.postMessage('testttt');
			}
			
			
			
			w.onmessage = function (event) {
				console.log(event.data);
			}
			
			w.postMessage("ali");
		}
		else
		{
			console.log("Sorry, your browser does not support Web Workers...");
		}
	});
	
	$('#zoomOutButton').click(function(){
		$('#test').addClass('zoomOutAnim');
		
		zoomLevel -= 1;
		
		window.setTimeout(function(){
			var scrollTop = $(window).scrollTop();
			var scrollLeft = $(window).scrollLeft();
			
			var offsetTop = $('#test').offset().top;
			var offsetLeft = $('#test').offset().left;
			
			$('#test').removeClass('zoomOutAnim');
			
			drawMap();
			
			$(window).scrollTop((-offsetTop) + scrollTop);
			$(window).scrollLeft((-offsetLeft) + scrollLeft);
			
		},300);
	});
	
	function initMap()
	{
		if(mapJSON == null)
		{
			$.getJSON('map.json', function(data){
				if(typeof(Storage)!=="undefined")
				{
					localStorage.setItem('mapJson1113', JSON.stringify(data));
					
					mapJSON = $.parseJSON(JSON.stringify(data));
				}
				
				drawMap();
			});
		}
		else
			drawMap();
	}
	
	function drawMap()
	{
		$('#test').remove();
	
		$('#map-container').append('<div id="test" style="margin:0 auto;width:'+defaultMapWidth * Math.pow(2, zoomLevel-1)+'px; height:'+defaultMapHeight * Math.pow(2, zoomLevel-1)+'px;"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" height="'+ defaultMapHeight * Math.pow(2, zoomLevel-1) +'" width="'+ defaultMapWidth * Math.pow(2, zoomLevel-1) +'" id="map-svg-container" style="background:#cadfaa;"><g id="map-svg-container-g"></g></svg><div id="testOffset"></div></div>');
		
		
		var framePoints = new Object();
		
		$(mapJSON.frameCorners).each(function(i){
			var framePoint = new Object();
			
			framePoint.latitude = this.latitude;
			framePoint.longitude = this.longitude;
			
			framePoints[i] = framePoint;
		});
		
		$(mapJSON.lines).each(function(i){
			if(this.showZoomLevel <= zoomLevel)
			{
				var thisZIndex = this.zIndex;
				var thisLineWidth = this.lineWidth * zoomLevel;
				var thisLineColor = this.lineColor;
				
				if($('#map-svg-container-g').children().length > 0)
				{
					$('#map-svg-container-g').children().each(function(k){
						var thisChild = $(this);
						var zIndex = $(thisChild).attr('data-zindex');
						
						if(zIndex >= thisZIndex)
						{
							$(thisChild).before('<line x1="0" y1="0" x2="0" y2="0" style="stroke:'+thisLineColor+';stroke-width:'+thisLineWidth+'" stroke-linecap="round" id="map-line-'+i+'" data-zindex="'+thisZIndex+'" />');
							return false;
						}
					});
				}
				else
					$('#map-svg-container-g').prepend('<line x1="0" y1="0" x2="0" y2="0" style="stroke:'+thisLineColor+';stroke-width:'+thisLineWidth+'" stroke-linecap="round" id="map-line-'+i+'" data-zindex="'+thisZIndex+'" />');
				
				var startPoint = new Object();
				var endPoint   = new Object();
				
				startPoint.latitude = this.startLatitude;
				startPoint.longitude = this.startLongitude;
				
				endPoint.latitude = this.endLatitude;
				endPoint.longitude = this.endLongitude;
				
				var beginPosition = convertCoordsToPx(startPoint, framePoints);
				var endPosition   = convertCoordsToPx(endPoint, framePoints);
				
				$('#map-line-'+i+'').attr('x1', beginPosition.x);
				$('#map-line-'+i+'').attr('y1', beginPosition.y);
				$('#map-line-'+i+'').attr('x2', endPosition.x);
				$('#map-line-'+i+'').attr('y2', endPosition.y);
				
				$('#map-container').html($('#map-container').html());
			}
		});
		
		$(mapJSON.polylines).each(function(i){
			if(this.showZoomLevel <= zoomLevel)
			{
				var thisZIndex = this.zIndex;
				var thisLineWidth = this.lineWidth * zoomLevel;
				var thisLineColor = this.lineColor;
				
				if($('#map-svg-container-g').children().length > 0)
				{
					$('#map-svg-container-g').children().each(function(k){
						var thisChild = $(this);
						var zIndex = $(thisChild).attr('data-zindex');
						
						if(zIndex >= thisZIndex)
						{
							$(thisChild).before('<polyline points="" style="stroke:'+thisLineColor+';stroke-width:'+thisLineWidth+';fill:none;" stroke-linecap="round" id="map-polyline-'+i+'" data-zindex="'+thisZIndex+'" />');
							return false;
						}
					});
				}
				else
					$('#map-svg-container-g').prepend('<polyline points="" style="stroke:'+thisLineColor+';stroke-width:'+thisLineWidth+';fill:none;" stroke-linecap="round" id="map-polyline-'+i+'" data-zindex="'+thisZIndex+'" />');
				
				$(this.breakPoints).each(function(k){
					var attr = $('#map-polyline-'+i+'').attr('points');
					
					var breakPoint = new Object();
					
					breakPoint.latitude = this.latitude;
					breakPoint.longitude = this.longitude;
					
					var position = convertCoordsToPx(breakPoint, framePoints);
					
					attr += ' ' + position.x + ',' + position.y;
					
					$('#map-polyline-'+i+'').attr('points', attr);
					
					$('#map-container').html($('#map-container').html());
				});
			}
		});
		
		$(mapJSON.polygons).each(function(i){
			if(this.showZoomLevel <= zoomLevel)
			{
				var thisZIndex = this.zIndex;
				var thisBorderWidth = this.borderWidth;
				var thisBorderColor = this.borderColor;
				var thisBackgroundColor = this.backgroundColor;
				
				if($('#map-svg-container-g').children().length > 0)
				{
					$('#map-svg-container-g').children().each(function(k){
						var thisChild = $(this);
						var zIndex = $(thisChild).attr('data-zindex');
						
						if(zIndex >= thisZIndex)
						{
							$(thisChild).before('<polygon points="" style="fill:'+thisBackgroundColor+';stroke:'+thisBorderColor+';stroke-width:'+thisBorderWidth+'" id="map-polygon-'+i+'" data-zindex="'+thisZIndex+'" />');
							return false;
						}
					});
				}
				else
					$('#map-svg-container-g').prepend('<polygon points="" style="fill:'+this.backgroundColor+';stroke:'+this.borderColor+';stroke-width:'+this.borderWidth+'" id="map-polygon-'+i+'" data-zindex="'+this.zIndex+'" />');
				
				$(this.breakPoints).each(function(k){
					var attr = $('#map-polygon-'+i+'').attr('points');
					
					var breakPoint = new Object();
					
					breakPoint.latitude = this.latitude;
					breakPoint.longitude = this.longitude;
					
					var position = convertCoordsToPx(breakPoint, framePoints);
					
					attr += ' ' + position.x + ',' + position.y;
					
					$('#map-polygon-'+i+'').attr('points', attr);
					
					$('#map-container').html($('#map-container').html());
				});
			}
		});
		
		$(mapJSON.circles).each(function(i){
			if(this.showZoomLevel <= zoomLevel)
			{
				var thisZIndex = this.zIndex;
				var thisBorderWidth = this.borderWidth;
				var thisBorderColor = this.borderColor;
				var thisBackgroundColor = this.backgroundColor;
				
				if($('#map-svg-container-g').children().length > 0)
				{
					$('#map-svg-container-g').children().each(function(k){
						var thisChild = $(this);
						var zIndex = $(thisChild).attr('data-zindex');
						
						if(zIndex >= thisZIndex)
						{
							$(thisChild).before('<circle id="map-circle-'+i+'" cx="0" cy="0" r="0" stroke="'+thisBorderColor+'" stroke-width="'+thisBorderWidth+'" fill="'+thisBackgroundColor+'" data-zindex="'+thisZIndex+'" />');
							return false;
						}
						
						if(k == $('#map-svg-container-g').children().length - 1)
							$(thisChild).after('<circle id="map-circle-'+i+'" cx="0" cy="0" r="0" stroke="'+thisBorderColor+'" stroke-width="'+thisBorderWidth+'" fill="'+thisBackgroundColor+'" data-zindex="'+thisZIndex+'" />');
					});
				}
				else
					$('#map-svg-container-g').prepend('<circle id="map-circle-'+i+'" cx="0" cy="0" r="0" stroke="'+thisBorderColor+'" stroke-width="'+thisBorderWidth+'" fill="'+thisBackgroundColor+'" data-zindex="'+thisZIndex+'" />');
				
				var centerPoint = new Object();
				var endPoint    = new Object();
				
				centerPoint.latitude = this.centerLatitude;
				centerPoint.longitude = this.centerLongitude;
				
				endPoint.latitude = this.endLatitude;
				endPoint.longitude = this.endLongitude;
				
				var centerPosition = convertCoordsToPx(centerPoint, framePoints);
				var endPosition    = convertCoordsToPx(endPoint, framePoints);
				
				var radius = Math.sqrt(Math.pow(Math.abs(centerPosition.x - endPosition.x), 2) + Math.pow(Math.abs(centerPosition.y - endPosition.y), 2));
				
				$('#map-circle-'+i+'').attr('cx', centerPosition.x);
				$('#map-circle-'+i+'').attr('cy', centerPosition.y);
				$('#map-circle-'+i+'').attr('r', radius);
				
				$('#map-container').html($('#map-container').html());
			}
		});
		
		$(mapJSON.images).each(function(i){
			
			if(this.showZoomLevel <= zoomLevel)
			{
				console.log(this.showZoomLevel + ', ' + zoomLevel);
				
				var thisZIndex = this.zIndex;
				var thisLatitude = this.latitude;
				var thisLongitude = this.longitude;
				var thisImageName = this.imageName;
				
				var point = new Object();
				
				point.latitude = this.latitude;
				point.longitude = this.longitude;
				
				var position = convertCoordsToPx(point, framePoints);
				
				var img = document.createElementNS('http://www.w3.org/2000/svg','image');
				
				img.setAttributeNS(null,'height', (this.imageHeight) * zoomLevel);
				img.setAttributeNS(null,'width',(this.imageWidth) * zoomLevel);
				img.setAttributeNS('http://www.w3.org/1999/xlink','href','img/' + thisImageName);
				img.setAttributeNS(null, 'x', position.x - ((this.imageWidth) * zoomLevel) / 2);
				img.setAttributeNS(null, 'y', position.y - ((this.imageHeight) * zoomLevel) / 2);
				img.setAttributeNS(null, 'data-zindex', thisZIndex);
				
				if($('#map-svg-container-g').children().length > 0)
				{
					$('#map-svg-container-g').children().each(function(k){
						var thisChild = $(this);
						var zIndex = $(thisChild).attr('data-zindex');
						
						
						
						if(zIndex >= thisZIndex)
						{
							console.log($(thisChild).attr('data-zindex'));
						
							$(thisChild).before(img);
							return false;
						}
						
						if(k == $('#map-svg-container-g').children().length - 1)
							$('#map-svg-container-g').append(img);
					});
				}
				else
					$('#map-svg-container-g').prepend(img);
				
				
				
				$('#map-image-'+i+'').attr('x', position.x);
				$('#map-image-'+i+'').attr('y', position.y);
				
				$('#map-container').html($('#map-container').html());
			}
		});
	}
	
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
});