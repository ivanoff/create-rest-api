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

  async model(name) {
    if (!name) return;
    this.app.get('/' + name, this.c.get);
    this.app.post('/' + name, this.c.post);
    this.app.delete('/' + name, this.c.delete);
    console.log('%s model registered', name);
  }

}

module.exports = R;
