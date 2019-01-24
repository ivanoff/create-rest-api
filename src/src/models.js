const Knex = require('knex');
const config = require('../config');

class Models {

  constructor({db} = config) {
    this.db = Knex(db)
  }

  async create (name, schema) {
    await this.db.schema.createTable(name, (table) => {
      table.increments();
      table.timestamps();
      //look Adds an integer column at knexjs.org
      for(let key in schema) {
        let k = table[schema[key].type || schema[key]](key);
        // Update parameters
        if(schema[key].required) k.notNullable();
      }
    })
    //console.log(await this.db.table(name).columnInfo());
  }

  async get(name, where = []) {
    let res = this.db(name).select('*');
    for(let w of where) res.where(...w);
    return res;
  }

  async post(name, body) {
    return this.db(name).insert(body).returning('*')
  }

  async delete(name, body) {
    return this.db(name).where(body).delete()
  }

}

let models = new Models;

module.exports = {
  getModels: () => models
}
