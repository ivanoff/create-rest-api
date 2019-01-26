const { expect, request } = require('chai');

const config = require('./mocks/config');
const Api = require('../src');

describe('API server', () => {
  let api;
  let r;

  before(async () => {
    api = new Api(config);
    api.model('books', { name: 'string' });
    r = request(api.app);
  })

  after(() => api.destroy())

  it('Check connection', async () => {
    request(api);
    expect(true);
  });

  it('get books returns 200', async () => {
    let res = await r.get('/books');
    expect(res).to.have.status(200);
  });

});
