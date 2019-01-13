const Knex = require('knex');

const configDefault = {
  db: {
    client: 'sqlite3',
    connection: ':memory:',
  },
}

class C {

  constructor({db} = configDefault) {
    this.db = Knex(db)
  }

  async get(req, res, next) {
    res.json(await this.db(name).select('*'))
  };

  async post(req, res, next) {
    res.json(await this.db(name).insert(req.body).returning('*'))
  };

  async delete(req, res, next) {
    res.json(await this.db(name).where(req.body).delete())
  };

}

module.exports = C;
