const { expect, request } = require('chai');

const config = require('./mocks/config');
const Api = require('../src');

describe('Server check', () => {
  let r;
  let api;
  const { host, port } = config.server;
  const url = `http://${host}:${port}`;

  describe('No models', () => {
    before(async () => {
      api = new Api(config);
      await api.start();
    });

    after(() => api.destroy());

    it('Check connection', async () => {
      request(url);
      expect(true);
    });
  });

  describe('One model', () => {
    before(async () => {
      api = new Api({...config, token: undefined, server: { ...config.server, standalone: false }});
      await api.model('books', { name: 'string' });
      await api.start();
      r = () => request(url);
    });

    after(() => api.destroy());

    it('get model returns 200', async () => {
      const res = await r().get('/books');
      expect(res).to.have.status(200);
    });

    it('get model has body', async () => {
      const res = await r().get('/books');
      expect(res).to.have.property('body');
    });

    it('result is empty array', async () => {
      const res = await r().get('/books');
      expect(res.body).to.eql([]);
    });
  });

  describe('Two servers', () => {
    let r2;
    let api2;
    const config2 = JSON.parse(JSON.stringify(config));
    config2.server.standalone = false;
    const port2 = ++config2.server.port;
    const url2 = `http://${host}:${port2}`;

    before(async () => {
      api = new Api({...config, token: undefined, server: { ...config.server, standalone: false }});
      api2 = new Api({...config2, token: undefined});
      api.model('books', { name: 'string' });
      api2.model('movies', { name: 'string' });
      await api.start();
      await api2.start();
      r = () => request(url);
      r2 = () => request(url2);
    });

    after(() => {
      api.destroy();
      api2.destroy();
    });

    it('get first server model returns 200', async () => {
      const res = await r().get('/books');
      expect(res).to.have.status(200);
    });

    it('get second server model returns 200', async () => {
      const res = await r2().get('/movies');
      expect(res).to.have.status(200);
    });

    it('get first server wrong model returns 404', async () => {
      const res = await r().get('/movies');
      expect(res).to.have.status(404);
    });

    it('get second server wrong model returns 404', async () => {
      const res = await r2().get('/books');
      expect(res).to.have.status(404);
    });
  });
});
