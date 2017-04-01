'use strict';

process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');

var expect = chai.expect;
require('mocha-sinon');

chai.use(chaiHttp);

var fs = require('fs');
var config = JSON.parse(fs.readFileSync(require('path').resolve(__dirname,'config/test.json')));

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

var DefaultModel = require('../models/default');
var DefaultController = require('../controllers/default');
var DefaultRoutes = require('../routes/default');

function registerModel(name, model) {
  app.models[name] = new DefaultModel(name, model, app._db);
  app.models[name].get = function (search, fields, sort, skip, limit, relation, next) {
    next('error');
  }
  app.models[name].add = function (doc, next) {
    next('error');
  }
  app.models[name].update = function (id, doc, next) {
    next('error');
  }
  app.models[name].delete = function (doc, next) {
    next('error');
  }
  app.controllers[name] = new DefaultController(name, app.models[name]);
  app.routes[name] = new DefaultRoutes(name, app.controllers[name], app);
}

function registerModel2(name, model) {
  app.models[name] = new DefaultModel(name, model, app._db);
  app.models[name].update = function (id, doc, next) {
    next('error');
  }
  app.controllers[name] = new DefaultController(name, app.models[name]);
  app.routes[name] = new DefaultRoutes(name, app.controllers[name], app);
}

registerModel('categories2', {
  name: { type: 'string' },
});

registerModel2('categories3', {
  name: { type: 'string' },
});

app._after();

describe('change models', function() {

  describe('Get error', function() {


    it('get all', function(done) {
      chai.request(app)
        .get('/categories2')
        .end(function(err, res) {
          expect(res).to.have.status(400);
          done();
        });
    });
    it('get one', function(done) {
      chai.request(app)
        .get('/categories2/123')
        .end(function(err, res) {
          expect(res).to.have.status(400);
          done();
        });
    });
    it('post one', function(done) {
      chai.request(app)
        .post('/categories2')
        .send({name: '123'})
        .end(function(err, res) {
          expect(res).to.have.status(400);
          done();
        });
    });
    it('post one error', function(done) {
      chai.request(app)
        .post('/categories2')
        .send({names: '123'})
        .end(function(err, res) {
          expect(res).to.have.status(400);
          done();
        });
    });
    it('patch one error', function(done) {
      chai.request(app)
        .patch('/categories2/123')
        .send({names: '123'})
        .end(function(err, res) {
          expect(res).to.have.status(400);
          done();
        });
    });
    it('put one error', function(done) {
      chai.request(app)
        .put('/categories2/123')
        .send({names: '123'})
        .end(function(err, res) {
          expect(res).to.have.status(400);
          done();
        });
    });
    it('patch one', function(done) {
      chai.request(app)
        .patch('/categories2/123')
        .send({name: '123'})
        .end(function(err, res) {
          expect(res).to.have.status(400);
          done();
        });
    });
    it('put one', function(done) {
      chai.request(app)
        .put('/categories2/123')
        .send({name: '123'})
        .end(function(err, res) {
          expect(res).to.have.status(400);
          done();
        });
    });
    it('delete one', function(done) {
      chai.request(app)
        .delete('/categories2/123')
        .end(function(err, res) {
          expect(res).to.have.status(400);
          done();
        });
    });

    var id;
    it('post one', function(done) {
      chai.request(app)
        .post('/categories3')
        .send({name: '123'})
        .end(function(err, res) {
          expect(res).to.have.status(201);
          id = res.body._id;
          done();
        });
    });
    it('bad update', function(done) {
      chai.request(app)
        .put('/categories3/' + id)
        .send({name: 'ttt'})
        .end(function(err, res) {
          expect(res).to.have.status(400);
          done();
        });
    });
  });
});
