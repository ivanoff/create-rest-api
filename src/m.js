const Knex = require('knex');

const configDefault = {
  db: {
    client: 'sqlite3',
    connection: ':memory:',
  },
}

class M {

  constructor({db = configDefault.db, name} = {}) {
    this.db = Knex(db)
    this.name = name;
  }

  async create(name, schema) {
console.log(name,'!!!!!!!!');
await this.db.schema.createTable(name, function (table) {
  table.increments();
  table.timestamps();
//Adds an integer column
  for(let key in schema) {
    console.log(key)
    let k = table[schema[key].type || schema[key]](key);
    if(schema[key].notNull) k.notNullable();
  }
})
console.log(await this.db.table(name).columnInfo());
  }

  async get(name) {
    return this.db(name).select('*')
  };

  async post(name, body) {
    return this.db(name).insert(body).returning('*')
  };

  async delete(name, body) {
    return this.db(name).where(body).delete()
  };

}

module.exports = M;
