module.exports = models => name => ({
  get: async (req, res, next) => {
    const where = [];
    const { id } = req.params;
    if (id) where.push([{ id }]);

    const search = Object.keys(req.query).filter(key => !key.match(/^_/));

    for (const key of search) {
      where.push([key, 'like', `%${req.query[key]}%`]);
    }
    const data = await models.get(name, where);
    if(id) {
      if(!data[0]) res.status(404);
      res.json(data[0]);
    } else {
      res.json(data);
    }
  },

  post: async (req, res, next) => {
    let { body } = req;
    let currentSchema = models.schema[name];

    let updateLinks = [];

    for(let key of Object.keys(body)) {
      if(key === 'id' || currentSchema[key] || !models.schema[key]) continue;
      const linkedName = key;

      for(let id of [].concat(body[linkedName])) {
        if(typeof id !== 'number') {
          id = (await models.get(key, id))[0].id;
        }
        updateLinks.push( {table: [name, linkedName].sort().join('_'), fields: {[linkedName]: id}} )
      }
      delete body[linkedName];
    }

    const doc = await models.insert(name, body);

    for(let data of updateLinks) {
      await models.insert(data.table, {[name]: doc.id, ...data.fields});
    }

    res.location(`/${name}/${doc.id}`);
    res.status(201).json(doc);
  },

  replace: async (req, res, next) => {
    const { id } = req.params;
    res.json(await models.replace(name, id, req.body));
  },

  update: async (req, res, next) => {
    const { id } = req.params;
    res.json(await models.update(name, id, req.body));
  },

  delete: async (req, res, next) => {
    const { id } = req.params;
    res.json(await models.delete(name, id));
  }
});
