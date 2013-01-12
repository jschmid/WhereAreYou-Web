
var map;
var myHandle;
var myPosition;
var browserSupportFlag = new Boolean();
var markers = {};

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
  
  if (childname == "") {
    var child = f.push();
    document.location = document.location + child.name();
    return;
  }
  
  var child = f.child(childname);
  
  child.on("child_added", function (snapshot) {
    var person = snapshot.val();
    var name = person.name;
    
    var positionRef = snapshot.ref().child("position");
    positionRef.on("value", function (sPosition) {
      var position = sPosition.val();
      
      console.log(position);
      
      if (position == null) {
        return;
      }
      
      var lat = position.lat;
      var longitude = position.long;
      var datetime = position.datetime;
      var date = new Date(datetime);
      var parentName = sPosition.ref().parent().name();
      
      var myLatlng = new google.maps.LatLng(lat, longitude);
      
      var marker = markers[parentName];
      
      if (marker == undefined) {
        marker = new google.maps.Marker({
            position : myLatlng,
            map : map,
            title : name
          });
        
        var contentString = '<div id="content">' +
          '<h1 id="firstHeading" class="firstHeading">' + name + '</h1>' +
          '<div id="bodyContent">' +
          date +
          '</div>' +
          '</div>';
        
        var infowindow = new google.maps.InfoWindow({
            content : contentString
          });
        
        google.maps.event.addListener(marker, 'click', function () {
          infowindow.open(map, marker);
        });
        markers[parentName] = marker;
        
      } else {
        marker.setPosition(myLatlng);
      }
      
    });
    
  });
  
  myHandle = child.push();
  myHandle.child("name").set("Web");
  myPosition = myHandle.child("position");
  
  // Try W3C Geolocation (Preferred)
  if (navigator.geolocation) {
    browserSupportFlag = true;
    navigator.geolocation.getCurrentPosition(handleGeolocation, function () {
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
  var ts = (new Date()).getTime();
  
  myPosition.set({
    "lat" : position.coords.latitude,
    "long" : position.coords.longitude,
    "datetime" : ts
  });
  
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
