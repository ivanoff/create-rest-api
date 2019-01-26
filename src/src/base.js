const models = require('./models');
const errors = require('./errors');

class Base {
  constructor(config) {
    this.error = errors;
    this.config = config;
    this.models = models.getModels();
    this.models.init(config.db);
  }
}

module.exports.create = config => new Base(config);
