'use strict';

var config = require('./lib/config');

var Api = require('create-rest-api');
var api = new Api(config);

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
// /directors/22/movies => /directors/22/movies/123 => ...
// /stars/33/movies => /stars/33/movies/123 => ...
// /categories/44/movies => /categories/44/movies/123 => ...
// /movies/123/directors => /movies/123/directors/22
// /movies/123/stars => /movies/123/stars/33
// /movies/123/categories => /movies/123/categories/44
api.start();

