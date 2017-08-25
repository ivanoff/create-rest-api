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

// depricated !!!
app.registerModel('categories', {
  name: { type: 'string', required: true },
});

app.model('status', {
  name: { type: 'string', required: true },
});

app.model('movies', {
  name: { type: 'string', required: true },
  year: { type: 'integer' },
  categories: { type: 'array', link: 'categories' },
  status: { type: 'uuid', link: 'status' },
});

describe('App', function () {

  before(() => {
    app._start(null, 8891, dbUrl);
  });

  describe('/categories', function () {
    var id;
    var idM;
    var idS;
    it('mongodb mock connection', function (done) {
      app._db.connect(dbUrl, done);
    });

    it('add one', function (done) {
      chai.request(app)
        .post('/categories')
        .send({ name: 'test' })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          done();
        });
    });

    it('get all', function (done) {
      chai.request(app)
        .get('/categories')
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          id = res.body[0]._id;
          done();
        });
    });

    it('get one', function (done) {
      chai.request(app)
        .get('/categories/' + id)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('name').eql('test');
          done();
        });
    });

    it('add another one', function (done) {
      chai.request(app)
        .post('/categories')
        .send({ name: '123' })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          done();
        });
    });

    it('get all, but _fields, _sort, _start, _limit', function (done) {
      chai.request(app)
        .get('/categories')
        .query({ _fields: 'name', _sort: '-name,_id', _start: 1, _limit: 1 })
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          done();
        });
    });

    it('get all, but _fields, _sort, _start, _limit', function (done) {
      chai.request(app)
        .get('/categories')
        .query({ _fields: 'name', _sort: '-name,_id', _start: 1, _limit: 1 })
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          done();
        });
    });

    it('get all, but _filter, _order, _begin, _limit', function (done) {
      chai.request(app)
        .get('/categories')
        .query({ _filter: 'name', _order: '-name,_id', _begin: 1, _limit: 1 })
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          done();
        });
    });

    it('get name is test', function (done) {
      chai.request(app)
        .get('/categories')
        .query({ name: 'test' })
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          done();
        });
    });

    it('get name is test', function (done) {
      chai.request(app)
        .get('/categories')
        .query({ name: 123 })
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          done();
        });
    });

    it('get name is /te/', function (done) {
      chai.request(app)
        .get('/categories')
        .query({ name: '/te/' })
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          done();
        });
    });

    it('change field', function (done) {
      chai.request(app)
        .patch('/categories/' + id)
        .send({ name: 'test2' })
        .end(function (err, res) {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('replace data', function (done) {
      chai.request(app)
        .put('/categories/' + id)
        .send({ name: 'test3' })
        .end(function (err, res) {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('change field on unknown', function (done) {
      chai.request(app)
        .patch('/categories/123')
        .send({ name: 'test2' })
        .end(function (err, res) {
          expect(res).to.have.status(404);
          done();
        });
    });

    it('replace data on unknown', function (done) {
      chai.request(app)
        .put('/categories/123')
        .send({ name: 'test3' })
        .end(function (err, res) {
          expect(res).to.have.status(404);
          done();
        });
    });

    it('add one', function (done) {
      chai.request(app)
        .post('/movies')
        .send({ name: 'test-movie', categories: [id] })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          done();
        });
    });

    it('get all', function (done) {
      chai.request(app)
        .get('/movies')
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          idM = res.body[0]._id;
          done();
        });
    });

    it('get one', function (done) {
      chai.request(app)
        .get('/movies/' + idM)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('name').eql('test-movie');
          done();
        });
    });

    it('get related', function (done) {
      chai.request(app)
        .get('/categories/' + id + '/movies')
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          expect(res.body[0]).to.have.property('name').eql('test-movie');
          done();
        });
    });

    it('get related', function (done) {
      chai.request(app)
        .get('/movies/' + idM + '/categories')
        .end(function (err, res) {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('array');
          expect(res.body[0]).to.have.property('name').eql('test');
          done();
        });
    });

    it('get related by id', function (done) {
      chai.request(app)
        .get('/categories/' + id + '/movies/' + idM)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('get related by id', function (done) {
      chai.request(app)
        .get('/movies/' + idM + '/categories/' + id)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('post related', function (done) {
      chai.request(app)
        .post('/categories/' + id + '/movies')
        .send({ name: 'test4', categories: [id] })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          done();
        });
    });

    it('post related', function (done) {
      chai.request(app)
        .post('/movies/' + idM + '/categories')
        .send({ name: 'test5' })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          done();
        });
    });

    it('post related again', function (done) {
      chai.request(app)
        .post('/categories/' + id + '/movies')
        .send({ name: 'test4' })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          done();
        });
    });

    it('post related again', function (done) {
      chai.request(app)
        .post('/movies/' + idM + '/categories')
        .send({ name: 'test5' })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          done();
        });
    });

    it('get related by id', function (done) {
      chai.request(app)
        .get('/movies/' + idM + '/categories/' + id)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('post related status', function (done) {
      chai.request(app)
        .post('/movies/' + idM + '/status')
        .send({ name: 'status1' })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          idS = res.body._id;
          done();
        });
    });

    it('post related status', function (done) {
      chai.request(app)
        .post('/status/' + idS + '/movies')
        .send({ name: 'movie3s1' })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          done();
        });
    });

    it('post related status', function (done) {
      chai.request(app)
        .post('/movies/' + idM + '/status')
        .send({ name: 'status1' })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          idS = res.body._id;
          done();
        });
    });

    it('post related status', function (done) {
      chai.request(app)
        .post('/status/' + idS + '/movies')
        .send({ name: 'movie3s1' })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          done();
        });
    });

    it('post movies', function (done) {
      chai.request(app)
        .post('/movies')
        .send({ name: 'm0' })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          idM = res.body._id;
          done();
        });
    });

    it('post related categories', function (done) {
      chai.request(app)
        .post('/movies/' + idM + '/categories')
        .send({ name: 'movie3c1' })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          done();
        });
    });
    /*
        it('delete data', function (done) {
          chai.request(app)
            .delete('/categories/' + id)
            .end(function (err, res) {
              expect(res).to.have.status(200);
              done();
            });
        });
    */
    it('delete data', function (done) {
      chai.request(app)
        .delete('/categories/' + id)
        .end(function (err, res) {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('delete same data', function (done) {
      chai.request(app)
        .delete('/categories/' + id)
        .end(function (err, res) {
          expect(res).to.have.status(404);
          done();
        });
    });

    it('delete all data', function (done) {
      chai.request(app)
        .delete('/movies')
        .end(function (err, res) {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('delete unknown data', function (done) {
      chai.request(app)
        .delete('/categories/' + id)
        .end(function (err, res) {
          expect(res).to.have.status(404);
          done();
        });
    });
  });
});
