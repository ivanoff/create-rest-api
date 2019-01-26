const Controllers = require('../controllers');
const LoginRouter = require('./login');

class Routes {

  constructor(base) {
    this.base = base;
    this.models = base.models;
    this.app = base.app;
    new LoginRouter(base);
  }

  async create(name, schema) {
    const c = new Controllers({ ...this.base, name });

    const path = `/${name}`;
    this.app.get(path, c.get.bind(c));
    this.app.post(path, c.post.bind(c));
    this.app.delete(path, c.delete.bind(c));

    const pathId = `${path}/:_id`;
    this.app.get(pathId, c.get.bind(c));
    this.app.put(pathId, c.replace.bind(c));
    this.app.patch(pathId, c.update.bind(c));
    this.app.delete(pathId, c.delete.bind(c));
  }

}

module.exports = Routes;
