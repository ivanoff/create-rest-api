module.exports = (name, app, controller) => {
  const c = controller(name);

  const path = `/${name}`;
  app.get(path, c.get.bind(c));
  app.post(path, c.post.bind(c));
  app.delete(path, c.delete.bind(c));

  const pathId = `${path}/:id`;
  app.get(pathId, c.get.bind(c));
  app.patch(pathId, c.update.bind(c));
  app.put(pathId, c.replace.bind(c));
  app.delete(pathId, c.delete.bind(c));
};
