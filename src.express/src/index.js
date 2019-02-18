const Express = require('express');
const jwt = require('jsonwebtoken');

const LoginRoute = require('./routes/login');
const logsRoute = require('./routes/logs');

const Base = require('./base');

class Api extends Base {

  constructor(config) {
    super(config);
    this.links = [];

    this.app = new Express();

    this.app.use(Express.json());
    this.app.use(Express.urlencoded({ extended: true }));
    this.app.use(logsRoute(this.log));

    this.wrapAsync = fn => (req, res, next) => fn(req, res, next).catch(next);

    this.app.use((req, res, next) => {
      const token = req.headers['x-access-token'] || req.body._token || req.query._token;
      const { secret } = this.config.token || {};

      if (token && secret) {
        delete req.body._token;
        delete req.query._token;

        try {
          req._currentUser = jwt.verify(token, secret);
        } catch (err) {
          return next(err.name === 'TokenExpiredError'? { TOKEN_EXPIRED: err } : { BAD_TOKEN: err });
        }

        const { login, group } = req.params;
        if (login && login !== req._currentUser.login)
          return next({ ACCESS_DENIED: 'Login owner error' });
        if (group && group !== req._currentUser.group)
          return next({ ACCESS_DENIED: 'Group owner error' });
      }

      next();
    });

    this.override = {
      get: (...args) => this._override('get', ...args),
      post: (...args) => this._override('post', ...args),
      patch: (...args) => this._override('patch', ...args),
      put: (...args) => this._override('put', ...args),
      delete: (...args) => this._override('delete', ...args),
    }

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

  async user({login, password, md5} = {}) {
    if(!await this.models.db.schema.hasTable(this.models.login.name)) {
      await this.models.login.init();
    }
    await this.models.login.insert({login, password, md5})
  }

  async model(name, schema, opt = {}) {
    if (!name) throw new Error( this.error.MODEL_HAS_NO_NAME );

    let { links, openMethods, denyMethods } = opt;
    if (links) this.links.push( {[name]: links} )
    if(!this.config.token) openMethods = '*';

    await Promise.all([
      this.routes(name, this.app, this.controllers, openMethods, denyMethods, links, this.wrapAsync),
      this.models.create(name, schema, links),
    ]);
    this.log.info(`${name} model registered`);
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

  async start() {

//console.log(JSON.stringify(this.models.delayedData, null, '  '))

    this.app.use((req, res, next) => next( !res.headersSent && { METHOD_NOT_FOUND: `Cannot ${req.method} ${req.path}` } ));

    // Error handler
    this.app.use((err, req, res, next) => {

//console.log('=======================================')
//console.log(req)

      let name = err.message || err;
      let stack;
      let developerMessage;

      // Proxied error -> Error from list
      if(this.error[name]) err = this.error[name];

      // One-key-object error -> entries to name and developerMessage
      const errKeys = Object.keys(err);
      if(errKeys.length === 1 && this.error[errKeys[0]]) {
        [ name, developerMessage ] = Object.entries(err)[0];
      }

      // Result is updated Error from list or Stack error or { error: string } object or error itselfs
      let e = this.error[name]? { ...this.error[name], name, developerMessage, stack }
        : err.stack ? { name: err.toString(), developerMessage: err.message, stack: err.stack }
        : typeof name === 'string' ? { error: name }
        : name;

      res.status(e.status || 520);
      res.json(e);

      next();
    });

    const { host, port, standalone } = this.config.server;
    return new Promise((resolve, reject) => {
      if (standalone) return resolve();
      this.server = this.app.listen(port, host, (err) => {
        if (err) return reject(err);
        this.log.info(`server started on ${host || '*'}:${port}`);
        return resolve();
      });
    });
  }

  stop() {
    this.log.info('closing...');
    if (this.server) this.server.close();
  }

  // override defined methods
  _override (method, path, func) {
    for( let i = 0; i < this.app._router.stack.length; i++ ) {
      const s = this.app._router.stack[i];
      if( s.route && s.route.path === path && s.route.methods[method] ) {
        s.route.stack[0].handle = func
      }
    }
  }

}

module.exports = Api;
