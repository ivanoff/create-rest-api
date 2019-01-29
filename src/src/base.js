const Knex = require('knex');
const winston = require('winston');
const errors = require('./errors');
const Models = require('./models');
const controllers = require('./controllers');
const routes = require('./routes');

class Base {
  constructor(config) {
    this.config = config;
    this.error = errors;

    this.db = Knex(this.config.db);
    this.log = this.initLog();

    this.models = new Models(this.db);
    this.routes = routes;
    this.controllers = controllers(this.models);
  }

  destroy() {
    this.db.destroy();
  }

  initLog() {
    const log = winston.createLogger({
      level: process.env.LOG_LEVEL,
      format: winston.format.json(),
      transports: [
        new winston.transports.File({ filename: './log/error.log', level: 'error' }),
        new winston.transports.File({ filename: './log/combined.log' }),
      ],
    });

    if (process.env.NODE_ENV !== 'production') {
      log.add(new winston.transports.Console({
        format: winston.format.simple(),
      }));
    }
    return log;
  }
}

module.exports = Base;
