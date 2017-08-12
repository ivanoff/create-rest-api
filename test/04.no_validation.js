'use strict';

process.env.NODE_ENV = 'test';
process.env.DB_STORAGE = 'memory';

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

var app = require('../lib/server');
app._db = require('../lib/db/mongo');

app.model('categories', {
  name: { type: 'string', required: true },
});

describe('No validation', function () {

  describe('/cat', function () {
    it('mongodb mock connection', function (done) {
      app._db.connect(dbUrl, done);
    });

    it('add new valid', function (done) {
      chai.request(app)
        .post('/categories')
        .send({ name: 'test' })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          done();
        });
    });

    it('wrong key but no validation', function (done) {
      chai.request(app)
        .post('/categories')
        .send({ nme: 'test' })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          done();
        });
    });

  });
});
