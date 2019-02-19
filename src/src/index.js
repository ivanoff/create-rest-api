const Koa = require('koa');
const Router = require('koa-router');
const koaBody = require('koa-body');

const LoginRoute = require('./routes/login');

const Base = require('./base');

class Api extends Base {

  constructor(config) {
    super(config);
    this.links = [];

    this.app = new Koa();
    this.router = new Router();

    this.app.context.config = this.config;
    this.app.context.error = this.error;

    this.app.use(this.errorHandler);
    this.app.use(koaBody());
    this.app.use(this.logHandler());

    if(this.config.token) {
      new LoginRoute(this);
    } else {
      this.log.warn('No token provided. All models are available without token.');
    }
  }

  destroy() {
    this.stop();
    super.destroy();
  }

  async start() {
    this.app.use(this.router.routes());

    const { host, port } = this.config.server;
    this.server = await this.app.listen(port, host);
    this.log.info(`server started on ${host || '*'}:${port}`);
  }

  stop() {
    this.log.info('closing...');
    if (this.server) this.server.close();
  }

  async model(name, schema, opt = {}) {
    if (!name) throw new Error( this.error.MODEL_HAS_NO_NAME );

    let { links, openMethods, denyMethods } = opt;
    if (links) this.links.push( {[name]: links} )
    if(!this.config.token) openMethods = '*';

    await Promise.all([
      this.routes(name, this.router, this.controllers, links, this.security(openMethods, denyMethods)),
      this.models.create(name, schema, links),
    ]);
    this.log.info(`${name} model registered`);
  }

  async user({login, password, md5} = {}) {
    if(!await this.models.db.schema.hasTable(this.models.login.name)) {
      await this.models.login.init();
    }
    await this.models.login.insert({login, password, md5})
  }

  async links() {
    this.log.debug('to-do...');
  }

  async openMethods(name, schema) {
    this.log.debug('to-do...');
    // if (!Array.isArray(schema)) schema = [schema];
    for (let i = 0; i < schema.length; i++) {
      this.models.openMethods(name, schema[i]);
    }
  }

  async recreate() {
    this.recreate = true;
  }

}

module.exports = Api;
