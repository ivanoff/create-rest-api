const winston = require('winston');
const Express = require('express');
const Knex = require('knex');
const errors = require('./errors');
const Routes = require('./routes');
const Controllers = require('./controllers');
const Models = require('./models');

class Api {
  constructor(config) {
    this.error = errors;
    this.config = config;
    this.db = Knex(config.db);

    this.log = winston.createLogger({
      level: process.env.LOG_LEVEL,
      format: winston.format.json(),
      transports: [
        new winston.transports.File({ filename: './log/error.log', level: 'error' }),
        new winston.transports.File({ filename: './log/combined.log' }),
      ],
    });

    if (process.env.NODE_ENV !== 'production') {
      this.log.add(new winston.transports.Console({
        format: winston.format.simple(),
      }));
    }

    this.app = new Express();
    this.app.use(Express.json());
    this.app.use(Express.urlencoded({ extended: true }));

    this.models = new Models(this);
    this.routes = new Routes(this);
    this.controllers = new Controllers(this);
  }

  destroy() {
    this.stop();
    this.db.destroy();
  }

  async model(name, schema, opt) {
    if (!name) return;
    this.log.debug(`${opt} to-do...`);
    await Promise.all([
      this.routes.create(name, schema),
      this.models.create(name, schema),
    ]);
    this.log.info(`${name} model registered`);
  }

  async links() {
    this.log.debug('to-do...');
  }

  async freeAccess(name, schema) {
    this.log.debug('to-do...');
    //    if (!Array.isArray(schema)) schema = [schema];
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
