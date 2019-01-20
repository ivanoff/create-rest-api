const C = require('./c');
const Express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

class R {

  constructor() {
    this.app = new Express();
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.c = new C();
  }

  async model(name, schema) {
    if (!name) return;
    this.app.get('/' + name, this.c.get.bind(this.c));
    this.app.post('/' + name, this.c.post.bind(this.c));
    this.app.delete('/' + name, this.c.delete.bind(this.c));
    console.log('%s model registered', name);
    await this.c.m.create(name, schema);
  }

}

module.exports = R;
