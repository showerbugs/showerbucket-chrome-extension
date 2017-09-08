// TODO(DEVELOPER): Change the values below using values from the initialization snippet: Firebase Console > Overview > Add Firebase to your web app.
// Initialize Firebase
var config = {
  apiKey: "AIzaSyAlvdvSaAuHxTyAf9rSyQXf22lKUX-LFaw",
   authDomain: "showerbucket-1a754.firebaseapp.com",
   databaseURL: "https://showerbucket-1a754.firebaseio.com",
   projectId: "showerbucket-1a754",
   storageBucket: "showerbucket-1a754.appspot.com",
   messagingSenderId: "203690076097"
};

firebase.initializeApp(config);

var provider = new firebase.auth.GoogleAuthProvider();

/**
 * initApp handles setting up the Firebase context and registering
 * callbacks for the auth status.
 *
 * The core initialization is in firebase.App - this is the glue class
 * which stores configuration. We provide an app name here to allow
 * distinguishing multiple app instances.
 *
 * This method also registers a listener with firebase.auth().onAuthStateChanged.
 * This listener is called when the user is signed in or out, and that
 * is where we update the UI.
 *
 * When signed in, we also authenticate to the Firebase Realtime Database.
 */
function initApp() {
  // Listen for auth state changes.
  // [START authstatelistener]

  document.getElementById('google-login-button').addEventListener('click', function(){
    startAuth(true);
  }, false);


  firebase.auth().onAuthStateChanged(function(user) {
    console.log(user)
    if (user) {
      console.log(user)
      // User is signed in.
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var isAnonymous = user.isAnonymous;
      var uid = user.uid;
      var providerData = user.providerData;
      // [START_EXCLUDE]
      document.getElementById('user-name').textContent = user.displayName;

      var bucketRef = firebase.database().ref('user-buckets/' + user.uid);
      bucketRef.on('value', function(snapshot) {
        let buckets = snapshot.val();
        console.log(buckets)
        document.getElementById('buckets').innerHTML = '<ul>' + Object.keys(buckets).map( key => (`<li>${buckets[key].name}</li>`)).join('') + '</ul>';
      });
      // [END_EXCLUDE]
    } else {
      // Let's try to get a Google auth token programmatically.

      // [END_EXCLUDE]
    }
  });
  // [END authstatelistener]
}

/**
 * Start the auth flow and authorizes to Firebase.
 * @param{boolean} interactive True if the OAuth flow should request with an interactive mode.
 */
function startAuth(interactive) {
  chrome.identity.getAuthToken({interactive: !!interactive}, function(token) {
    alert(token)
    if (chrome.runtime.lastError && !interactive) {
      console.log('It was not possible to get a token programmatically.');
    } else if(chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else if (token) {
      // Authrorize Firebase with the OAuth Access Token.
      var credential = firebase.auth.GoogleAuthProvider.credential(null, token);
      firebase.auth().signInWithCredential(credential).catch(function(error) {
        // The OAuth token might have been invalidated. Lets' remove it from cache.
        if (error.code === 'auth/invalid-credential') {
          chrome.identity.removeCachedAuthToken({token: token}, function() {
            startAuth(interactive);
          });
        }
      });
    } else {
      console.error('The OAuth Token was null');
    }
  });
}

/**
 * Starts the sign-in process.
 */
function startSignIn() {
  if (firebase.auth().currentUser) {
    firebase.auth().signOut();
  } else {
    startAuth(true);
  }
}

window.onload = function() {
  initApp();
};
