const LoginModel = require('./login');

class Models {
  constructor(db) {
    this.db = db;
    this.schema = {};
    this.linkedNames = {};
    this.login = new LoginModel(this.db);
  }

  async create(name, schema, links) {
    this.schema[name] = schema;
    await this.db.schema.createTable(name, table => {
      table.increments('id');
      table.timestamps();
      // look Adds an integer column at knexjs.org
      for (const key in schema) {
        const k = table[schema[key].type || schema[key]](key);
        // Update parameters
        if (schema[key].required) k.notNullable();
      }
    });
    // console.log(await this.db.table(name).columnInfo());

    // create link table
    if(links) {
      for(let link of [].concat(links)) {
        const tableName = [name, link].sort().join('_');
        if(await this.db.schema.hasTable(tableName)) continue;
        await this.db.schema.createTable(tableName, table => {
          table.increments();
          table.integer(name);
          table.integer(link);
        })
        //console.log(`${tableName} link table created`);
      }
    }
  }

  async get(name, where = []) {
    return this.db(name).select('*').where(where);
  }

  async insert(name, body) {
    const r = await this.db(name).insert(body).returning('*');
    return typeof r[0] === 'number'? {id: r[0]} : r[0];
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
