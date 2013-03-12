FIREBASE_URL = "https://whereareyou.firebaseio.com/v1"
POSITION = "position"

myKey = undefined
myPosition = undefined
map = undefined
markers = {}
circles = {}

siberia = new google.maps.LatLng(60, 105)
newyork = new google.maps.LatLng(40.69847032728747, -73.9514422416687)
    
initialize = ->
  initFirebase()
  initMap()
  showAndroidAd()

initFirebase = ->
  firebase = new Firebase(FIREBASE_URL)
  
  href = document.location.href
  roomName = href.substring(href.lastIndexOf("/") + 1)
  room = firebase.child(roomName)
  
  myKey = if localStorage? then localStorage[roomName]
  
  if myKey?
    myHandle = room.child(myKey)
  else
    myHandle = room.push()
    myHandle.child("name").set("Web")
    myKey = myHandle.name()
    if localStorage?
      localStorage[roomName] = myKey
    
  myPosition = myHandle.child(POSITION)
  
  room.on("child_added", childAdded)
  room.on("child_removed", childRemoved)
  
initMap = ->
  mapOptions =
    center : new google.maps.LatLng(46.7785, 6.640833)
    zoom : 12
    mapTypeId : google.maps.MapTypeId.ROADMAP
    streetViewControl : false
  
  map_canvas = document.getElementById("map_canvas")
  map = new google.maps.Map(map_canvas, mapOptions)
  
initGeoloc = ->

  if navigator.geolocation
    navigator.geolocation.watchPosition(handleGeolocation, () ->
      handleNoGeolocation(true);
    );
  
  else
    handleNoGeolocation(false);

showAndroidAd = ->
  ua = navigator.userAgent.toLowerCase()
  isAndroid = ua.indexOf("android") > -1
  
  if isAndroid
    document.getElementById("play").display = "block"

childAdded = (snapshot) ->
  person = snapshot.val()
  personName = person.name
  
  positionRef = snapshot.ref().child(POSITION)
  positionRef.on("value", positionCallback(personName))
  
  if snapshot.ref().name() == myKey
    initGeoloc()
  
positionCallback = (personName) ->
  (snapshot) ->
    position = snapshot.val()
    return if position == null
  
    latitude = position.lat
    longitude = position.long
    accuracy = position.accuracy
    datetime = position.datetime
    date = new Date(datetime)
    parentName = snapshot.ref().parent().name()
    
    myLatLng = new google.maps.LatLng(latitude, longitude)
    
    marker = markers[parentName]
    
    if marker == undefined
      marker = new google.maps.Marker(
        position : myLatLng
        map : map
        title : personName
        animation: google.maps.Animation.DROP
      )
      
      contentString = '<div id="content">' +
        '<h1 id="firstHeading" class="firstHeading">' + personName + '</h1>' +
        '<div id="bodyContent">' +
        date +
        '</div>' +
        '</div>'
      
      infowindow = new google.maps.InfoWindow(
          content : contentString
      )
      
      google.maps.event.addListener(marker, 'click', () ->
        infowindow.open(map, marker)
      )
      markers[parentName] = marker
      
    else
      marker.setPosition(myLatLng)
      
    circle = circles[parentName]
      
    if circle == undefined
      circleOptions =
        strokeColor: "#FF0000"
        strokeOpacity: 0.8
        strokeWeight: 2
        fillColor: "#FF0000"
        fillOpacity: 0.35
        map: map
        center: myLatLng
        radius: accuracy
        
      circle = new google.maps.Circle(circleOptions)
      
      circles[parentName] = circle
    
    else
      circle.setCenter(myLatLng)
      circle.setRadius(accuracy)
  
childRemoved = (snapshot) ->
  refName = snapshot.name()
  
  marker = markers[refName]
  marker.setMap(null) if marker != undefined
  
  circle = circles[refName]
  circle.setMap(null) if circle != undefined
  
  positionRef = snapshot.ref().child(POSITION)
  positionRef.off()
  
handleGeolocation = (position) ->
  ts = (new Date()).getTime()
  
  myPosition.set(
    "lat" : position.coords.latitude
    "long" : position.coords.longitude
    "accuracy" : position.coords.accuracy
    "datetime" : ts
  );
  
  myLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
  map.setCenter(myLocation)


handleNoGeolocation = (errorFlag) ->
  if errorFlag
    alert("Geolocation service failed.")
    initialLocation = newyork
  else
    alert("Your browser doesn't support geolocation. We've placed you in Siberia.")
    initialLocation = siberia
    
  map.setCenter(initialLocation)
  
initialize()