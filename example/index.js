'use strict';

const Api = require('../');
const api = new Api({
  token: {
    secret: 'S3cЯe`|`',
    expire: 60 * 10,
  },
});

api.model('comments');

api.verify();

api.model('stars');

api.model('movies', {
  stars: { link: 'stars' },
});

api.start();
