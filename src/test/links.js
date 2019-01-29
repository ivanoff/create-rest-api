const { expect, request } = require('chai');

const config = require('./mocks/config');
const Api = require('../src');

describe.skip('Linked models', () => {
  let api;
  let r;
  const movies = [
    { name: 'Hot Fuzz' },
    { name: 'Baby driver' },
  ];
  const directors = [
    { name: 'Edgar Wright' },
  ];
  const actors = [
    { name: 'Simon Pegg' },
    { name: 'Nick Frost' },
  ];

  before(async () => {
    api = new Api(config);
    api.model('directors', { name: 'string' }, { links: 'movies'});
    api.model('movies', { name: 'string' });
    api.model('actors', { name: 'string' }, { links: 'movies'});
    r = () => request(api.app);
  });

  after(() => api.destroy());

  describe('Add data', () => {
    it('add movies', async () => {
      await r().post('/movies').send(movies[0]);
      await r().post('/movies').send(movies[1]);
    });

    it('add director', async () => {
      await r().post('/movies/1/directors').send(directors[0]);
    });

    it('add actors', async () => {
      await r().post('/movies/1/actors').send(actors[0]);
      await r().post('/movies/1/actors').send(actors[1]);
    });
  });

});
