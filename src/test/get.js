const { expect, request } = require('chai');

describe.skip('Get parameters', () => {
  let api;
  let r;
  const movies = [
    { name: "The World's End", rates: 7 },
    { name: 'Baby driver' },
    { name: 'Shaun of the Dead' },
    { name: 'Hot Fuzz', rates: 8 },
  ];

  before(async () => {
    api = new global.Api(global.configNoToken);
    await api.model('movies', { name: 'string', rates: 'integer' });
    await api.start();
    r = () => request(api.app.callback());
  });

  after(async () => await api.destroy());

  describe('Fill the data', () => {
    it('Add all movies and check the last one', async () => {
      for (let movie of movies) {
        await r().post('/movies').send(movie);
      }
      const res = await r().get('/movies');
      expect(res.body[movies.length - 1].name).to.eql(movies[movies.length - 1].name);
    });
  });

  describe('Search', () => {
    it('', async () => {
      const res = await r().get('/movies?name=Hot').query();
      expect(res.body[0].name).to.eql('Hot Fuzz');
    });
  });

  describe('Pagination', () => {
    it('', async () => {
      const res = await r().get('/movies?_limit=1').query();
      expect(res.body[0].name).to.eql('Hot Fuzz');
    });
  });

  describe('Filters', () => {
    it('', async () => {
      const res = await r().get('/movies?_fields=name').query();
      expect(res.body[0].name).to.eql('Hot Fuzz');
    });
  });

  describe('Sortings', () => {
    it('', async () => {
      const res = await r().get('/movies?_sort=name').query();
      expect(res.body[0].name).to.eql('Hot Fuzz');
    });
  });

  describe('All together', () => {
    it('', async () => {
      const res = await r().get('/movies?_sort=rates&_limit=1&_fields=name').query();
      expect(res.body[0].name).to.eql('Hot Fuzz');
    });
  });

});
