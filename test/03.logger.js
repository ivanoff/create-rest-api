'use strict';

process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');

var expect = chai.expect;

chai.use(chaiHttp);

var fs = require('fs');
var config = JSON.parse(fs.readFileSync(require('path').resolve(__dirname, 'config/test.json')));

var App = require('../lib/server');
var app = new App();
app._db = require('../lib/db/mongo');

var optDb = config.db.mongo;
var dbAuth = process.env.DB_AUTH ? process.env.DB_AUTH + '@'
  : optDb.login ? optDb.login + ':' + optDb.password + '@'
  : '';
var dbUrl = optDb.url;
if (optDb.port) dbUrl += ':' + optDb.port;
if (optDb.name) dbUrl += '/' + optDb.name;
dbUrl = 'mongodb://' + dbAuth + dbUrl;

describe('Logger', function () {

  describe('default', function () {
    it('Default logs', function (done) {
      app.log.setupLog();
      done();
    });
  });

  describe('timezone', function () {
    it('config logs', function (done) {
      config.log.timezone = 'Europe/London';
      app.log.setupLog(config.log);
      expect(config.log.timestamp).to.be.an('function');
      expect(config.log.timestamp()).to.be.an('string');
      done();
    });
  });

  describe('config', function () {
    it('config logs', function (done) {
      app.log.setupLog(config.log);
      done();
    });

    it('object logs', function (done) {
      app.log.info({ thisIs: 'an Object' });
      done();
    });
  });

});
