const { expect, request } = require('chai');

const config = require('./mocks/config');
const Api = require('../src');

describe('Check errors', () => {
  let api;
  let r;

  before(async () => {
    const server = { ...config.server, standalone: true };
    const configStandalone = { ...config, server };
    api = new Api(configStandalone);
    await api.start();
    r = () => request(api.app);
  });

  after(() => api.destroy());

  it.skip('Empty name', async () => {
    api.model();
  });

  it('Empty name', async () => {
    const res = await r().get('/books');
    //console.log(res);
  });
});
