var throng = require('throng');
var mongodb = require('mongodb');

var WORKERS = process.env.WEB_CONCURRENCY || 1;
var PORT = process.env.PORT || 3000;
var BLITZ_KEY = process.env.BLITZ_KEY;

throng(start, {
  workers: WORKERS,
  lifetime: Infinity
});

function start() {
  var crypto = require('crypto');
  var express = require('express');
  var blitz = require('blitzkrieg');
  var app = express();

  app
    .use(blitz(BLITZ_KEY))
    .get('/cpu', cpuBound)
    .get('/memory', memoryBound)
    .get('/io', ioBound)
    .listen(PORT, onListen);

  function cpuBound(req, res, next) {
    const MongoClient = require('mongodb').MongoClient;
    const uri = "mongodb+srv://user1:QQ0JVU1JlFlTkfQb@cluster0.mongodb.net/admin";
    const client = new MongoClient(uri, { useNewUrlParser: true });
     client.connect(err => {
      const collection = client.db("test").collection("collectiom");

      var key = Math.random() < 0.5 ? 'ninjaturtles' : 'powerrangers';
      var hmac = crypto.createHmac('sha512WithRSAEncryption', key);
      var date = Date.now() + '';
      hmac.setEncoding('base64');
      hmac.end(date, function() {
        collection.insertOne({key: hmac.read()}, function(err, res) {
        // perform actions on the collection object
          client.close();
          if(err) { return res.send('Error Happened ' + JSON.stringify(err)); }
          return res.send('Successful ' + JSON.stringify(res));
        });
      });
    });
    
  }

  function memoryBound(req, res, next) {
    var hundredk = new Array(100 * 1024).join('X');
    setTimeout(function sendResponse() {
      res.send('Large response: ' + hundredk);
    }, 20).unref();
  }

  function ioBound(req, res, next) {
    setTimeout(function SimulateDb() {
      res.send('Got response from fake db!');
    }, 300).unref();
  }

  function onListen() {
    console.log('Listening on', PORT);
  }
}
