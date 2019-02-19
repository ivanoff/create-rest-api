const { expect, request } = require('chai');
const config = require('./mocks/config');
const Api = require('../src');

describe('Login', () => {
  const { host, port } = config.server;
  const url = `http://${host}:${port}`;
  let api;
  let r;
  let _token;
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
    r = () => request(url);
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
        _token = res.body.token;
      });

      it('post with X-Access-Token', async () => {
        const res = await r().post('/movies').set('X-Access-Token', _token).send(movies[0]);
        expect(res).to.have.status(201);
      });

      it('post with token in body', async () => {
        const res = await r().post('/movies').send({...movies[0], _token});

        expect(res).to.have.status(201);
      });

      it('get with X-Access-Token', async () => {
        const res = await r().get('/movies').set('X-Access-Token', _token);
        expect(res).to.have.status(200);
      });

      it('get with token in query', async () => {
        const res = await r().get('/movies').query({_token});
        expect(res).to.have.status(200);
      });
    });

    describe('Wrong owner and group token usage', () => {
      it('has token', async () => {
        const res = await r().post('/login').send(credentials);
        expect(res.body).to.have.property('token');
        _token = res.body.token;
      });

      it('post with wrong owner has 401 status', async () => {
        const res = await r().post('/my/WRONG/movies').set('X-Access-Token', _token).send(movies[0]);
        expect(res).to.have.status(401);
      });

      it('post with wrong group has 401 status', async () => {
        const res = await r().post('/our/WRONG/movies').set('X-Access-Token', _token).send(movies[0]);
        expect(res).to.have.status(401);
      });

      it('get with wrong owner 401 status', async () => {
        const res = await r().get('/my/WRONG/movies').set('X-Access-Token', _token);
        expect(res).to.have.status(401);
      });

      it('get by id with wrong owner has 401 status', async () => {
        const res = await r().get('/my/WRONG/movies/1').set('X-Access-Token', _token);
        expect(res).to.have.status(401);
      });

      it('get with bad token has 401 status', async () => {
        const res = await r().get('/our/WRONG/movies').set('X-Access-Token', _token);
        expect(res).to.have.status(401);
      });

      it('get by id with bad token has 401 status', async () => {
        const res = await r().get('/our/WRONG/movies/1').set('X-Access-Token', _token);
        expect(res).to.have.status(401);
      });
    });

    describe('Wrong Token usage', () => {
      it('has token', async () => {
        const res = await r().post('/login').send(credentials);
        expect(res.body).to.have.property('token');
        _token = res.body.token + 'WRONG';
      });

      it('post with expired token has 403 status', async () => {
        const res = await r().post('/movies').set('X-Access-Token', _token).send(movies[0]);
        expect(res).to.have.status(403);
      });

      it('get with bad token has 403 status', async () => {
        const res = await r().get('/movies').set('X-Access-Token', _token);
        expect(res).to.have.status(403);
      });

      it('get with bad token has name BAD_TOKEN', async () => {
        const res = await r().get('/movies').set('X-Access-Token', _token);
        expect(res.body.name).to.eql('BAD_TOKEN');
      });

    });

    describe('Expired Token usage', () => {

      before(async () => {
        await api.destroy();
        api = new Api({...config, token: { secret: 'TEST', expire: -1 }});
        await api.user(credentials);
        await api.model('movies', { name: 'string' });
        await api.start();
        r = () => request(url);
      });

      after(() => api.destroy());

      it('has token', async () => {
        const res = await r().post('/login').send(credentials);
        expect(res.body).to.have.property('token');
        _token = res.body.token;
      });

      it('post with expired token return 403', async () => {
        const res = await r().post('/movies').set('X-Access-Token', _token).send(movies[0]);
        expect(res).to.have.status(403);
      });

      it('get with expired token return 403', async () => {
        const res = await r().get('/movies').set('X-Access-Token', _token);
        expect(res).to.have.status(403);
      });

      it('get with bad token has name TOKEN_EXPIRED', async () => {
        const res = await r().get('/movies').set('X-Access-Token', _token);
        expect(res.body.name).to.eql('TOKEN_EXPIRED');
      });

    });

  });

});
