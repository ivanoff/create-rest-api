"use strict"
var uuid = require('uuid');
var md5 = require('md5');
var jwt = require('jsonwebtoken');
//var token = require('../lib/token');
var LoginModel = require('../models/login');

exports.login = function(req, res, next) {
  var secret = req._config && req._config.token? req._config.token.secret : undefined;
  if(!secret) return req._error.NO_TOKEN_SECRET();

  if (!req.body.login && !req.body.password) return req._error.USER_NOT_FOUND();
  req.body.password = md5( req.body.password );

  LoginModel.search(req, req.body, function(err, doc){
    if(err) return req._error.show(err);
    if(!doc) return req._error.USER_NOT_FOUND();

    var refreshToken = uuid.v4();

    var data = {
      _id: doc._id,
      _refreshToken: refreshToken,
      login: doc.login,
      group: doc.group,
      name: doc.name,
    }

    var token = jwt.sign(data, secret, {expiresIn: req._config.token.expire || 60});

    LoginModel.update( req, {_id: doc._id}, { _refreshToken: refreshToken } );

    res.json({
      token: token,
      login: doc.login,
      group: doc.group,
      name: doc.name,
      _links:{
        self:{href: '/token'},
      }
    })
  });
};

exports.update = function(req, res, next) {
  var secret = req._config && req._config.token? req._config.token.secret : undefined;
  if(!secret) return req._error.NO_TOKEN_SECRET();

  var token = req.headers['x-access-token'] || req.body.token || req.params.token;
  if(!token) return req._error.NO_TOKEN();

  var decoded = jwt.decode(token, secret);

  LoginModel.search(req, {refreshToken: decoded._refreshToken}, function(err, doc){
    if(err) return req._error.show(err);
    if(!doc) return req._error.USER_NOT_FOUND();

    var refreshToken = uuid.v4();

    var data = {
      _id: doc._id,
      _refreshToken: refreshToken,
      login: doc.login,
      group: doc.group,
      name: doc.name,
    }

    var token = jwt.sign(data, secret, {expiresIn: req._config.token.expire || 60});

    LoginModel.update( req, { _id: doc._id }, { _refreshToken: refreshToken } );

    res.json({
      token: token,
      login: doc.login,
      group: doc.group,
      name: doc.name,
      _links:{
        self:{href: '/token'},
      }
    })
  });
};

exports.info = function(req, res, next) {
  var token = req.headers['x-access-token'] || req.body.token || req.params.token;
  if(!token) return req._error.NO_TOKEN();

  var decoded = jwt.decode(token, req._config.token.secret);
  res.json(decoded);
};
