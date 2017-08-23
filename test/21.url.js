'use strict';

process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
chai.use(chaiHttp);

var json = require('fs').readFileSync(require('path').resolve(__dirname, 'config/test.json'));
var config = JSON.parse(json);

var optDb = config.db.mongo;
var dbAuth = process.env.DB_AUTH ? process.env.DB_AUTH + '@'
  : optDb.login ? optDb.login + ':' + optDb.password + '@'
  : '';
var dbUrl = optDb.url;
if (optDb.port) dbUrl += ':' + optDb.port;
if (optDb.name) dbUrl += '/' + optDb.name;
dbUrl = 'mongodb://' + dbAuth + dbUrl;

var App = require('../lib/server');
var app = new App();
app._db = require('../lib/db/mongo');

app.model('cars');
app.models.cars.get = (params, next) => { next('manual error'); };

app.model('trains');
app.models.trains.get = (params, next) => { unknownFunction(); };

app.model('bus');

app.needToken();

app.model('secured');

describe('Using URL', function () {
  var token;

  before(() => {
    app._start(null, 8878, dbUrl);
  });

  it('get categories', function (done) {
    chai.request('http://127.0.0.1:8878')
      .get('/categories')
      .end(function (err, res) {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('developerMessage').eql('Cannot GET /categories');
        done();
      });
  });

  it('get manual error', function (done) {
    chai.request('http://127.0.0.1:8878')
      .get('/cars')
      .end(function (err, res) {
        expect(res).to.have.status(400);
        expect(res.body).to.have.property('error').eql('manual error');
        done();
      });
  });

  it('get error in function', function (done) {
    chai.request('http://127.0.0.1:8878')
      .get('/trains')
      .end(function (err, res) {
        expect(res).to.have.status(500);
        expect(res.body).to.have.property('name').eql('INTERNAL_SERVER_ERROR');
        done();
      });
  });

  describe('/login', function () {
    it('/login', function (done) {
      chai.request('http://127.0.0.1:8878')
        .post('/login')
        .send({ login: 'admin', password: 'admin' })
        .end(function (err, res) {
          expect(res).to.have.status(403);
          expect(res.body).to.have.property('name').eql('NO_TOKEN_SECRET');
          done();
        });
    });
  });

});
