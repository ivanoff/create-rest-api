const { expect, request } = require('chai');

const config = require('./mocks/config');
const Api = require('../src');

describe('Login', () => {
  let api;
  let r;
  const credentials = { login: 'test1', password: 'test2' };

  before(async () => {
    api = new Api(config);
    await api.user(credentials);
    await api.model('movies', { name: 'string' });
    r = () => request(api.app);
  });

  after(() => api.destroy());

  describe('Check login access', () => {
    it('post login returns 200', async () => {
      const res = await r().post('/login').send(credentials);
      expect(res).to.have.status(200);
    });

  });

});
