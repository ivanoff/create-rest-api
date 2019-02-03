const { expect, request } = require('chai');

const config = require('./mocks/config');
const Api = require('../src');

describe.only('Linked models', () => {
  let api;
  let r;
  const movies = [
    { id: 1, name: 'Baby driver' },
    { id: 2, name: 'Hot Fuzz', genres: [{name: 'Action'}, {}, {name: 'Comedy'}] },
  ];
  const genres = [
    { id: 1, name: 'Action', movies: 1 },
    { id: 2, name: 'Comedy' },
    { id: 3, name: 'Crime', movies: 1 },
  ];
  const actors = [
    { name: 'Simon Pegg' },
  ];
  const directors = [
    { name: 'Edgar Wright', movies: [1, 2] },
  ];

  before(async () => {
    api = new Api({...config, token: undefined, server: {standalone: true}});
    const name = 'string';
    await api.model('movies', { name }, { links: [ 'genres', 'directors' ]});
    await api.model('genres', { name });
    await api.model('actors', { name }, { links: 'movies'});
    await api.model('directors', { name }, { links: 'movies'});
    await api.start();
    r = () => request(api.app);
  });

  after(() => api.destroy());

  describe('Add data', () => {
    it('add movies', async () => {
      await r().post('/movies').send(movies[0]);
      const res = await r().post('/movies').send(movies[1]);
      expect(res).to.have.status(201);
    });

    it('add first genres', async () => {
      const res = await r().post('/genres').send(genres[0]);
      expect(res).to.have.status(201);
    });

    it('add genres', async () => {
      await r().post('/genres').send(genres[1]);
      await r().post('/genres').send(genres[2]);
    });

    it('add actor', async () => {
      const res = await r().post('/movies/2/actors').send(actors[0]);
      expect(res).to.have.status(201);
    });

    it('add director', async () => {
      const res = await r().post('/directors').send(directors[0]);
      expect(res).to.have.status(201);
    });

  });

});
