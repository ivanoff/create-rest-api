'use strict';

const Api = require('../');
const api = new Api();

api.model('comments');

api.verify();

api.model('stars');

api.model('movies', {
  stars: { link: 'stars' },
});

api.start();
