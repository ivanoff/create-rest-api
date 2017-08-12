'use strict';
var Express = require('express');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');

var app = new Express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require('./array');
var Error = require('./error');
var db = require('./db/mongo');

var log = require('./logger');
app.log = log;

app._db = db;
app.protected = {};
app.models = {};
app.controllers = {};
app.routes = {};
app.relations = {};

var DefaultModel = require('../models/default');
var DefaultController = require('../controllers/default');
var DefaultRoutes = require('../routes/default');

// Show incoming information
app.use(function (req, res, next) {
  req._config = {};
  req._setConfig = (cfg) => { req._config = cfg || {}; };
  req._options = {};
  req._setOptions = (opt) => { req._options = opt || {}; };
  req._id = log.makeId();
  log.debug(req._id, '[IN]', req.method, req.url);
  log.debug(req._id, '[IN]', [
    { params: req.params, query: req.query, body: req.body },
    { headers: req.headers },
  ].prettyJSON().join(', '));

  req._log = log;
  req._relations = app.relations;
  req._error = new Error(req, res, log);
  next();
});

// Show outgoing information
app.use(function (req, res, next) {
  var _send = res.send;
  res.send = function (body) {
    log.debug(req._id, '[OUT]', body);
    _send.call(this, body);
  };

  next();
});

var _this = this;

// For api controller
app.use(function (req, res, next) {
  req.models = app.models;
  next();
});

// API documentations
require('../routes/api')(app, this.models);

app._start = function (HOST, PORT, dbUrl) {

  // Last route - Cannot GET path
  app.use(function (req, res, next) {
    if (res.headersSent) return next();
    next('Cannot ' + req.method + ' ' + req.path);
  });

  // Error handle
  app.use(function (err, req, res, next) {
    if (err.stack) {
      log.error(req._id, err.stack);
      req._error.INTERNAL_SERVER_ERROR('Oops... Something Went Wrong! #' + req._id);
    } else {
      req._error.BAD_REQUEST(err);
    }

    next();
  });

  // Connect to DB and start server
  app._db.connect(dbUrl, function (err) {
    if (typeof err !== 'undefined') {
      app.log.error('server start failed. datbase connection on %s error: %s. Try to add DB_URL and/or DB_AUTH globals or update config file.', dbUrl, err);
    } else {
      app.log.info('datbase connected on %s', dbUrl);
      app.listen(PORT, HOST, function () {
        app.log.info('server started on %s:%d', HOST || '*', PORT);
      });
    }
  });

};

app.model = function (name, model) {
console.log(app._verify);
  app.protected[name] = app._verify;
  app.models[name] = new DefaultModel(name, model, app._db);
  app.controllers[name] = new DefaultController(name, app.models[name]);
  app.routes[name] = new DefaultRoutes(name, app.controllers[name], app);

  log.debug('%s model registered', name);

  function addRelations(name, field, l, id, type1, type2) {
    if (!name || !l) return;
    if (!app.controllers[l]) {
      log.error('%s.%s => %s.%s relation failed: model %s not found', name, field, l, id, l);
      return;
    }

    log.debug('%s.%s => %s.%s relation added', name, field, l, id);
    var extendedName = name + '/:' + name + 'Id/' + l;
    app.routes[extendedName] = new DefaultRoutes(extendedName, app.controllers[l], app);
    app.relations[extendedName] = {
      name: name + 'Id',
      table1: name,
      field1: field,
      table2: l,
      field2: id,
      type1: type1,
      type2: type2,
    };
  };

  if(model) {
    Object.keys(model).forEach(function (field) {
      if(model[field].hasOwnProperty('link')) {
        addRelations(name, field, model[field].link, '_id', model[field].type);
        addRelations(model[field].link, '_id', name, field, null, model[field].type);
      }
    });
  }
};

app.registerModel = function (name, model) {
  console.warn('registerModel is depricated. Use model instead.');
  return app.model(name, model);
}

app.verify = function (options) {
  if(!options) options = {};
  if(!options.login) options.login = 'users.login';
  if(!options.password) options.password = 'users.password';

  app._verify = options;
}

app.checkAccess = function (req, res, next) {
  var token = req.headers['x-access-token'] || req.body.token || req.params.token;
  if(!token) return req._error.NO_TOKEN();

  var secret = req._config && req._config.token? req._config.token.secret : undefined;
  if(!secret) return req._error.NO_TOKEN_SECRET();

  jwt.verify(token, secret, function(err, decoded) {
    if(err) return req._error.BAD_TOKEN(err);
    req.currentUser = decoded;
    next();
  });
}

module.exports = app;
