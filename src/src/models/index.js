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

  async delete(name, body) {
    return this.db(name).where(body).delete();
  }
}

module.exports = Models;
