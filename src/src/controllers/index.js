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

    let linkedData = {};

    let updateLinks = [];
    let storeLinks = [];

    for(let key of Object.keys(body)) {
      if(key === 'id' || currentSchema[key] || !models.schema[key]) continue;
      linkedData[key] = [].concat(body[key]);
      delete body[key];
    }

    const doc = await models.insert(name, body);

    for(let key of Object.keys(linkedData)) {
      for(let id of linkedData[key]) {
        let search = typeof id === 'number'? {id} : id;
        let data = await models.get(key, search);
        if(data[0]) {
          await models.insert([name, key].sort().join('_'), {[name]: doc.id, [key]:data[0].id});
          continue;
        }

        if(!models.linkedNames[key]) models.linkedNames[key] = {};
        if(!models.linkedNames[key][name]) models.linkedNames[key][name] = {};
        models.linkedNames[key][name][doc.id] = linkedData[key];
      }
    }

    if(models.linkedNames[name]) {
      for(let key of Object.keys(models.linkedNames[name])) {
        for(let id of Object.keys(models.linkedNames[name][key])) {
          for(let search of models.linkedNames[name][key][id]) {
            if( Object.keys(search).length ) {
              let data = await models.get(name, search);
              if( data[1] || !data[0] ) continue;
              await models.insert([name, key].sort().join('_'), {[key]: id, [name]: data[0].id});
            }
            delete models.linkedNames[name][key][id];
          }
          if(!Object.keys(models.linkedNames[name][key]).length) delete models.linkedNames[name][key];
        }
        if(!Object.keys(models.linkedNames[name]).length) delete models.linkedNames[name];
      }
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
