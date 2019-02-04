const security = require('./security');

module.exports = (name, app, controller, openMethods, denyMethods, links) => {
  const c = controller(name);

  const path = `/${name}`;
  const pathId = `${path}/:id`;

  app.use(path, security(openMethods, denyMethods));
  app.use(pathId, security(openMethods, denyMethods));

  app.get(path, c.get.bind(c));
  app.post(path, c.post.bind(c));
  app.delete(path, c.delete.bind(c));

  app.get(pathId, c.get.bind(c));
  app.patch(pathId, c.update.bind(c));
  app.put(pathId, c.replace.bind(c));
  app.delete(pathId, c.delete.bind(c));

  if(links) {
    for(let link of [].concat(links)) {
      const c1 = controller(name, link);
      const pathIdlinked1 = `/${name}/:id/${link}`;
      app.use(pathIdlinked1, security(openMethods, denyMethods));
      app.get(pathIdlinked1, c1.get.bind(c1));
      app.post(pathIdlinked1, c1.post.bind(c1));

      const c2 = controller(link, name);
      const pathIdlinked2 = `/${link}/:id/${name}`;
      app.use(pathIdlinked2, security(openMethods, denyMethods));
      app.get(pathIdlinked2, c2.get.bind(c2));
      app.post(pathIdlinked2, c2.post.bind(c2));
console.log(pathIdlinked2, pathIdlinked1)
    }
  }

};
