FIREBASE_URL = "https://whereareyou.firebaseio.com/v1"

createRoom = -> 
  firebase = new Firebase(FIREBASE_URL)
  child = firebase.push()
  document.location = document.location + child.name()
  
createRoom()