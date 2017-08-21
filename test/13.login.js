'use strict';
process.env.NODE_ENV = 'test';
process.env.DB_STORAGE = 'memory';

const chai = require('chai');
const chaiHttp = require('chai-http');

const async = require('async');

const expect = chai.expect;
chai.use(chaiHttp);

const fs = require('fs');
const config = JSON.parse(fs.readFileSync(require('path').resolve(__dirname, 'config/test.json')));

const optDb = config.db.mongo;
const dbAuth = process.env.DB_AUTH ? process.env.DB_AUTH + '@'
  : optDb.login ? optDb.login + ':' + optDb.password + '@'
  : '';
let dbUrl = optDb.url;
if (optDb.port) dbUrl += ':' + optDb.port;
if (optDb.name) dbUrl += '/' + optDb.name;
dbUrl = 'mongodb://' + dbAuth + dbUrl;

let appL;
let App = require('../lib/server');

describe('Login', function () {

  before( () => {
    appL = new App();
    appL._db = require('../lib/db/mongo');

    appL.use( function (req, res, next) {
      req._setOptions( {validation: false} );
      req._setConfig( {} );
      req._db = appL._db;
      next();
    });

    require('../routes/login')(appL);

    appL.model('messages');
    appL.needToken();
    appL.model('ingredients');
  });

  after( () => {
      appL = null;
  });

  describe('insert credentials in to database', function () {

    it('mongodb mock connection', function (done) {
      appL._db.connect(dbUrl, (e,r) => { console.log(e);done(e,r)} );
    });

    it('insert credentials', function (done) {
      appL._db.collection('users').insertOne(
        { login: 'admin1', password: '21232f297a57a5a743894a0e4a801fc3', group: 'admin' },
        function(err, result) {
          expect(err).to.be.null;
          done();
        });
    });
  });

  describe('error login: NO TOKEN', function () {
    it('/login', function (done) {
      chai.request(appL)
        .post('/login')
        .end(function (err, res) {
          expect(res.body).to.have.property('name').eql('NO_TOKEN_SECRET');
          expect(res).to.have.status(403);
          done();
        });
    });

    it('patch /login', function (done) {
      chai.request(appL)
        .patch('/login')
        .end(function (err, res) {
          expect(res.body).to.have.property('name').eql('NO_TOKEN_SECRET');
          expect(res).to.have.status(403);
          done();
        });
    });
  });
});

describe('Login', function () {
  let token;

  before( () => {
    appL = new App();
    appL._db = require('../lib/db/mongo');

    appL.use( function (req, res, next) {
      req._setOptions( {validation: false} );
      req._setConfig( {token: { secret: 'secret' }} );
      req._db = appL._db;
      next();
    });

    require('../routes/login')(appL);

    appL.model('messages');
    appL.needToken();
    appL.model('ingredients');
  });

  after( () => {
    appL = null;
  });

  describe('error login: user not found', function () {
    it('/login', function (done) {
      chai.request(appL)
        .post('/login')
        .send({ login: 'admin1' })
        .end(function (err, res) {
          expect(res.body).to.have.property('name').eql('USER_NOT_FOUND');
          expect(res).to.have.status(404);
          done();
        });
    });
  });

  describe('error login: user not found 2', function () {
    it('/login', function (done) {
      chai.request(appL)
        .post('/login')
        .send({ login: 'adm', password: 'hi!' })
        .end(function (err, res) {
          expect(res.body).to.have.property('name').eql('USER_NOT_FOUND');
          expect(res).to.have.status(404);
          done();
        });
    });
  });

  describe('create token', function () {
    it('/login', function (done) {
      chai.request(appL)
        .post('/login')
        .send({ login: 'admin1', password: 'admin' })
        .end(function (err, res) {
          expect(err).to.be.null;
          expect(res.body).to.have.property('token');
          token = res.body.token;
          done();
        });
    });
    it('patch /login', function (done) {
      chai.request(appL)
        .patch('/login')
        .end(function (err, res) {
          expect(res.body).to.have.property('name').eql('NO_TOKEN');
          expect(res).to.have.status(401);
          done();
        });
    });
  });

});
