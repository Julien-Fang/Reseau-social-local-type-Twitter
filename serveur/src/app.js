const path = require('path');
const api = require('./api.js');
const cors = require('cors'); 

const { database } = require("./db.js");

const basedir = path.normalize(path.dirname(__dirname));
console.debug(`Base directory: ${basedir}`);

//mécanisme de sécurité qui permet de contrôler l'accès aux ressources entre des domaines différents


const express = require('express');
const app = express();
api_1 = require("./api.js");
const session = require("express-session");





//app.use(cors());

//Jamais apres les ROUTES, ne pas le deplacer, rajouter simplement a l'interieur si bsn, lors des cookies
app.use(session({
    name : "toti",
    secret: "technoweb rocks",
    saveUnInitialized: true
}));


(async () => {
    const oui = await database();
    app.use('/api', api.default(oui));
})();


const corsOptions = {
    origin: true,
    credentials: true,
  }
  app.use(cors(corsOptions));
  
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

// Démarre le serveur
app.on('close', () => {
});



exports.default = app;
