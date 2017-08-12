'use strict';
var app = require('./lib/server');

exports = module.exports = function (config, options) {
  if (!config) config = {};
  app.log.setupLog(config.log);

  app.use( function (req, res, next) {
    req._setOptions(options);
    req._setConfig(config);
    req._db = app._db;
    next();
  });

  require('./routes/login')(app);

  var info = require('./package.json');
  app.log.info('%s v.%s on %s', info.name, info.version, app.settings.env);

  app._config = config;
  app.start = start;
  return app;
};

function start(config) {
  var cfg = this._config;

  if (typeof cfg.listen === 'undefined') cfg.listen = {};
  var HOST = cfg.listen.host;
  var PORT = cfg.listen.port || 8877;

  // set up db parameters
  var cfgDb = (cfg.db && cfg.db.mongo)? cfg.db.mongo : {};
  var dbAuth = process.env.DB_AUTH ? process.env.DB_AUTH + '@'
    : cfgDb.login ? cfgDb.login + ':' + cfgDb.password + '@'
    : '';
  var dbPort = cfgDb.port || 27017;
  var dbName = cfgDb.name || 'test';
  var dbUrl = process.env.DB_URL || cfgDb.url || 'localhost';
  if(!dbUrl.match(/:/)) dbUrl += ':' + dbPort;
  if(!dbUrl.match(/\/\/.+\//)) dbUrl += '/' + dbName;
  dbUrl = 'mongodb://' + dbAuth + dbUrl;

  app._start(HOST, PORT, dbUrl);
}
