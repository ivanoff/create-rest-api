const Knex = require('knex');
const M = require('./m');

class C {

  constructor({name}) {
    this.m = new M();
    this.name = name;
  }

  async get(req, res, next) {
    res.json(await this.m.get(this.name))
  };

  async post(req, res, next) {
    res.json(await this.m.post(this.name, req.body))
  };

  async delete(req, res, next) {
    res.json(await this.m.delete(this.name, req.body))
  };

}

module.exports = C;
