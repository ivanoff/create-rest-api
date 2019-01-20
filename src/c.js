const Knex = require('knex');
const m = require('./m');

class C {

  constructor({name}) {
    this.name = name;
  }

  async get(req, res, next) {
    res.json(await m.get(this.name))
  };

  async post(req, res, next) {
    res.json(await m.post(this.name, req.body))
  };

  async delete(req, res, next) {
    res.json(await m.delete(this.name, req.body))
  };

}

module.exports = C;
