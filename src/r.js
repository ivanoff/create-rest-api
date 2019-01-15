const C = require('./c');
const Express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

class R {

  constructor() {
    this.app = new Express();
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
  }

  async model(name) {
    if (!name) return;
    const c = new C({name});
    this.app.get('/' + name, c.get.bind(c));
    this.app.post('/' + name, c.post.bind(c));
    this.app.delete('/' + name, c.delete.bind(c));
    console.log('%s model registered', name);
  }

}

module.exports = R;
