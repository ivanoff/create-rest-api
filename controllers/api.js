'use strict';

var _ = require('lodash');

function getModels(stack, models) {
  var result = {
    models: models,
    methods: {},
  };

  for (var i = 0; i < stack.length; i++) {
    if (stack[i] && stack[i].route) {
      var r = stack[i].route;
      var path = r.path.replace(/^\//, '');
      result.methods[path] = _.concat(result.methods[path] || [], Object.keys(r.methods));
    }
  }

  return result;
}

exports.md = function (req, res, next) {
  res.json(getModels(this._router.stack, req.models));
  next();
};

exports.swagger = function (req, res, next) {
  res.status(200).json({ to: 'do' });
  next();
};

exports.html = function (req, res, next) {
  res.json({ to: 'do' });
  next();
};
