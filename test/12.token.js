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
var appT = new App();

appT._db = require('../lib/db/mongo');

appT.use(function (req, res, next) {
  req._setOptions({ validation: false });
  req._setConfig({ token: { secret: 'secret' } });
  req._db = appT._db;
  next();
});

require('../routes/login')(appT);

appT.model('no_link', {
  broken: {link: 'no_link_url'}
});


appT.model('messages');
appT.needToken({ login: 'users.login', password: 'users.password' });
appT.model('ingredients');
appT.model('recipe', {
  ingredients: { link: 'ingredients' },
});

describe('Token', function () {
  var token;

  before(() => {
    appT._start(null, 8892, dbUrl);
  });

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
        function (err, result) {
          expect(err).to.be.null;
          done();
        });
    });
  });

  describe('create token', function () {
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

  describe('patch token', function () {
    it('/login', function (done) {
      chai.request(appT)
        .get('/login')
        .query({ token: token })
        .end(function (err, res) {
          expect(err).to.be.null;
          expect(res.body).to.have.property('_refreshToken');
          done();
        });
    });
  });

  describe('patch token', function () {
    it('/login', function (done) {
      chai.request(appT)
        .get('/login')
        .send({ token: token })
        .end(function (err, res) {
          expect(err).to.be.null;
          expect(res.body).to.have.property('_refreshToken');
          done();
        });
    });
  });

  describe('patch token', function () {
    it('/login', function (done) {
      chai.request(appT)
        .get('/login')
        .end(function (err, res) {
          expect(res.body).to.have.property('name').eql('NO_TOKEN');
          expect(res).to.have.status(401);
          done();
        });
    });
  });

  describe('patch token', function () {
    it('/login', function (done) {
      chai.request(appT)
        .patch('/login')
        .set('X-Access-Token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTliMWZkOD'
          + 'QzMWMxZjJjOTk4YzFmMmEiLCJfcmVmcmVzaFRva2VuIjoiYzFmZTQ0MDAtOGYxYi00Yjc5LWIwYWUt'
          + 'YjBjN2ZkYTBlMWE2IiwibG9naW4iOiJhZG1pbiIsImdyb3VwIjoiYWRtaW4iLCJpYXQiOjE1MDMzMz'
          + 'g0NTYsImV4cCI6MTUwMzMzODUxNn0.lJCJXNQYoNXz6ffCcMACs3EtCf72xmqPQYRW-F5f4wE')
        .end(function (err, res) {
          expect(res.body).to.have.property('name').eql('USER_NOT_FOUND');
          expect(res).to.have.status(404);
          done();
        });
    });
  });

  describe('patch token', function () {
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
    var idI;
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
          idI = res.body[0]._id;
          done();
        });
    });

    it('get one', function (done) {
      chai.request(appT)
        .get('/our/admin/ingredients/' + idI)
        .set('X-Access-Token', token)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('name').eql('Tomato');
          done();
        });
    });

    it('add our one', function (done) {
      chai.request(appT)
        .post('/our/admin/recipe')
        .set('X-Access-Token', token)
        .send({ name: 'Mashed tomato', ingredients: [idI] })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          done();
        });
    });

    it('add our one', function (done) {
      chai.request(appT)
        .post('/our/admin/recipe')
        .set('X-Access-Token', token)
        .send({ name: 'Crisps', ingredients: [idI] })
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

    it('patch our one', function (done) {
      chai.request(appT)
        .patch('/our/admin/recipe/' + id)
        .set('X-Access-Token', token)
        .send({ name: 'Mashed potato', ingredients: [idI] })
        .end(function (err, res) {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('get one', function (done) {
      chai.request(appT)
        .get('/our/admin/recipe/' + id)
        .set('X-Access-Token', token)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('name').eql('Mashed potato');
          done();
        });
    });

    it('get one reciepe by ingridients', function (done) {
      chai.request(appT)
        .get('/our/admin/ingredients/' + idI + '/recipe')
        .set('X-Access-Token', token)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body[0]).to.have.property('name').eql('Mashed potato');
          expect(res.body[1]).to.have.property('name').eql('Crisps');
          done();
        });
    });

    it('delete ingredients', function (done) {
      chai.request(appT)
        .delete('/our/admin/recipe/' + id + '/ingredients')
        .set('X-Access-Token', token)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('ok').eql(1);
          done();
        });
    });

    it('delete recipes', function (done) {
      chai.request(appT)
        .delete('/our/admin/ingredients/' + idI + '/recipe')
        .set('X-Access-Token', token)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('ok').eql(1);
          done();
        });
    });

    it('delete one', function (done) {
      chai.request(appT)
        .delete('/our/admin/ingredients/' + idI)
        .set('X-Access-Token', token)
        .end(function (err, res) {
          expect(res).to.have.status(404);
          done();
        });
    });

  });

  describe('/my/admin/recipe', function () {
    var id;
    it('add our one', function (done) {
      chai.request(appT)
        .post('/my/admin/recipe')
        .set('X-Access-Token', token)
        .send({ name: 'Mashed tomato', ingredients: [id] })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          done();
        });
    });

    it('get all', function (done) {
      chai.request(appT)
        .get('/my/admin/recipe')
        .set('X-Access-Token', token)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          id = res.body[0]._id;
          done();
        });
    });

    it('add our one', function (done) {
      chai.request(appT)
        .patch('/my/admin/recipe/' + id)
        .set('X-Access-Token', token)
        .send({ name: 'Mashed potato', ingredients: [id] })
        .end(function (err, res) {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('get one', function (done) {
      chai.request(appT)
        .get('/my/admin/recipe/' + id)
        .set('X-Access-Token', token)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('name').eql('Mashed potato');
          done();
        });
    });

  });

  describe('delete from /my/admin/ingredients', function () {
    var id;
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

    it('delete one', function (done) {
      chai.request(appT)
        .delete('/my/admin/ingredients/' + id)
        .set('X-Access-Token', token)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('ok').eql(1);
          done();
        });
    });
  });

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
        .send({ name: 'Mashed tomato', ingredients: [id] })
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
