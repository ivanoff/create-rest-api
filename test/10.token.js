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

var appT = require('../lib/server');
appT._db = require('../lib/db/mongo');

appT.use( function (req, res, next) {
  req._setOptions( {validation: false} );
  req._setConfig( {token: { secret: 'secret' }} );
  req._db = appT._db;
  next();
});

require('../routes/login')(appT);

appT.model('messages');

appT.needToken();

appT.model('ingredients');

appT.model('recipe', {
  ingredients: { link: 'ingredients' },
});

describe('Token', function () {
  var token;

  describe('/messages', function () {
    var id;
    it('add one', function (done) {
      chai.request(appT)
        .post('/messages')
        .send({ name: 'test' })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          done();
        });
    });

    it('get all', function (done) {
      chai.request(appT)
        .get('/messages')
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          id = res.body[0]._id;
          done();
        });
    });

    it('get one', function (done) {
      chai.request(appT)
        .get('/messages/' + id)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('name').eql('test');
          done();
        });
    });
  });

  describe('no token /ingredients', function () {
    it('get all', function (done) {
      chai.request(appT)
        .get('/ingredients')
        .end(function (err, res) {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('name').eql('NO_TOKEN');
          done();
        });
    });
  });

  describe('no token /recipe', function () {
    it('get all', function (done) {
      chai.request(appT)
        .get('/recipe')
        .end(function (err, res) {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('name').eql('NO_TOKEN');
          done();
        });
    });
  });

  describe('insert credentials in to database', function () {
    it('mongodb mock connection', function (done) {
      appT._db.connect(dbUrl, done);
    });

    it('insert credentials', function (done) {
      appT._db.collection('users').insertOne(
        { login: 'admin', password: '21232f297a57a5a743894a0e4a801fc3', group: 'admin' },
        function(err, result) {
          expect(err).to.be.null;
          done();
        });
    });
  });

  describe('get token', function () {
    it('/login', function (done) {
      chai.request(appT)
        .post('/login')
        .send({ login: 'admin', password: 'admin' })
        .end(function (err, res) {
          expect(err).to.be.null;
          expect(res.body).to.have.property('token');
          token = res.body.token;
          done();
        });
    });
  });

  describe('get token', function () {
    it('/login', function (done) {
      chai.request(appT)
        .get('/login')
        .set('X-Access-Token', token)
        .end(function (err, res) {
          expect(err).to.be.null;
          expect(res.body).to.have.property('_refreshToken');
          done();
        });
    });
  });

  describe('get token', function () {
    it('/login', function (done) {
      chai.request(appT)
        .patch('/login')
        .set('X-Access-Token', token)
        .end(function (err, res) {
          expect(err).to.be.null;
          expect(res.body).to.have.property('token');
          token = res.body.token;
          done();
        });
    });
  });

  describe('/ingredients', function () {
    var id;
    it('add one', function (done) {
      chai.request(appT)
        .post('/ingredients')
        .set('X-Access-Token', token)
        .send({ name: 'Tomato' })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          done();
        });
    });

    it('get all', function (done) {
      chai.request(appT)
        .get('/ingredients')
        .set('X-Access-Token', token)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          id = res.body[0]._id;
          done();
        });
    });

    it('get one', function (done) {
      chai.request(appT)
        .get('/ingredients/' + id)
        .set('X-Access-Token', token)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('name').eql('Tomato');
          done();
        });
    });
  });

  describe('/my/admin/ingredients', function () {
    var id;
    it('add one', function (done) {
      chai.request(appT)
        .post('/my/admin/ingredients')
        .set('X-Access-Token', token)
        .send({ name: 'Tomato' })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          done();
        });
    });

    it('get all', function (done) {
      chai.request(appT)
        .get('/my/admin/ingredients')
        .set('X-Access-Token', token)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          id = res.body[0]._id;
          done();
        });
    });

    it('get one', function (done) {
      chai.request(appT)
        .get('/my/admin/ingredients/' + id)
        .set('X-Access-Token', token)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('name').eql('Tomato');
          done();
        });
    });
  });

  describe('/our/admin/ingredients', function () {
    var id;
    it('add one', function (done) {
      chai.request(appT)
        .post('/our/admin/ingredients')
        .set('X-Access-Token', token)
        .send({ name: 'Tomato' })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          done();
        });
    });

    it('get all', function (done) {
      chai.request(appT)
        .get('/our/admin/ingredients')
        .set('X-Access-Token', token)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          id = res.body[0]._id;
          done();
        });
    });

    it('get one', function (done) {
      chai.request(appT)
        .get('/our/admin/ingredients/' + id)
        .set('X-Access-Token', token)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('name').eql('Tomato');
          done();
        });
    });
  });

  describe('/our/admin/recipe', function () {
    var id;
    it('add one', function (done) {
      chai.request(appT)
        .post('/our/admin/recipe')
        .set('X-Access-Token', token)
        .send({ name: 'Mashed tomato', ingredients:[id] })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          done();
        });
    });

    it('get all', function (done) {
      chai.request(appT)
        .get('/our/admin/recipe')
        .set('X-Access-Token', token)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          id = res.body[0]._id;
          done();
        });
    });

    it('get one', function (done) {
      chai.request(appT)
        .get('/our/admin/recipe/' + id)
        .set('X-Access-Token', token)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('name').eql('Mashed tomato');
          done();
        });
    });

  });
/*
// !!!!!!!!!! getRelationsData
  describe('delete from /our/admin/ingredients', function () {
    var id;
    it('get all', function (done) {
      chai.request(appT)
        .get('/our/admin/ingredients')
        .set('X-Access-Token', token)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          id = res.body[0]._id;
          done();
        });
    });

    it('delete one', function (done) {
      chai.request(appT)
        .delete('/our/admin/ingredients/' + id)
        .set('X-Access-Token', token)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('ok').eql(1);
          done();
        });
    });
  });
*/

  describe('delete from /ingredients', function () {
    var id;

    it('add one', function (done) {
      chai.request(appT)
        .post('/ingredients')
        .set('X-Access-Token', token)
        .send({ name: 'Tomato' })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          done();
        });
    });

    it('get all', function (done) {
      chai.request(appT)
        .get('/ingredients')
        .set('X-Access-Token', token)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          id = res.body[0]._id;
          done();
        });
    });

    it('add one', function (done) {
      chai.request(appT)
        .post('/recipe')
        .set('X-Access-Token', token)
        .send({ name: 'Mashed tomato', ingredients:[id] })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          done();
        });
    });

    it('delete one', function (done) {
      chai.request(appT)
        .delete('/ingredients/' + id)
        .set('X-Access-Token', token)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('ok').eql(1);
          done();
        });
    });
  });

});
