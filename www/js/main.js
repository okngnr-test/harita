$(document).ready(function(){

	var deviceHeight = $(window).height();
	var deviceWidth  = $(window).width();
	
	var zoomLevel = 1;
	var minZoomLevel = 1;
	var maxZoomLevel = 7;
	var defaultMapWidth = 400;
	var defaultMapHeight = 400;
	
	var mapDrawer;
	
	var compassWatchID = null;
	var positionWatchID = null;
	
	var initialCompassHeading = 0;
	
	var lastLocations = new Array();
	var lastLocation;
	
	$('#main-container').css('width', deviceWidth);
	$('#main-container').css('height', deviceHeight);
	
	$('#page').css('width', deviceWidth);
	$('#page-content').css('height', deviceHeight - 50);
	$('#app-menu').css('height', deviceHeight);
	
	var retrievedObject = localStorage.getItem('mapJson1122');

	var mapJSON = $.parseJSON(retrievedObject);
	
	$(document).on('change', '#zoomRange', function(){
		zoomLevel = parseInt($('#zoomRange').val());
		
		updateMap();
	});
	
	$(document).on('touchstart', '#zoomin-button', function(){
		if(zoomLevel < maxZoomLevel)
			zoomLevel += 1;
		
		$('#zoomRange').val(zoomLevel);
		
		updateMap();
	});
	
	$(document).on('touchstart', '#zoomout-button', function(){
		if(zoomLevel > minZoomLevel)
			zoomLevel -= 1;
			
		$('#zoomRange').val(zoomLevel);
		
		updateMap();
	});
	
	$('#back-button').click(function(){
		window.location.href = '#test';
	});
	
	
	$('#app-menu-list li').bind('touchstart', function(){
		var title = $(this).find('.app-menu-list-li-label').text();
		
		$('header').find('p').html(title);
		
		closeMenu();
		
		$('#content-in').html('<img src="img/loading.gif" class="page-loading-img" />');
		
		$('.page-loading-img').css('top', (deviceHeight / 2) - 50);
		$('.page-loading-img').css('left', (deviceWidth / 2) - 50);
	});
	
	$('#menu_map').bind('touchstart', function(){
		window.setTimeout(function(){
		
			$('#content-in').html('\
				<div id="map-container" style="background:#b7d18c"></div>\
				<div id="zoom-buttons">\
					<img src="img/location.png" style="margin-right:5px" />\
					<img src="img/zoomout.png" id="zoomout-button" />\
					<input type="range" name="points" id="zoomRange" min="'+minZoomLevel+'" max="'+maxZoomLevel+'" value="'+zoomLevel+'" style="margin-right:5px" >\
					<img src="img/zoomin.png" style="margin-right:5px" id="zoomin-button" />\
				</div>\
				');
			
			$('#map-frame').css('width', $(window).width());
			$('#map-frame').css('height', $(window).height() - 50);
			
			lastLocations = [];
			
			initMap();
			
		},1000);
	});
	
	$('#menu_home').bind('touchstart', function(){
		$('#map-html').hide();
		
		window.setTimeout(function(){
			$('#content-in').html('<p class="text">home page</p>');
		},1000);
	});
	
	$('#menu_about').bind('touchstart', function(){
		$('#map-html').hide();
		
		window.setTimeout(function(){
			$('#content-in').html('\
				<div class="page-frame">\
					<p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum. Typi non habent claritatem insitam; est usus legentis in iis qui facit eorum claritatem. Investigationes demonstraverunt lectores legere me lius quod ii legunt saepius. Claritas est etiam processus dynamicus, qui sequitur mutationem consuetudium lectorum. Mirum est notare quam littera gothica, quam nunc putamus parum claram, anteposuerit litterarum formas humanitatis per seacula quarta decima et quinta decima. Eodem modo typi, qui nunc nobis videntur parum clari, fiant sollemnes in futurum.</p>\
				</div>\
			');
		},1000);
	});
	
	$('#menu_help').bind('touchstart', function(){
		$('#map-html').hide();
		
		window.setTimeout(function(){
			$('#content-in').html('<p class="text">help page</p>');
		},1000);
	});
	
	$('#menu_settings').bind('touchstart', function(){
		$('#map-html').hide();
		
		window.setTimeout(function(){
			$('#content-in').html('<p class="text">settings page</p>');
		},1000);
	});
	
	var menuOpen = false;
	
	$('#page').addClass('pageMenuCloseAnim2');
	
	document.getElementById('open-app-menu-button').addEventListener('touchstart', function(){
		if(!menuOpen)
			openMenu();
		else if(menuOpen)
			closeMenu();
	});
	
	function openMenu()
	{
		$('#page').removeClass('pageMenuCloseAnim2');
		$('#page').removeClass('pageMenuCloseAnim');
		$('#page').addClass('pageMenuOpenAnim');
		
		menuOpen = true;
		
		window.setTimeout(function(){
			$('#app-menu-cover').hide();
		}, 600);
	}
	
	function closeMenu()
	{
		$('#page').removeClass('pageMenuOpenAnim');
		$('#page').addClass('pageMenuCloseAnim');
		
		menuOpen = false;
		
		window.setTimeout(function(){
			$('#app-menu-cover').show();
		}, 600);
	}
	
	function initMap()
	{
		initMapDrawer();
		
		document.addEventListener("deviceready", onDeviceReady, true);
		
		if(mapJSON == null)
		{
			$.getJSON('map.json', function(data){
				if(typeof(Storage)!=="undefined")
				{
					localStorage.setItem('mapJson1122', JSON.stringify(data));
					
					mapJSON = $.parseJSON(JSON.stringify(data));
				}
				
				mapJSON.zoomLevel = zoomLevel;
				mapDrawer.postMessage(mapJSON);
			});
		}
		else
		{
			mapJSON.zoomLevel = zoomLevel;
			mapDrawer.postMessage(mapJSON);
		}
	}
	
	function onDeviceReady() {
        var compassOptions = { frequency: 50 };
		var positionOptions = { timeout: 30000, maximumAge: 3000, enableHighAccuracy: true };
		
		positionWatchID = navigator.geolocation.watchPosition(onPositionSuccess, onPositionError, positionOptions);
        compassWatchID = navigator.compass.watchHeading(onCompassSuccess, onCompassError, compassOptions);
    }
	
	function onCompassSuccess(heading) {
		initialCompassHeading = 360;
	
        if(initialCompassHeading == 0)
			initialCompassHeading = heading.magneticHeading;
		
		//$('footer').find('p').html('Heading difference: ' + (initialCompassHeading - heading.magneticHeading));
		
		var srotate = "rotate(" + (initialCompassHeading - heading.magneticHeading) + "deg)";
		
		var position = convertCoordsToPx(lastLocation, mapJSON.frameCorners);
		
		$('#map-wrapper-svg').css('transform-origin', position.x + 'px ' + position.y + 'px');
		$('#map-wrapper-svg').css('transform', srotate);
		$('.direction-arrow').css('transform', 180);
		
		console.log(heading.magneticHeading);
    }
	
    function onCompassError(error) {
        alert('code: '    + error.code    + '\n' +
			  'message: ' + error.message + '\n');
    }
	
	function onPositionSuccess(position)
	{
		console.log(position.coords.latitude + ", " + position.coords.longitude);
		lastLocation = new Object();
		
		lastLocation.latitude = position.coords.latitude;
		lastLocation.longitude = position.coords.longitude;
		
		lastLocations.push(lastLocation);
		
		mapJSON.userRoute = $.parseJSON(JSON.stringify(lastLocations));
		
		var userPoints = '';
		
		for(a in mapJSON.userRoute)
		{
			var breakPoint = new Object();
					
			breakPoint.latitude = mapJSON.userRoute[a].latitude;
			breakPoint.longitude = mapJSON.userRoute[a].longitude;
			
			var position = convertCoordsToPx(breakPoint, mapJSON.frameCorners);
			
			userPoints += ' ' + position.x + ',' + position.y;
		}
		
		console.log(JSON.stringify(lastLocations));
		console.log(userPoints);
		
		updateMap();
	}
	
	function onPositionError(error) {
		alert('code: '    + error.code    + '\n' +
			  'message: ' + error.message + '\n');
	}
	
	function initMapDrawer()
	{
		if(typeof(Worker)!=="undefined")
		{
			if(typeof(mapDrawer)=="undefined")
			{
				mapDrawer = new Worker("mapDrawer.js");
			}
			
			mapDrawer.onmessage = function(event){
				$('#map-wrapper').remove();

				$('#map-container').append('<div id="map-wrapper" style="position: relative; margin:0 auto;width:'+defaultMapWidth * Math.pow(2, zoomLevel-1)+'px; height:'+defaultMapHeight * Math.pow(2, zoomLevel-1)+'px;"><div id="map-wrapper-svg">'+event.data+'</div></div>');
				
				$('#map-container').scrollTop(((defaultMapHeight * Math.pow(2, zoomLevel-1)) - deviceHeight) / 2);
				$('#map-container').scrollLeft(((defaultMapWidth * Math.pow(2, zoomLevel-1)) - deviceWidth) / 2);
				
				var position = convertCoordsToPx(lastLocation, mapJSON.frameCorners);
				
				if($('#map-wrapper').find('.direction-arrow').length > 0)
				{
					$('.direction-arrow').css('top', (position.y - 10) + 'px');
					$('.direction-arrow').css('left', (position.x - 10) + 'px');
				}
				else
					$('#map-wrapper').append('<img src="img/direction_arrow2.png" class="direction-arrow" style="position: absolute; top: '+(position.y - 10)+'px; left: '+(position.x - 10)+'px;" />');
			}
		}
	}	
	
	function updateMap()
	{
		mapJSON.zoomLevel = zoomLevel;
			
		mapDrawer.postMessage(mapJSON);
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
	
	/*
	(function(history){
        var pushState = history.pushState;
        history.pushState = function(state) {
            if (typeof history.onpushstate == "function") {
                history.onpushstate({
                    state: state
                });
            }
            return pushState.apply(history, arguments);
        }
    })(window.history);
	
	window.onpopstate = history.onpushstate = function(event) {
        if(event.state != null)
        {
			if(event.state.load == 'load-content')
			{
				$.ajax({
					url: event.state.url,
					type: 'GET',
					success: function(data){
						var newTitle = $(data).filter('title').text();
						document.title= newTitle;
						
						$('#page-content').html($(data).find('.page-content-in').fadeIn(400));
					}
				});
			}
		}
	}
	
	function initMap2()
	{
		var startLatitude = 41.091127;
		var startLongitude = 28.999596;
		
		var latitudePerPx = 0.00000266;
		var longitudePerPx = 0.00000202;
		
		var moveToX = 0;
		var moveToY = 0;
		
		var lineToX = 0;
		var lineToY = 0;
		
		iframe = document.getElementById('map-frame');
		iframeInnerDoc = iframe.contentDocument || iframe.contentWindow.document;
		
		//alert($(iframeInnerDoc).find('canvas').html());
		
		var c = $(iframeInnerDoc).find('canvas');
		var ctx = c.getContext("2d");

		var watchID = null;

		var options = { timeout: 30000, maximumAge: 3000, enableHighAccuracy: true };
		watchID = navigator.geolocation.watchPosition(onSuccess, onError, options);
		
		var img = new Image();
		
		img.onload = function()
		{
			ctx.drawImage(img, 0, 0);
		}
		
		img.src = "img/background.png";
	}
	
	
	function onSuccess(position)
	{
		console.log(position.coords.heading);
	}
	
	function onError(error) {
		alert('code: '    + error.code    + '\n' +
			  'message: ' + error.message + '\n');
	}
	
	/*
	
	function drawMap()
	{
		$('#test').remove();
	
		$('#map-container').append('<div id="test" style="margin:0 auto;width:'+defaultMapWidth * Math.pow(2, zoomLevel-1)+'px; height:'+defaultMapHeight * Math.pow(2, zoomLevel-1)+'px;"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" height="'+ defaultMapHeight * Math.pow(2, zoomLevel-1) +'" width="'+ defaultMapWidth * Math.pow(2, zoomLevel-1) +'" id="map-svg-container" style="background:#abc77b;"><g id="map-svg-container-g"></g></svg><div id="testOffset"></div></div>');
		
		
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
	*/
});