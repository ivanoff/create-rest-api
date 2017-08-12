'use strict';

const Api = require('../');
const api = new Api({
  token: {
    secret: '⟶Sǝcяeť✙',
    expire: 60 * 10,
  },
});

api.model('comments');

api.needToken();

api.model('stars'); // /my/login/stars : /our/group/stars : /stars

api.model('movies', { // /my/login/movies : /our/group/movies : /movies
  stars: { link: 'stars' },
});

api.start();
