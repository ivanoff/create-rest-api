const Knex = require('knex');
const winston = require('winston');
const jwt = require('jsonwebtoken');
const errors = require('./errors');
const Models = require('./models');
const controllers = require('./controllers');
const routes = require('./routes');

class Base {
  constructor(config) {
    this.config = config;
    this.error = errors;

    this.db = Knex(this.config.db);
    this.log = this.initLog();
    this.freeAccess = {};

    this.models = new Models(this.db);
    this.routes = routes;
    this.controllers = controllers(this.models);

    this.override = {
      get: (...args) => this._override('get', ...args),
      post: (...args) => this._override('post', ...args),
      patch: (...args) => this._override('patch', ...args),
      put: (...args) => this._override('put', ...args),
      delete: (...args) => this._override('delete', ...args),
    }
  }

  async destroy() {
    await this.db.destroy();
  }

  initLog() {
    const log = winston.createLogger({
      level: process.env.LOG_LEVEL,
      format: winston.format.json(),
      transports: [
        new winston.transports.File({ filename: './log/error.log', level: 'error' }),
        new winston.transports.File({ filename: './log/combined.log' }),
      ],
    });

    if (process.env.NODE_ENV !== 'production') {
      log.add(new winston.transports.Console({
        format: winston.format.simple(),
      }));
    }
    return log;
  }

  logHandler(id = 0) {
    return async (ctx, next) => {
      let _id = ++id;
      const { method, url, params, query, headers, body } = ctx;

      this.log.debug(`${_id} [IN] ${method}, ${url}`);
      this.log.debug(`${_id} [IN] ${JSON.stringify([
        { params, query, body }, { headers },
      ])}`);

      await next();

      this.log.debug(`${_id} [OUT] ${ctx.response}`);
    }
  }

  async errorHandler(ctx, next) {
    try {
      await next();
      if(ctx.response.message === 'Not Found') throw { METHOD_NOT_FOUND: `Cannot ${ctx.request.method} ${ctx.request.url}` } ;
    }
    catch (err) {
      let name = err.message || err;
      let stack;
      let developerMessage;

      // Proxied error -> Error from list
      if(ctx.error[name]) err = ctx.error[name];

      // One-key-object error -> entries to name and developerMessage
      const errKeys = Object.keys(err);
      if(errKeys.length === 1 && ctx.error[errKeys[0]]) {
        [ name, developerMessage ] = Object.entries(err)[0];
      }

      // Result is updated Error from list or Stack error or { error: string } object or error itselfs
      let e = ctx.error[name]? { ...ctx.error[name], name, developerMessage, stack }
        : err.stack ? { name: err.toString(), developerMessage: err.message, stack: err.stack }
        : typeof name === 'string' ? { error: name }
        : name;

      ctx.status = e.status || 520;
      ctx.body = e;
    }
  }

  security(openMethods, denyMethods = []){
    return async (ctx, next) => {

      let currentUser;
      const token = ctx.request.headers['x-access-token'] || ctx.request.query._token || ctx.request.body._token;
      const { secret } = ctx.config.token || {};

      if (token && secret) {
        delete ctx.request.query._token;
        delete ctx.request.body._token;

        try {
          currentUser = jwt.verify(token, secret);
        } catch (err) {
          throw err.name === 'TokenExpiredError'? { TOKEN_EXPIRED: err } : { BAD_TOKEN: err };
        }

        const { login, group } = ctx.params;
        if (login && login !== currentUser.login) throw { ACCESS_DENIED: 'Login owner error' };
        if (group && group !== currentUser.group) throw { ACCESS_DENIED: 'Group owner error' };
      }


  const methods = Array.isArray(openMethods) ? openMethods : [openMethods];
  const accessGranted = openMethods && ( methods.includes(ctx.method) || methods.includes('*') );

  const methodsDenied = Array.isArray(denyMethods) ? denyMethods : [denyMethods];
  const accessDenied = !accessGranted || methodsDenied.includes(ctx.method);

  if(accessDenied && !currentUser) throw 'ACCESS_DENIED';

  await next();
    }
  }

  // override defined methods
  _override (method, path, func) {
    for( let i = 0; i < this.router.stack.length; i++ ) {
      const s = this.router.stack[i];
      if( s.path === path && s.methods.includes(method.toUpperCase()) ) {
        s.stack[0] = func
      }
    }
  }

}

module.exports = Base;
