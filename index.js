'use strict';
var app = require('./lib/server');

exports = module.exports = function (options) {
  if (!options) options = {};
  app.log.setupLog(options.log);

  var info = require('./package.json');
  app.log.info('%s v.%s on %s', info.name, info.version, app.settings.env);

  return {
    _options: options,
    _app: app,
    registerModel: app.registerModel,
    start: start,
  };
};

function start() {
  var opt = this._options;

  if (typeof opt.listen === 'undefined') opt.listen = {};
  var HOST = opt.listen.host;
  var PORT = opt.listen.port || 8877;

  // set up db parameters
  var optDb = (opt.db && opt.db.mongo)? opt.db.mongo : {};
  var dbAuth = process.env.DB_AUTH ? process.env.DB_AUTH + '@'
    : optDb.login ? optDb.login + ':' + optDb.password + '@'
    : '';
  var dbUrl = process.env.DB_URL || optDb.url || 'localhost';
  dbUrl += ':' + (optDb.port || 27017);
  dbUrl += '/' + (optDb.name || 'default');
  dbUrl = 'mongodb://' + dbAuth + dbUrl;

  app._start(HOST, PORT, dbUrl);
}
