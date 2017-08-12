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
      group: doc.group,
      name: doc.name,
    }

    var token = jwt.sign(data, secret, {expiresIn: req._config.token.expire || 60});;

/*
    var token = token.getToken(req, doc);
  var refreshToken = uuid.v4();
  if(!req.currentUser) req.currentUser = {_id: doc._id};

  LoginModel.updateOne( req, {_id: doc._id}, { _refreshToken: refreshToken } );

  var data = {
    _id: doc._id,
    _refreshToken: refreshToken,
    type: doc.type,
    companyId: doc.companyId,
    name: doc.name,
  }

  return jwt.sign(data, config.token.secret, {expiresIn: config.token.expire});
*/

    LoginModel.updateOne( req, {_id: doc._id}, { _refreshToken: refreshToken } );

    res.json({
      token: token,
      group: doc.group,
      name: doc.name,
      _links:{
        self:{href: '/token'},
      }
    })
  });

};
