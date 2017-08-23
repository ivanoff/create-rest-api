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

describe('Using URL', function () {

  before(() => {
    //send headers before error
    app.use((req, res, next) => next(res.json({ error: 'yes' })));
    app._start(null, 8887, dbUrl);
  });

  it('get error in function', function (done) {
    chai.request('http://127.0.0.1:8887')
      .get('/error2')
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('error').eql('yes');
        done();
      });
  });

});
