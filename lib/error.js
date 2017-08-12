/**
 * Errors lib
 **/
'use strict';

exports = module.exports = function (req, res, log) {
  var exp = {};

  exp.show = function (error) {
    var e = error || 'UNKNOWN_ERROR';
    if (typeof e !== 'object') e = { error: e };
    log.error(req._id, '[ERROR]', e);
    res.status(e.status || 400);
    res.json(e);
  };

  exp.NOT_FOUND = function (name, additional) {
    this.show({
      status: 404,
      name: 'NOT_FOUND',
      message: name ? name + ' not found' : '',
      developerMessage: additional || '',
    });
  };

  exp.USER_NOT_FOUND = function (additional) {
    this.show({
      status: 404,
      name: 'USER_NOT_FOUND',
      message: 'User not found',
      developerMessage: additional,
    });
  };

  exp.DATA_VALIDATION_ERROR = function (additional) {
    this.show({
      status: 400,
      name: 'DATA_VALIDATION_ERROR',
      message: additional ? additional.text : '',
      developerMessage: additional,
    });
  };

  exp.BAD_REQUEST = function (additional) {
    this.show({
      status: 400,
      name: 'BAD_REQUEST',
      message: 'Bad request',
      developerMessage: additional,
    });
  };

  exp.INTERNAL_SERVER_ERROR = function (additional) {
    this.show({
      status: 500,
      name: 'INTERNAL_SERVER_ERROR',
      message: 'Internal Server Error',
      developerMessage: additional,
    });
  };

  exp.NO_TOKEN = function (additional) {
    this.show({
      status: 401,
      name: 'NO_TOKEN',
      message: 'Unauthorized',
      developerMessage: additional,
    });
  };

  exp.NO_TOKEN_SECRET = function (additional) {
    this.show({
      status: 403,
      name: 'NO_TOKEN_SECRET',
      message: 'Sercret for token is undefined',
      developerMessage: additional,
    });
  };

  exp.BAD_TOKEN = function (additional) {
    this.show({
      status: 403,
      name: 'BAD_TOKEN',
      message: 'Bad token',
      developerMessage: additional,
    });
  };

  return exp;
};
