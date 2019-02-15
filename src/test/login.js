const { expect, request } = require('chai');

const config = require('./mocks/config');
const Api = require('../src');

describe('Login', () => {
  let api;
  let r;
  let token;
  let refresh;
  const movies = [
    { name: "Last Night In Soho" },
    { name: "Shadows" },
  ];

  const credentials = { login: 'test1', password: 'test2' };

  before(async () => {
    api = new Api(config);
    await api.user(credentials);
    await api.model('movies', { name: 'string' });
    await api.start();
    r = () => request(api.app);
  });

  after(() => api.destroy());

  describe('Check login access', () => {

    describe('Post login', () => {
      it('returns 200 status code', async () => {
        const res = await r().post('/login').send(credentials);
        expect(res).to.have.status(200);
      });

      it('has body', async () => {
        const res = await r().post('/login').send(credentials);
        expect(res).to.have.property('body');
      });

      it('returns login', async () => {
        const res = await r().post('/login').send(credentials);
      });

      it('login i equal to credentials', async () => {
        const res = await r().post('/login').send(credentials);
        expect(res.body.login).to.eql(credentials.login);
      });

      it('returns refresh token', async () => {
        const res = await r().post('/login').send(credentials);
        expect(res.body).to.have.property('refresh');
        refresh = res.body.refresh;
      });

    });

    describe('Post login with refresh token only', () => {
      it('next returns not the same refresh token as previous one', async () => {
        const res = await r().post('/login').send(credentials);
        expect(res.body.refresh).is.not.eql(refresh);
        refresh = res.body.refresh;
      });

      it('returns 200', async () => {
        const res = await r().post('/login').send({refresh});
        expect(res).to.have.status(200);
        refresh = res.body.refresh;
      });

      it('has body', async () => {
        const res = await r().post('/login').send({refresh});
        expect(res).to.have.property('body');
        refresh = res.body.refresh;
      });

      it('returns login', async () => {
        const res = await r().post('/login').send({refresh});
        expect(res.body).to.have.property('login');
        refresh = res.body.refresh;
      });

      it('returns token', async () => {
        const res = await r().post('/login').send({refresh});
        expect(res.body).to.have.property('token');
        refresh = res.body.refresh;
      });

      it('returns refresh token', async () => {
        const res = await r().post('/login').send({refresh});
        expect(res.body).to.have.property('refresh');
        refresh = res.body.refresh;
      });

      it('next returns not the same refresh token as previous one', async () => {
        const res = await r().post('/login').send({refresh});
        expect(res.body.refresh).is.not.eql(refresh);
      });

      it('old refresh dont work, 404 not found', async () => {
        const res = await r().post('/login').send({refresh});
        expect(res).to.have.status(404);
      });
    });

    describe('Token usage', () => {
      it('has token', async () => {
        const res = await r().post('/login').send(credentials);
        expect(res.body).to.have.property('token');
        token = res.body.token;
      });

      it('post with token', async () => {
        const res = await r().post('/movies').set('X-Access-Token', token).send(movies[0]);
        expect(res).to.have.status(201);
      });
    });

  });

});
