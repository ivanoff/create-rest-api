'use strict';
process.env.NODE_ENV = 'test';

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

var App = require('../lib/server');
var app = new App();

app._db = require('../lib/db/mongo');

app.use(function (req, res, next) {
  req._db = app._db;
  next();
});

app.model('types');

app.model('news', {
  type: { link: 'types' },
});

describe('News/Types relation', function () {

  before(() => {
    app._start(null, 8893, dbUrl);
  });

  describe('/types and /news', function () {
    var typeId;
    var typeId2;
    var newsId;
    var newsId2;

    it('add type', function (done) {
      chai.request(app)
        .post('/types')
        .send({ name: 'Economic' })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('name').eql('Economic');
          done();
        });
    });

    it('add second type', function (done) {
      chai.request(app)
        .post('/types')
        .send({ name: 'Politic' })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('name').eql('Politic');
          done();
        });
    });

    it('get all types', function (done) {
      chai.request(app)
        .get('/types')
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          typeId = res.body[0]._id;
          typeId2 = res.body[1]._id;
          done();
        });
    });

    it('add news', function (done) {
      chai.request(app)
        .post('/news')
        .send({ name: 'Bitcoin beats new record', type: [typeId] })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('name').eql('Bitcoin beats new record');
          expect(res.body.type).to.be.a('array');
          expect(res.body.type[0]).eql(typeId);
          done();
        });
    });

    it('add fake news', function (done) {
      chai.request(app)
        .post('/news')
        .send({ name: 'Fake news', type: [typeId2] })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('name').eql('Fake news');
          expect(res.body.type).to.be.a('array');
          expect(res.body.type[0]).eql(typeId2);
          newsId2 = res.body._id;
          done();
        });
    });

    it('get all types', function (done) {
      chai.request(app)
        .get('/news')
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          newsId = res.body[0]._id;
          done();
        });
    });

    it('delete one', function (done) {
      chai.request(app)
        .delete('/types/' + typeId + '/news')
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('ok').eql(1);
          done();
        });
    });

    it('add news with two types', function (done) {
      chai.request(app)
        .post('/news')
        .send({ name: 'Bitcoin beats new record', type: [typeId, typeId2] })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('name').eql('Bitcoin beats new record');
          expect(res.body.type).to.be.a('array');
          expect(res.body.type[0]).eql(typeId);
          done();
        });
    });

    it('delete one', function (done) {
      chai.request(app)
        .delete('/types/' + typeId + '/news')
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('ok').eql(1);
          done();
        });
    });

  });

});
