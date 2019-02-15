const security = require('./security');

module.exports = (name, app, controller, openMethods, denyMethods, links, wrapAsync) => {
  const c = controller(name);

  const path = `/${name}`;
  const pathId = `${path}/:id`;

  app.use(path, security(openMethods, denyMethods));
  app.use(pathId, security(openMethods, denyMethods));

  app.get(path, wrapAsync( c.get ));
  app.post(path, wrapAsync( c.post ));
  app.delete(path, wrapAsync( c.delete ));

  app.get(pathId, wrapAsync( c.get ));
  app.patch(pathId, wrapAsync( c.update ));
  app.put(pathId, wrapAsync( c.replace ));
  app.delete(pathId, wrapAsync( c.delete ));

  if(links) {
    for(let link of [].concat(links)) {
      const c1 = controller(name, link);
      const c2 = controller(link, name);
      const pathIdlinked1 = `/${name}/:id/${link}`;
      const pathIdlinked2 = `/${link}/:id/${name}`;
      app.use(pathIdlinked1, security(openMethods, denyMethods));
      app.use(pathIdlinked2, security(openMethods, denyMethods));

      app.get(pathIdlinked1, wrapAsync( c1.get ));
      app.get(pathIdlinked2, wrapAsync( c2.get ));
      app.post(pathIdlinked1, wrapAsync( c1.post ));
      app.post(pathIdlinked2, wrapAsync( c2.post ));
    }
  }

};
