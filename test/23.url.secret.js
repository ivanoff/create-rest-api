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

app.use(function (req, res, next) {
  req._setConfig({ token: { secret: 'secret' } });
  req._db = app._db;
  next();
});

app.model('shop', {
  cars: {link: 'cars'}
});

app.model('cars');

app.model('bus');

app.model('trains');
app.models.trains.get = (params, next) => { unknownFunction(); };
app.models.trains.post = (params, next) => { next('manual error'); };

app.needToken();

app.model('secured');

app.use(function (req, res, next) {
  req._setConfig();
  next();
});

app.model('secured_no_token');

app._start(null, 8881, dbUrl);

describe('Add related data', function () {
  var carId;
  var shopId;
  it('add car', function (done) {
    chai.request('http://127.0.0.1:8881')
      .post('/cars')
      .send({ model: 'Ford' })
      .end(function (err, res) {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('model').eql('Ford');
        expect(res.body).to.have.property('_id');
        carId = res.body._id;
        done();
      });
  });

  it('add shop', function (done) {
    chai.request('http://127.0.0.1:8881')
      .post('/shop')
      .send({ name: 'Ford shop', cars: [carId] })
      .end(function (err, res) {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('name').eql('Ford shop');
        expect(res.body).to.have.property('_id');
        shopId = res.body._id;
        done();
      });
  });

  it('get all cars by shopId', function (done) {
    chai.request('http://127.0.0.1:8881')
      .get('/shop/' + shopId + '/cars')
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.be.a('array');
        expect(res.body[0]).to.have.property('model').eql('Ford');
        expect(res.body[0]).to.have.property('_id').eql(carId);
        done();
      });
  });
});

describe('Using Secret', function () {
  var token;
  var tokenExpired = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTlkY2I3NjM2NTlmODY2Y'
    + 'mE0NzlmOGEiLCJfcmVmcmVzaFRva2VuIjoiMDY4MWZlZTEtZDgyYS00YTgyLThmYzktODEzMzk1MTRjNWQ3Iiwib'
    + 'G9naW4iOiJjYXJzIiwiZ3JvdXAiOiJjYXJzIiwiaWF0IjoxNTAzNTEzNDYyLCJleHAiOjE1MDM1MTM1MjJ9.d7x8'
    + 'hmEOhQ5nxaGDKW0Q3b1aWgEN96v4BnbjwucYkE8';
  var tokenBad = 'yeJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTlkY2I3NjM2NTlmODY2YmE0N'
    + 'zlmOGEiLCJfcmVmcmVzaFRva2VuIjoiMDY4MWZlZTEtZDgyYS00YTgyLThmYzktODEzMzk1MTRjNWQ3IiwibG9na'
    + 'W4iOiJjYXJzIiwiZ3JvdXAiOiJjYXJzIiwiaWF0IjoxNTAzNTEzNDYyLCJleHAiOjE1MDM1MTM1MjJ9.d7x8hmEO'
    + 'hQ5nxaGDKW0Q3b1aWgEN96v4BnbjwucYkE8';

  it('mongodb mock connection', function (done) {
    app._db.connect(dbUrl, done);
  });

  it('insert credentials', function (done) {
    app._db.collection('users').insertOne(
      { login: 'cars', password: 'e66a124f9cabd3198d84dd68c8c87cf7', group: 'cars' },
      function (err, result) {
        expect(err).to.be.null;
        done();
      });
  });

  it('/login', function (done) {
    chai.request('http://127.0.0.1:8881')
      .post('/login')
      .send({ login: 'cars', password: 'cars' })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('token');
        token = res.body.token;
        done();
      });
  });

  it('/secured expired', function (done) {
    chai.request('http://127.0.0.1:8881')
      .post('/secured')
      .send({ my: 'data' })
      .set('X-Access-Token', tokenExpired)
      .end(function (err, res) {
        expect(res).to.have.status(403);
        expect(res.body).to.have.property('name').eql('TOKEN_EXPIRED');
        expect(res.body).to.have.property('developerMessage');
        expect(res.body.developerMessage).to.have.property('expiredAt');
        done();
      });
  });

  it('/secured bad', function (done) {
    chai.request('http://127.0.0.1:8881')
      .post('/secured')
      .send({ my: 'data' })
      .set('X-Access-Token', tokenBad)
      .end(function (err, res) {
        expect(res).to.have.status(403);
        expect(res.body).to.have.property('name').eql('BAD_TOKEN');
        expect(res.body).to.have.property('developerMessage');
        done();
      });
  });

  it('/my login bad', function (done) {
    chai.request('http://127.0.0.1:8881')
      .post('/my/root/secured')
      .send({ my: 'data' })
      .set('X-Access-Token', token)
      .end(function (err, res) {
        expect(res).to.have.status(401);
        expect(res.body).to.have.property('name').eql('ACCESS_DENIED');
        expect(res.body).to.have.property('developerMessage').eql('Login owner error');
        done();
      });
  });

  it('/our group bad', function (done) {
    chai.request('http://127.0.0.1:8881')
      .post('/our/root/secured')
      .send({ my: 'data' })
      .set('X-Access-Token', token)
      .end(function (err, res) {
        expect(res).to.have.status(401);
        expect(res.body).to.have.property('name').eql('ACCESS_DENIED');
        expect(res.body).to.have.property('developerMessage').eql('Group owner error');
        done();
      });
  });

  it('/secured', function (done) {
    chai.request('http://127.0.0.1:8881')
      .post('/secured')
      .send({ my: 'data' })
      .set('X-Access-Token', token)
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res.body).to.have.property('my').eql('data');
        expect(res.body).to.have.property('_id');
        done();
      });
  });

  it('/secured', function (done) {
    chai.request('http://127.0.0.1:8881')
      .get('/secured')
      .set('X-Access-Token', token)
      .end(function (err, res) {
        expect(err).to.be.null;
        expect(res.body[0]).to.have.property('my').eql('data');
        done();
      });
  });

  it('/secured_no_token', function (done) {
    chai.request('http://127.0.0.1:8881')
      .post('/secured_no_token')
      .send({ my: 'data' })
      .set('X-Access-Token', token)
      .end(function (err, res) {
        expect(res).to.have.status(403);
        expect(res.body).to.have.property('name').eql('NO_TOKEN_SECRET');
        done();
      });
  });

});
