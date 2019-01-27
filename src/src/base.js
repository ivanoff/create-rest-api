const winston = require('winston');
const errors = require('./errors');

class Base {
  constructor(config) {
    this.error = errors;
    this.config = config;

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
  }
}

module.exports = Base;
