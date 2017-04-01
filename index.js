'use strict';
var moment = require('moment-timezone');

require('./lib/array');
var Error = require('./lib/error');

var app = require('./lib/server');
app._db = require('./lib/db/mongo');

exports = module.exports = function (options) {
  if (!options) options = {};
  app.log.setupLog(options.log);

  var info = require('./package.json');
  app.log.info('%s v.%s on %s', info.name, info.version, app.settings.env);

  return {
    _options: options,
    _db: app.db,
    _app: app,
    models: {},
    controllers: {},
    routes: {},
    registerModel: app.registerModel,
    start: start,
  };
};

function start() {
  var _this = this;
  var opt = this._options;

  if (typeof opt.listen === 'undefined') opt.listen = {};
  var HOST = opt.listen.host;
  var PORT = opt.listen.port || 8877;

  // set up db parameters
  var optDb = opt.db.mongo;
  var dbAuth = process.env.DB_AUTH ? process.env.DB_AUTH + '@'
    : optDb.login ? optDb.login + ':' + optDb.password + '@'
    : '';
  var dbUrl = optDb.url;
  if (optDb.port) dbUrl += ':' + optDb.port;
  if (optDb.name) dbUrl += '/' + optDb.name;
  dbUrl = 'mongodb://' + dbAuth + dbUrl;

  app._after();

  // Connect to DB and start server
  app._db.connect(dbUrl, function (err) {
    if (typeof err !== 'undefined') {
      app.log.error('server start failed. datbase connection error: %s', err);
    } else {
      app.log.info('datbase connected');
      _this.server = app.listen(PORT, HOST, function () {
        app.log.info('server started on %s:%d', HOST || '*', PORT);
      });
    }
  });
}

