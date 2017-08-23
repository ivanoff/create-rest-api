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

var App = require('../lib/server');
var app = new App();
app._db = require('../lib/db/mongo');

app.use(function (req, res, next) {
  req._setOptions();
  req._setConfig();
  next();
});

app.use(function (req, res, next) {
  req._setOptions({ validation: true });
  next();
});

app.model();

app.model('stars', {
  name: { type: 'string', required: true },
});

app.model('categories', {
  name: { type: 'string', required: true },
});

app.model('movies', {
  name: { type: 'string', required: true },
  year: { type: 'integer' },
  categories: { type: 'array', link: 'categories' },
});

app.model('books', {
  name: { type: 'string', required: true },
  authors: { type: 'array', link: 'authors' },
});

app.get('/not_found_error', function (req, res, next) {
  return req._error.NOT_FOUND();
});

app.get('/validation_error', function (req, res, next) {
  return req._error.DATA_VALIDATION_ERROR();
});

app.get('/internal_error', function (req, res, next) {
  return req._error.INTERNAL_SERVER_ERROR();
});

app.get('/stack_error', function (req, res, next) {
  next({ stack: 'error stack' });
});

app.get('/show_error', function (req, res, next) {
  return req._error.show();
});

app.needToken();
app.model('secured');

describe('Errors', function () {

  before(function () {
  });

  describe('own routes', function () {
    it('DATA_VALIDATION_ERROR', function (done) {
      chai.request(app)
        .get('/validation_error')
        .end(function (err, res) {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('name').eql('DATA_VALIDATION_ERROR');
          done();
        });
    });

    it('NOT_FOUND', function (done) {
      chai.request(app)
        .get('/not_found_error')
        .end(function (err, res) {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('name').eql('NOT_FOUND');
          done();
        });
    });

    it('INTERNAL_SERVER_ERROR', function (done) {
      chai.request(app)
        .get('/internal_error')
        .end(function (err, res) {
          expect(res).to.have.status(500);
          expect(res.body).to.have.property('name').eql('INTERNAL_SERVER_ERROR');
          done();
        });
    });

    it('stack error', function (done) {
      chai.request(app)
        .get('/stack_error')
        .end(function (err, res) {
          expect(res).to.have.status(500);
          expect(res.text).to.match(/<pre>error stack<\/pre>/);
          done();
        });
    });

    it('show unknown error', function (done) {
      chai.request(app)
        .get('/show_error')
        .end(function (err, res) {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('error').eql('UNKNOWN_ERROR');
          done();
        });
    });
  });

  describe('/cat', function () {
    it('mongodb mock connection', function (done) {
      app._db.connect(dbUrl, done);
    });

    it('INTERNAL_SERVER_ERROR', function (done) {
      chai.request(app)
        .get('/whateverNotF')
        .end(function (err, res) {
          expect(res).to.have.status(404);
          expect(res.text).to.match(/<pre>Cannot GET \/whateverNotF<\/pre>/);
          done();
        });
    });

    it('add new', function (done) {
      chai.request(app)
        .post('/categories')
        .send({ name: 'test' })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('name').eql('test');
          done();
        });
    });

    it('empty', function (done) {
      chai.request(app)
        .get('/stars')
        .end(function (err, res) {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('name').eql('NOT_FOUND');
          done();
        });
    });

    it('wrong data', function (done) {
      chai.request(app)
        .get('/stars')
        .query({ nn: 'aa', _start: 'a', _limit: -100 })
        .end(function (err, res) {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('name').eql('NOT_FOUND');
          done();
        });
    });

    it('post wrong key', function (done) {
      chai.request(app)
        .post('/categories')
        .send({ nme: 'test' })
        .end(function (err, res) {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('name').eql('DATA_VALIDATION_ERROR');
          done();
        });
    });

    it('patch wrong key', function (done) {
      chai.request(app)
        .post('/categories')
        .send({ name: 'test' })
        .end(function (err, res) {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('name').eql('test');
          chai.request(app)
            .patch('/categories/' + res.body._id)
            .send({ nme: 'test' })
            .end(function (err, res) {
              expect(res).to.have.status(400);
              expect(res.body).to.have.property('name').eql('DATA_VALIDATION_ERROR');
              done();
            });
        });
    });

    it('wrong key again', function (done) {
      chai.request(app)
        .put('/categories')
        .send({ nme: 'test' })
        .end(function (err, res) {
          expect(res).to.have.status(404);
          done();
        });
    });

    it('wrong id', function (done) {
      chai.request(app)
        .get('/categories/123')
        .end(function (err, res) {
          expect(res).to.have.status(404);
          expect(res.body).to.have.property('name').eql('NOT_FOUND');
          done();
        });
    });

    it('wrong path', function (done) {
      chai.request(app)
        .get('/cat')
        .end(function (err, res) {
          expect(res).to.have.status(404);
          done();
        });
    });
  });

});
