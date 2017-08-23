/****
 Work with MongoDB
 Usage:
    db = require( './db' );
    db.connect( URL, function( err ) { ... } );
    db.collection( ... ).find( ... );
****/

'use strict'

var mongodb = require('mongodb');

var state = { db: null };

/**
 * Connect to database
 * @param {string} url - database's url
 */
exports.connect = function (url, done) {
  if (state.db) return done();
  var MongoClient = mongodb.MongoClient;
  if(process.env.DB_STORAGE === 'memory') {
    var mongodbTest = require('mongo-mock');
    mongodbTest.max_delay = 0;
    MongoClient = mongodbTest.MongoClient
  }
  MongoClient.connect(url, function (err, db) {
    if (err) return done(err);
    state.db = db;
    done();
  });
};

/**
 * Getter of collection
 */
exports.collection = function (collectionName) {
  return state.db.collection(collectionName);
};

/**
 * Close connect
 */
exports.close = function (done) {
  if (state.db) {
    var _this = this;
    state.db.close(function (err, result) {
      state.db = null;
      _this.collection = null;
      done(err);
    });
  } else {
    done();
  }
};
