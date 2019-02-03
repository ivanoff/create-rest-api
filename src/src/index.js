const Express = require('express');

const Login = require('./routes/login');
const logsRoute = require('./routes/logs');

const Base = require('./base');

class Api extends Base {
  constructor(config) {
    super(config);
    this.links = [];

    this.app = new Express();
    this.app.use(Express.json());
    this.app.use(Express.urlencoded({ extended: true }));
    this.app.use(logsRoute(this.log));

    if(!config.token) {
      this.log.warn('No token provided. All models are available without token.');
    }
  }

  destroy() {
    this.stop();
    super.destroy();
  }

  async model(name, schema, opt = {}) {
    if (!name) throw new Error(this.error.NO_NAME);

    let { links, openMethods, denyMethods } = opt;
    if (links) this.links.push( {[name]: links} )
    if(!this.config.token) openMethods = '*';

    await Promise.all([
      this.routes(name, this.app, this.controllers, openMethods, denyMethods),
      this.models.create(name, schema, links),
    ]);
    this.log.info(`${name} model registered`);
  }

  async links() {
    this.log.debug('to-do...');
  }

  async openMethods(name, schema) {
    this.log.debug('to-do...');
    // if (!Array.isArray(schema)) schema = [schema];
    for (let i = 0; i < schema.length; i++) {
      this.models.openMethods(name, schema[i]);
    }
  }

  async recreate() {
    this.recreate = true;
  }

  async start() {

//console.log(JSON.stringify(this.models.linkedNames, null, '  '))

    if(this.config.token) {
      new Login({ config: this.config, app: this.app, models: this.models });
    }

    this.app.use((req, res, next) => {
      if (res.headersSent) return next();
      next(`Cannot ${req.method} ${req.path}`);
    });

    this.app.use((err, req, res, next) => {
//console.log(err)
      if (err.stack) {
        //        this.error
        //        this.log.error(req._id, err.stack);
        //        req._error.INTERNAL_SERVER_ERROR('Oops... Something Went Wrong! #' + req._id);
      } else {
        //        req._error.BAD_REQUEST(err);
      }

      next();
    });

    const { host, port, standalone } = this.config.server;
    return new Promise((resolve, reject) => {
      if (standalone) return resolve();
      this.server = this.app.listen(port, host, (err) => {
        if (err) return reject(err);
        this.log.info(`server started on ${host || '*'}:${port}`);
        return resolve();
      });
    });
  }

  stop() {
    this.log.info('closing...');
    if (this.server) this.server.close();
  }
}

module.exports = Api;
