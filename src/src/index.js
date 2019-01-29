const Express = require('express');

const Login = require('./routes/login');

const Base = require('./base');

class Api extends Base {
  constructor(config) {
    super(config);

    this.app = new Express();
    this.app.use(Express.json());
    this.app.use(Express.urlencoded({ extended: true }));

    new Login({ config, app: this.app, models: this.models });

    // Show incoming information
    let id = 0;
    this.app.use((req, res, next) => {
      req._id = ++id;
      this.log.debug(`${req._id} [IN] ${req.method}, ${req.url}`);
      this.log.debug(`${req._id} [IN] ${JSON.stringify([
        { params: req.params, query: req.query, body: req.body },
        { headers: req.headers },
      ])}`);
      next();
    });

    // Show outgoing information by overriding send method
    this.app.use((req, res, next) => {
      const _send = res.send;
      res.send = (body) => {
        this.log.debug(`${req._id} [OUT] ${body}`);
        _send.call(res, body);
      };

      next();
    });
  }

  destroy() {
    this.stop();
    super.destroy();
  }

  async model(name, schema, opt) {
    if (!name) throw new Error(this.error.NO_NAME);

    this.log.debug(`${opt} to-do...`);
    await Promise.all([
      this.routes(name, this.app, this.controllers),
      this.models.create(name, schema),
    ]);
    this.log.info(`${name} model registered`);
  }

  async links() {
    this.log.debug('to-do...');
  }

  async freeAccess(name, schema) {
    this.log.debug('to-do...');
    // if (!Array.isArray(schema)) schema = [schema];
    for (let i = 0; i < schema.length; i++) {
      this.models.freeAccess(name, schema[i]);
    }
  }

  async recreate() {
    this.recreate = true;
  }

  async start() {
    this.app.use((req, res, next) => {
      if (res.headersSent) return next();
      next(`Cannot ${req.method} ${req.path}`);
    });

    this.app.use((err, req, res, next) => {
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
