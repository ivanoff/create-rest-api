const R = require('./r');

const configDefault = {
  server: {
    port: 8877,
  },
}


class Api extends R {

  constructor() {
    super();
  }

  start({server} = configDefault) {
    const {host, port} = server;
    this.app.listen(port, host, () => {
      console.log(`server started on ${host || '*'}:${port}`);
    });
  }

}

module.exports = Api;
