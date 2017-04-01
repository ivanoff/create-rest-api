'use strict';

var chai = require('chai');
var chaiHttp = require('chai-http');

var expect = chai.expect;
require('mocha-sinon');

chai.use(chaiHttp);

var fs = require('fs');
var config = JSON.parse(fs.readFileSync(require('path').resolve(__dirname,'config/test.json')));

var optDb = config.db.mongo;
var dbAuth = process.env.DB_AUTH ? process.env.DB_AUTH + '@'
  : optDb.login ? optDb.login + ':' + optDb.password + '@'
  : '';
var dbUrl = optDb.url;
if (optDb.port) dbUrl += ':' + optDb.port;
if (optDb.name) dbUrl += '/' + optDb.name;
dbUrl = 'mongodb://' + dbAuth + dbUrl;

var mongo = require('../lib/db/mongo');

describe('Mongo', function() {
  describe('Close', function() {
    it('Close', function(done) {
      mongo.close(done);
    });
    it('Close again', function(done) {
      mongo.close(done);
    });
  });
  describe('Default', function() {
    it('Connect', function(done) {
      process.env.NODE_ENV = 'develop';
      mongo.connect(dbUrl, function(err){
        expect(err).to.be.an('object');
        done();
      });
    });
  });
});
