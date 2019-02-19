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

    describe('Wrong owner and group token usage', () => {
      it('has token', async () => {
        const res = await r().post('/login').send(credentials);
        expect(res.body).to.have.property('token');
        _token = res.body.token;
      });

      it('get with bad token has 403 status', async () => {
        const res = await r().get('/my/WRONG/movies');
        expect(res).to.have.status(401);
      });

      it('post with wrong owner has 403 status', async () => {
        const res = await r().post('/my/WRONG/movies').set('X-Access-Token', _token).send(movies[0]);
//console.log(res)
        expect(res).to.have.status(401);
      });

      it('get with bad token has 403 status', async () => {
        const res = await r().get('/my/WRONG/movies').set('X-Access-Token', _token);
        expect(res).to.have.status(401);
      });

    });


});
