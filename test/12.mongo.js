'use strict';

var chai = require('chai');
var chaiHttp = require('chai-http');

var expect = chai.expect;
chai.use(chaiHttp);

var fs = require('fs');
var config = JSON.parse(fs.readFileSync(require('path').resolve(__dirname, 'config/test.json')));

var optDb = config.db.mongo;
var dbAuth = process.env.DB_AUTH ? process.env.DB_AUTH + '@'
  : optDb.login ? optDb.login + ':' + optDb.password + '@'
  : '';
var dbUrl = optDb.url;
if (optDb.port) dbUrl += ':' + optDb.port;
if (optDb.name) dbUrl += '/' + optDb.name;
dbUrl = 'mongodb://' + dbAuth + dbUrl;

var mongo = require('../lib/db/mongo');

describe('Mongo', function () {
  describe('Close', function () {
    it('Close', function (done) {
      mongo.close(done);
    });

    it('Close again', function (done) {
      mongo.close(done);
    });
  });

  describe('Default', function () {
    it('Connect', function (done) {
      process.env.DB_STORAGE = 'mongo';
      mongo.connect(dbUrl, function (err) {
        expect(err).to.be.an('object');
        done();
      });
    });
  });

  describe('Error on start', function () {
    it('Connect', function (done) {
      process.env.NODE_ENV = 'test';
      var app = require('../lib/server');
      app._db = require('../lib/db/mongo');
      app._db.connect = function(url, next) {
        next('connection error');
      };
      app._start(null, 8879, dbUrl);
      done();
    });
  });
});
