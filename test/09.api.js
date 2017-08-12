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

var app = require('../lib/server');
app._db = require('../lib/db/mongo');

app.model('categories', {
  name: { type: 'string', required: true },
});

app.model('movies', {
  name: { type: 'string', required: true },
  year: { type: 'integer' },
  categories: { type: 'array', link: 'categories' },
});

describe('api', function () {

  it('/api.raml', function (done) {
    chai.request(app)
      .get('/api.raml')
      .end(function (err, res) {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('/api.swagger', function (done) {
    chai.request(app)
      .get('/api.md')
      .end(function (err, res) {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('/api.swagger', function (done) {
    chai.request(app)
      .get('/api.swagger')
      .end(function (err, res) {
        expect(res).to.have.status(200);
        done();
      });
  });

  it('/api.html', function (done) {
    chai.request(app)
      .get('/api.html')
      .end(function (err, res) {
        expect(res).to.have.status(200);
        done();
      });
  });
});
