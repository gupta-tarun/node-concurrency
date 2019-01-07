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
  console.error('starting up ...');
  
  var crypto = require('crypto');
  var express = require('express');
  var blitz = require('blitzkrieg');
  var app = express();
  
  var MongoClient = require('mongodb').MongoClient;
  var db;
  
  var uri = 'mongodb://user1:QQ0JVU1JlFlTkfQb@cluster0-shard-00-00-qxtaq.mongodb.net:27017,cluster0-shard-00-01-qxtaq.mongodb.net:27017,cluster0-shard-00-02-qxtaq.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true'
  
  console.error('trying to connect to db ...');
  // Initialize connection once
  MongoClient.connect(uri, function(err, database) {
    if(err) {
      console.error('error while connecting ...' + JSON.stringify(err));
      throw err;
    }
    console.error(database);

    db = database.db;

    // Start the application after the database connection is ready
    app
    .use(blitz(BLITZ_KEY))
    .get('/cpu', cpuBound)
    .get('/memory', memoryBound)
    .get('/io', ioBound)
    .listen(PORT, onListen);
    
    console.log("Listening on port " + PORT);
  });

  function cpuBound(req, res, next) {
    const collection = db.collection("c_1");

    var key = Math.random() < 0.5 ? 'ninjaturtles' : 'powerrangers';
    var hmac = crypto.createHmac('sha512WithRSAEncryption', key);
    var date = Date.now() + '';
    hmac.setEncoding('base64');
    hmac.end(date, function() {
      collection.insertOne({key: hmac.read()}, function(err, res) {
        // perform actions on the collection object
        if(err) { return res.send('Error Happened ' + JSON.stringify(err)); }
        return res.send('Successful ' + JSON.stringify(res));
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
