const R = require('./r');

const configDefault = {
  server: {
    port: 8877,
  },
}


class Api {

  constructor() {
    this.r = new R();
  }

  start({server} = configDefault) {
    const {host, port} = server;
    this.r.app.listen(port, host, () => {
      console.log(`server started on ${host || '*'}:${port}`);
    });
  }

  async model(name, schema) {
    if (!name) return;
    await this.r.model(name);
/*
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
*/
console.log(await this.db.table(name).columnInfo());

  }

}

module.exports = Api;
