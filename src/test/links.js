const { expect, request } = require('chai');

const config = require('./mocks/config');
const Api = require('../src');

describe.only('Linked models', () => {
  let api;
  let r;
  const movies = [
    { id: 1, name: 'Hot Fuzz' },
    { id: 2, name: 'Baby driver', genres: [{name: 'Action'}, {name:'Crime'}] },
  ];
  const genres = [
    { id: 1, name: 'Comedy', movies: 1 },
    { id: 2, name: 'Action' },
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
console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
      await r().post('/movies').send(movies[0]);
      const res = await r().post('/movies').send(movies[1]);
      expect(res).to.have.status(201);
    });

    it('add actor', async () => {
      const res = await r().post('/movies/1/actors').send(actors[0]);
      expect(res).to.have.status(201);
    });

    it('add director', async () => {
      const res = await r().post('/directors').send(directors[0]);
      expect(res).to.have.status(201);
    });

    it('add genres', async () => {
      await r().post('/genres').send(genres[0]);
      const res = await r().post('/genres').send(genres[1]);
      expect(res).to.have.status(201);
    });
  });

});
