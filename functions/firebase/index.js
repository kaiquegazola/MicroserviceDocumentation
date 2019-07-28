const functions = require("firebase-functions");
const firebase = require("firebase-admin");

var serviceAccount = require("./microservicedocumentation-firebase-adminsdk-f2mrw-9e217a1630.json");

const firebaseApp = firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://microservicedocumentation.firebaseio.com"
});

module.exports.firebaseApp = firebaseApp;