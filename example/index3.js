'use strict';

var config = require('./lib/config');

//var Api = require('create-rest-api');
var Api = require('../');
var api = new Api(config);

//api.model('messages');

//api.verify({ login: 'users.login', password: 'users.password', default: {CRUD: 'root', R: /.*+/} });

api.model('users', {CRUD:'root'});

api.model('categories');
api.model('directors');
api.model('stars');

api.model('movies', {
  director: { link: 'directors' },
  stars: { link: 'stars' },
  categories: { link: 'categories' }
});

api.start();
