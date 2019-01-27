const winston = require('winston');
const Express = require('express');
const Knex = require('knex');
const errors = require('./errors');
const Routes = require('./routes');
const Controllers = require('./controllers');
const Models = require('./models');
const Login = require('./routes/login');
const Base = require('./base');

class Api extends Base {
  constructor(config) {
    super(config);
    this.db = Knex(config.db);

    this.app = new Express();
    this.app.use(Express.json());
    this.app.use(Express.urlencoded({ extended: true }));

    this.models = new Models(this.db);
    this.routes = new Routes(this.app);

    new Login({config, app: this.app, models: this.models});
  }

  destroy() {
    this.stop();
    this.db.destroy();
  }

  async model(name, schema, opt) {
    if (!name) return;
    this.log.debug(`${opt} to-do...`);
    const c = new Controllers({ models: this.models, name });
    await Promise.all([
      this.routes.create(name, c),
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
    const { host, port } = this.config.server;
    return new Promise((resolve, reject) => {
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
