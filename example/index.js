'use strict';

var config = require('./lib/config');

//var Api = require('create-rest-api');
var Api = require('../');
var api = new Api(config, {validation: true});

api.registerModel('categories', {
  name: { type: 'string', required: true },
});

api.registerModel('directors', {
  name: { type: 'string', required: true },
  birthday: { type: 'date' },
});

api.registerModel('stars', {
  name: { type: 'string', required: true },
  birthday: { type: 'date' },
});

api.registerModel('movies', {
  name: { type: 'string', required: true },
  year: { type: 'integer', required: true },
  director: { type: 'uuid', link: 'directors' },
  stars: { type: 'array', link: 'stars' },
  categories: { type: 'array', link: 'categories' },
});

api.start();
