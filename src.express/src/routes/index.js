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

  const myPath = `/my/:login${path}`;
  const myPathId = `/my/:login${pathId}`;
  const ourPath = `/our/:group${path}`;
  const ourPathId = `/our/:group${pathId}`;

//  app.use(myPath, security(openMethods, denyMethods));
//  app.use(myPathId, security(openMethods, denyMethods));
//  app.use(ourPath, security(openMethods, denyMethods));
//  app.use(ourPathId, security(openMethods, denyMethods));

  app.get(myPath, wrapAsync( c.get ));
  app.post(myPath, wrapAsync( c.post ));
  app.delete(myPath, wrapAsync( c.delete ));

  app.get(myPathId, wrapAsync( c.get ));
  app.patch(myPathId, wrapAsync( c.update ));
  app.put(myPathId, wrapAsync( c.replace ));
  app.delete(myPathId, wrapAsync( c.delete ));

  app.get(ourPath, wrapAsync( c.get ));
  app.post(ourPath, wrapAsync( c.post ));
  app.delete(ourPath, wrapAsync( c.delete ));

  app.get(ourPathId, wrapAsync( c.get ));
  app.patch(ourPathId, wrapAsync( c.update ));
  app.put(ourPathId, wrapAsync( c.replace ));
  app.delete(ourPathId, wrapAsync( c.delete ));

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
