const functions = require("firebase-functions");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const session = require("express-session");
const express = require("express");
const engines = require("consolidate");
const Handlebars = require("handlebars");
const FirebaseStore = require("connect-session-firebase")(session);
const fs = require("fs");

const routes = require("./routes");
const fb = require("./firebase");

const app = express();

const {fileParser} = require('express-multipart-file-parser');

app.use(fileParser({
  rawBodyOptions: {
    limit: '15mb',
  },
  busboyOptions: {
    limits: {
      fields: 20
    }
  },
}));

function checkAuth(req, res, next) {
  if (
    req.url != "/painel/login" &&
    (!req.session || !req.session.authenticated)
  ) {
    console.log("checkAuth " + req.url);
    res.redirect("/painel/login");
    return;
  }
  next();
}

app.engine("hbs", engines.handlebars);
app.set("views", "./views");
app.set("view engine", "hbs");

var partials = __dirname + "/views/fragments/";
fs.readdirSync(partials).forEach(function (file) {
  var source = fs.readFileSync(partials + file, "utf8"),
    partial = /(.+)\.hbs/.exec(file).pop();
  Handlebars.registerPartial(partial, source);
});

Handlebars.registerHelper('switch', function (value, options) {
  this.switch_value = value;
  return options.fn(this);
});

Handlebars.registerHelper('case', function (value, options) {
  if (value == this.switch_value) {
    return options.fn(this);
  }
});

Handlebars.registerHelper('default', function (value, options) {
  return true; ///We can add condition if needs
});

Handlebars.registerHelper('select', function (variable, value) {
  if (variable == value) {
    return new Handlebars.SafeString('selected=selected');
  }
  else {
    return '';
  }
});

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "private");
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    store: new FirebaseStore({
      database: fb.firebaseApp.database()
    }),
    name: "__session",
    secret: "4pPM3rC$d0",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 60000, secure: false, httpOnly: false }
  })
);
app.use(expressValidator());

var flash = require("express-flash");
app.use(flash());
// Disabled for dev
//app.use(checkAuth);
routes(app);

exports.app = functions.https.onRequest(app);
