// Generated by CoffeeScript 1.4.0
(function() {
  var FIREBASE_URL, POSITION, childAdded, childRemoved, circles, handleGeolocation, handleNoGeolocation, initFirebase, initGeoloc, initMap, initialize, map, markers, myPosition, newyork, positionCallback, showAndroidAd, siberia;

  FIREBASE_URL = "https://whereareyou.firebaseio.com/v1";

  POSITION = "position";

  myPosition = void 0;

  map = void 0;

  markers = {};

  circles = {};

  siberia = new google.maps.LatLng(60, 105);

  newyork = new google.maps.LatLng(40.69847032728747, -73.9514422416687);

  initialize = function() {
    initFirebase();
    initMap();
    initGeoloc();
    return showAndroidAd();
  };

  initFirebase = function() {
    var firebase, href, myHandle, myKey, room, roomName;
    firebase = new Firebase(FIREBASE_URL);
    href = document.location.href;
    roomName = href.substring(href.lastIndexOf("/") + 1);
    room = firebase.child(roomName);
    myKey = typeof localStorage !== "undefined" && localStorage !== null ? localStorage[roomName] : void 0;
    if (myKey != null) {
      myHandle = room.child(myKey);
    } else {
      myHandle = room.push();
      myHandle.child("name").set("Web");
      if (typeof localStorage !== "undefined" && localStorage !== null) {
        localStorage[roomName] = myHandle.name();
      }
    }
    myPosition = myHandle.child(POSITION);
    room.on("child_added", childAdded);
    return room.on("child_removed", childRemoved);
  };

  initMap = function() {
    var mapOptions, map_canvas;
    mapOptions = {
      center: new google.maps.LatLng(46.7785, 6.640833),
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      streetViewControl: false
    };
    map_canvas = document.getElementById("map_canvas");
    return map = new google.maps.Map(map_canvas, mapOptions);
  };

  initGeoloc = function() {
    if (navigator.geolocation) {
      return navigator.geolocation.watchPosition(handleGeolocation, function() {
        return handleNoGeolocation(true);
      });
    } else {
      return handleNoGeolocation(false);
    }
  };

  showAndroidAd = function() {
    var isAndroid, ua;
    ua = navigator.userAgent.toLowerCase();
    isAndroid = ua.indexOf("android") > -1;
    if (isAndroid) {
      return document.getElementById("play").display = "block";
    }
  };

  childAdded = function(snapshot) {
    var person, personName, positionRef;
    person = snapshot.val();
    personName = person.name;
    positionRef = snapshot.ref().child(POSITION);
    return positionRef.on("value", positionCallback(personName));
  };

  positionCallback = function(personName) {
    var theName;
    theName = personName;
    return function(snapshot) {
      var accuracy, circle, circleOptions, contentString, date, datetime, infowindow, latitude, longitude, marker, myLatLng, parentName, position;
      position = snapshot.val();
      if (position === null) {
        return;
      }
      latitude = position.lat;
      longitude = position.long;
      accuracy = position.accuracy;
      datetime = position.datetime;
      date = new Date(datetime);
      parentName = snapshot.ref().parent().name();
      myLatLng = new google.maps.LatLng(latitude, longitude);
      marker = markers[parentName];
      if (marker === void 0) {
        marker = new google.maps.Marker({
          position: myLatLng,
          map: map,
          title: theName,
          animation: google.maps.Animation.DROP
        });
        contentString = '<div id="content">' + '<h1 id="firstHeading" class="firstHeading">' + theName + '</h1>' + '<div id="bodyContent">' + date + '</div>' + '</div>';
        infowindow = new google.maps.InfoWindow({
          content: contentString
        });
        google.maps.event.addListener(marker, 'click', function() {
          return infowindow.open(map, marker);
        });
        markers[parentName] = marker;
      } else {
        marker.setPosition(myLatLng);
      }
      circle = circles[parentName];
      if (circle === void 0) {
        circleOptions = {
          strokeColor: "#FF0000",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#FF0000",
          fillOpacity: 0.35,
          map: map,
          center: myLatLng,
          radius: accuracy
        };
        circle = new google.maps.Circle(circleOptions);
        return circles[parentName] = circle;
      } else {
        circle.setCenter(myLatLng);
        return circle.setRadius(accuracy);
      }
    };
  };

  childRemoved = function(snapshot) {
    var circle, marker, positionRef, refName;
    refName = snapshot.name();
    marker = markers[refName];
    if (marker !== void 0) {
      marker.setMap(null);
    }
    circle = circles[refName];
    if (circle !== void 0) {
      circle.setMap(null);
    }
    positionRef = snapshot.ref().child(POSITION);
    return positionRef.off();
  };

  handleGeolocation = function(position) {
    var myLocation, ts;
    ts = (new Date()).getTime();
    myPosition.set({
      "lat": position.coords.latitude,
      "long": position.coords.longitude,
      "accuracy": position.coords.accuracy,
      "datetime": ts
    });
    myLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    return map.setCenter(myLocation);
  };

  handleNoGeolocation = function(errorFlag) {
    var initialLocation;
    if (errorFlag) {
      alert("Geolocation service failed.");
      initialLocation = newyork;
    } else {
      alert("Your browser doesn't support geolocation. We've placed you in Siberia.");
      initialLocation = siberia;
    }
    return map.setCenter(initialLocation);
  };

  initialize();

}).call(this);
