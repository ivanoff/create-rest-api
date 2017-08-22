/****
 Default Routing
****/
'use strict'

module.exports = function (name, controller, app) {

  if(app.protected[name]) {
    app.use('/' + name, app.checkAccess);
    app.use('/my/:login/' + name, app.checkAccess);
    app.use('/our/:group/' + name, app.checkAccess);

    app.get('/my/:login/' + name, controller.get.bind(controller));
    app.post('/my/:login/' + name, controller.add.bind(controller));
    app.delete('/my/:login/' + name, controller.delete.bind(controller));

    app.get('/my/:login/' + name + '/:_id', controller.getById.bind(controller));

    app.put('/my/:login/' + name + '/:_id', controller.replace.bind(controller));
    app.patch('/my/:login/' + name + '/:_id', controller.update.bind(controller));

    app.delete('/my/:login/' + name + '/:_id', controller.delete.bind(controller));

    app.get('/our/:group/' + name, controller.get.bind(controller));
    app.post('/our/:group/' + name, controller.add.bind(controller));
    app.delete('/our/:group/' + name, controller.delete.bind(controller));

    app.get('/our/:group/' + name + '/:_id', controller.getById.bind(controller));

    app.put('/our/:group/' + name + '/:_id', controller.replace.bind(controller));
    app.patch('/our/:group/' + name + '/:_id', controller.update.bind(controller));

    app.delete('/our/:group/' + name + '/:_id', controller.delete.bind(controller));
  }

  app.get('/' + name, controller.get.bind(controller));
  app.post('/' + name, controller.add.bind(controller));
  app.delete('/' + name, controller.delete.bind(controller));

  app.get('/' + name + '/:_id', controller.getById.bind(controller));

  app.put('/' + name + '/:_id', controller.replace.bind(controller));
  app.patch('/' + name + '/:_id', controller.update.bind(controller));

  app.delete('/' + name + '/:_id', controller.delete.bind(controller));
};
