const Knex = require('knex');

const configDefault = {
  db: {
    client: 'sqlite3',
    connection: ':memory:',
  },
}

const db = Knex(db)

module.exports = {
  create: async (name, schema) => {
console.log(name,'!!!!!!!!');
await db.schema.createTable(name, function (table) {
  table.increments();
  table.timestamps();
//Adds an integer column knexjs.org
  for(let key in schema) {
    console.log(key)
    let k = table[schema[key].type || schema[key]](key);
    if(schema[key].notNull) k.notNullable();
  }
})
console.log(await db.table(name).columnInfo());
  },

  get = async (name) => {
    return db(name).select('*')
  },

  post async (name, body) => {
    return db(name).insert(body).returning('*')
  },

  delete = async (name, body) => {
    return db(name).where(body).delete()
  },

}
