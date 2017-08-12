/****
 Default Routing
****/
'use strict'

module.exports = function (name, controller, app) {
  if(app.protected[name]) {
    app.use('/' + name, app.checkAccess);
  }

  app.get('/' + name, controller.get.bind(controller));
  app.post('/' + name, controller.add.bind(controller));
  app.delete('/' + name, controller.delete.bind(controller));

  app.get('/' + name + '/:_id', controller.getById.bind(controller));

  app.put('/' + name + '/:_id', controller.replace.bind(controller));
  app.patch('/' + name + '/:_id', controller.update.bind(controller));

  app.delete('/' + name + '/:_id', controller.delete.bind(controller));
};
