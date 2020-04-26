import firebase from 'firebase/app'
import "firebase/auth"
import "firebase/database"
import "firebase/storage"

var firebaseConfig = {
    apiKey: "AIzaSyCglkY3xIfZ1TiQ7Jte6WG-OlznD0-NSnM",
    authDomain: "chat-app-lb.firebaseapp.com",
    databaseURL: "https://chat-app-lb.firebaseio.com",
    projectId: "chat-app-lb",
    storageBucket: "chat-app-lb.appspot.com",
    messagingSenderId: "561535376531",
    appId: "1:561535376531:web:86015dfc86075261818166",
    measurementId: "G-W7W0H47EWQ"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);


  export default firebase