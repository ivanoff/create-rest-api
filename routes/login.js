/****
 Login Routing
****/
"use strict"

var loginController = require('../controllers/login');

module.exports = function(app) {

  app.get('/login', loginController.info);
  app.post('/login', loginController.login);
  app.patch('/login', loginController.update);

};