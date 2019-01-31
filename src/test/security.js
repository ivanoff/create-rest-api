const { expect, request } = require('chai');

const config = require('./mocks/config');
const Api = require('../src');

describe('Security', () => {
  let api;
  let r;
  const movies = [
    { name: 'Hot Fuzz' },
  ];
  const comments = [
    { name: 'Edgar', comment: 'the best movie))' }
  ];

  before(async () => {
    api = new Api(config);
    api.model('movies', { name: 'string' });
    api.model('comments', { name: 'string', comment: 'integer' }, { freeAccess: ['GET', 'POST'] });
    r = () => request(api.app);
  });

  after(() => api.destroy());

  describe('Check tocken access', () => {
    it('get movies returns 401', async () => {
      const res = await r().get('/movies');
      expect(res).to.have.status(401);
    });

    it('post movies returns 401', async () => {
      const res = await r().post('/movies').send(movies[0]);
      expect(res).to.have.status(401);
    });

    it('patch movies returns 401', async () => {
      const res = await r().patch('/movies/1').send(movies[0]);
      expect(res).to.have.status(401);
    });

    it('put movies returns 401', async () => {
      const res = await r().put('/movies/1').send(movies[0]);
      expect(res).to.have.status(401);
    });

    it('delete movies returns 401', async () => {
      const res = await r().delete('/movies/1');
      expect(res).to.have.status(401);
    });
  })

  describe('Check free access', () => {
    it('get comments returns 200', async () => {
      const res = await r().get('/comments');
      expect(res).to.have.status(200);
    });

    it('post comments returns 201', async () => {
      const res = await r().post('/comments').send(comments[0]);
      expect(res).to.have.status(201);
    });

    it('patch comments returns 401', async () => {
      const res = await r().patch('/comments/1').send(comments[0]);
      expect(res).to.have.status(401);
    });

    it('put comments returns 401', async () => {
      const res = await r().put('/comments/1').send(comments[0]);
      expect(res).to.have.status(401);
    });

    it('delete comments returns 401', async () => {
      const res = await r().delete('/comments/1');
      expect(res).to.have.status(401);
    });
  });

});
