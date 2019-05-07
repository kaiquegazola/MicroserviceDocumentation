const functions = require("firebase-functions");
const firebase = require("firebase-admin");
const firebaseApp = firebase.initializeApp(functions.config().firebase);

module.exports.firebaseApp = firebaseApp;
