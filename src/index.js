const R = require('./r');
const M = require('./m');

const configDefault = {
  server: {
    port: 8877,
  },
}


class Api {

  constructor() {
    this.r = new R();
    this.m = new M();
  }

  start({server} = configDefault) {
    const {host, port} = server;
    this.r.app.listen(port, host, () => {
      console.log(`server started on ${host || '*'}:${port}`);
    });
  }

  async model(name, schema) {
    if (!name) return;
    await this.r.model(name);
    await this.m.create(name, schema);
  }

}

module.exports = Api;
