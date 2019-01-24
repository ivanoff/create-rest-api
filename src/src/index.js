const express = require('express');
const Routes = require('./routes');
const models = require('./models').getModels();

class Api {

  constructor(config) {
    this.config = config;

    this.app = new express();
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.routes = new Routes(this.app);
  }

  async model(name, schema, opt) {
    if (!name) return;
    await Promise.all([
      this.routes.create(name, schema),
      models.create(name, schema),
    ]);
    console.log(`${name} model registered`);
  }

  async models(...names) {
    for(let name of names) {
      await this.model(name);
    }
  }

  async links() {
  }

  async freeAccess(name, schema) {
    if(!Array.isArray(schema)) schema = [schema];
    for(let schemaName of schema) {
      models.freeAccess(name, schemaName);
    }
  }

  async recreate() {
    this.recreate = true;
  }

  start() {
    const {host, port} = this.config.server;
    this.app.listen(port, host, () => {
      console.log(`server started on ${host || '*'}:${port}`);
    });
  }

}

module.exports = Api;
