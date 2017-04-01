/****
 Api Routing
****/
'use strict'

var apiController = require('../controllers/api');

module.exports = function (app, models) {

  var Raml = require('create-raml');
  var raml = new Raml({ express: app });

  app.get('/API.md', apiController.md.bind(app));
  app.get('/API.swagger', apiController.swagger);
  app.get('/API.html', apiController.html);

};

