const security = require('./security');

module.exports = (name, app, controller, openMethods, denyMethods, links) => {
  const c = controller(name);

  const path = `/${name}`;
  const pathId = `${path}/:id`;
  app.use(path, security(openMethods, denyMethods));
  app.use(pathId, security(openMethods, denyMethods));

  app.get(path, c.get);
  app.post(path, c.post);
  app.delete(path, c.delete);

  app.get(pathId, c.get);
  app.patch(pathId, c.update);
  app.put(pathId, c.replace);
  app.delete(pathId, c.delete);

  const myPath = `/my/:login${path}`;
  const myPathId = `/my/:login${pathId}`;
  const ourPath = `/our/:group${path}`;
  const ourPathId = `/our/:group${pathId}`;

//  app.use(myPath, security(openMethods, denyMethods));
//  app.use(myPathId, security(openMethods, denyMethods));
//  app.use(ourPath, security(openMethods, denyMethods));
//  app.use(ourPathId, security(openMethods, denyMethods));

  app.get(myPath, c.get);
  app.post(myPath, c.post);
  app.delete(myPath, c.delete);

  app.get(myPathId, c.get);
  app.patch(myPathId, c.update);
  app.put(myPathId, c.replace);
  app.delete(myPathId, c.delete);

  app.get(ourPath, c.get);
  app.post(ourPath, c.post);
  app.delete(ourPath, c.delete);

  app.get(ourPathId, c.get);
  app.patch(ourPathId, c.update);
  app.put(ourPathId, c.replace);
  app.delete(ourPathId, c.delete);

  if(links) {
    for(let link of [].concat(links)) {
      const c1 = controller(name, link);
      const c2 = controller(link, name);
      const pathIdlinked1 = `/${name}/:id/${link}`;
      const pathIdlinked2 = `/${link}/:id/${name}`;
      app.use(pathIdlinked1, security(openMethods, denyMethods));
      app.use(pathIdlinked2, security(openMethods, denyMethods));

      app.get(pathIdlinked1, c1.get);
      app.get(pathIdlinked2, c2.get);
      app.post(pathIdlinked1, c1.post);
      app.post(pathIdlinked2, c2.post);
    }
  }

};
