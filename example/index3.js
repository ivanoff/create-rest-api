'use strict';

var config = require('./lib/config');

//var Api = require('create-rest-api');
var Api = require('../');
var api = new Api(config);

//api.registerModel('messages');

//api.verify({ login: 'users.login', password: 'users.password', default: {CRUD: 'root', R: /.*+/} });

api.registerModel('users', {CRUD:'root'});

api.registerModel('categories');
api.registerModel('directors');
api.registerModel('stars');

api.registerModel('movies', {
  director: { link: 'directors' },
  stars: { link: 'stars' },
  categories: { link: 'categories' }
});

api.start();
