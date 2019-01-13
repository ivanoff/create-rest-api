const Knex = require('knex');
const Express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const configDefault = {
  server: {
    port: 8877,
  },
  db: {
    client: 'sqlite3',
    connection: ':memory:',
  },
}

class Api {

  constructor({db} = configDefault) {
    this.db = Knex(db)
    this.app = new Express();

    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
  }

  start({server} = configDefault) {
    const {host, port} = server;
    this.app.listen(port, host, () => {
      console.log(`server started on ${host || '*'}:${port}`);
    });
  }

  async model(name, schema) {
    if (!name) return;

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

    this.app.get('/' + name, async (req, res, next) => {res.json(await this.db(name).select('*'))});
    this.app.post('/' + name, async (req, res, next) => {res.json(await this.db(name).insert(req.body).returning('*'))});
    this.app.delete('/' + name, async (req, res, next) => {res.json(await this.db(name).where(req.body).delete())});

    console.log('%s model registered', name);
  }

}

module.exports = Api;
