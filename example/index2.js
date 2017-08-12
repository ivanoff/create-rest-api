'use strict';

var config = require('./lib/config');

//var Api = require('create-rest-api');
var Api = require('../');
//var api = new Api(config, {validation: true});
const api = new Api({
  listen : {
    host : '127.0.0.1',
    port : 8877
  },
  db : {
    mongo : {
      url : '127.0.0.1',
      port : 27017,
      name : 'test'
    }
  },
}, {validation: true});

api.model('categories', {
  name: { type: 'string', required: true },
});

api.model('directors', {
  name: { type: 'string', required: true },
  birthday: { type: 'date' },
});

api.model('stars', {
  name: { type: 'string', required: true },
  birthday: { type: 'date' },
});

api.model('movies', {
  name: { type: 'string', required: true },
  year: { type: 'integer', required: true },
  director: { type: 'uuid', link: 'directors' },
  stars: { type: 'array', link: 'stars' },
  categories: { type: 'array', link: 'categories' },
});

api.start();
