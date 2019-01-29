const LoginModel = require('./login');

class Models {
  constructor(db) {
    this.db = db;
    this.login = new LoginModel(this.db);
  }

  async create(name, schema) {
    await this.db.schema.createTable(name, (table) => {
      table.increments();
      table.timestamps();
      // look Adds an integer column at knexjs.org
      for (const key in schema) {
        const k = table[schema[key].type || schema[key]](key);
        // Update parameters
        if (schema[key].required) k.notNullable();
      }
    });
    // console.log(await this.db.table(name).columnInfo());
  }

  async get(name, where = []) {
    const res = this.db(name).select('*');
    for (const w of where) res.where(...w);
    return res;
  }

  async post(name, body) {
    return this.db(name).insert(body).returning('*');
  }

  async update(name, id, body) {
    return this.db(name).update(body).where({id});
  }

  async replace(name, id, body) {
    return this.db.transaction(async trx => {
      try {
        await this.db(name).transacting(trx).where({id}).delete();
        await this.db(name).transacting(trx).insert({...body, id});
        await trx.commit();
      } catch(err) {
        await trx.rollback(err);
      }
    })
  }

  async delete(name, id) {
    return this.db(name).where({id}).delete();
  }
}

module.exports = Models;
