var map;
var myHandle;
var browserSupportFlag =  new Boolean();

var siberia = new google.maps.LatLng(60, 105);
var newyork = new google.maps.LatLng(40.69847032728747, -73.9514422416687);

function initialize() {
  var mapOptions = {
    center : new google.maps.LatLng(46, 6),
    zoom : 8,
    mapTypeId : google.maps.MapTypeId.ROADMAP,
    streetViewControl : false
  };
  map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
  
  var href = document.location.href;
  var childname = href.substring(href.lastIndexOf("/") + 1);
  
  var f = new Firebase("https://whereareyou.firebaseio.com");
  
  if(childname == "") {
    var child = f.push();
    document.location = document.location + child.name();
  }
  
  var child = f.child(childname);
  myHandle = child.push();
  myHandle.removeOnDisconnect();
  
  child.on("child_added", function (snapshot) {
    var val = snapshot.val();
    var pri = snapshot.getPriority();
    var d = new Date(pri * 1000);
    
    console.log(val);
    
    var myLatlng = new google.maps.LatLng(val.lat, val.long);
    var marker = new google.maps.Marker({
        position : myLatlng,
        map : map,
        title : val.name
      });
    
    var contentString = '<div id="content">' +
      '<h1 id="firstHeading" class="firstHeading">' + val.name + '</h1>' +
      '<div id="bodyContent">' +
      d +
      '</div>' +
      '</div>';
    
    var infowindow = new google.maps.InfoWindow({
        content : contentString
      });
    
    google.maps.event.addListener(marker, 'click', function () {
      infowindow.open(map, marker);
    });
  });
  
// Try W3C Geolocation (Preferred)
  if(navigator.geolocation) {
    browserSupportFlag = true;
    navigator.geolocation.getCurrentPosition(handleGeolocation, function() {
      handleNoGeolocation(browserSupportFlag);
    });
  }
  // Browser doesn't support Geolocation
  else {
    browserSupportFlag = false;
    handleNoGeolocation(browserSupportFlag);
  }
}

function handleGeolocation(position) {
  console.log(position);
  alert("got position");
  
  var ts = Math.round((new Date()).getTime() / 1000);

  myHandle.setWithPriority({
    "lat" : position.coords.latitude,
    "long" : position.coords.longitude,
    "name" : "Web"
  }, ts);
  
  var myLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  map.setCenter(myLocation);
}

function handleNoGeolocation(errorFlag) {
    if (errorFlag) {
      alert("Geolocation service failed.");
      initialLocation = newyork;
    } else {
      alert("Your browser doesn't support geolocation. We've placed you in Siberia.");
      initialLocation = siberia;
    }
    map.setCenter(initialLocation);
  }
