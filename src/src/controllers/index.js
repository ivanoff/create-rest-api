
// process delayed linked data
let processDelayed = async (models, table1) => {
  let delayed = models.delayedData[table1];
  if(delayed) {
    for(let [table2, data2] of Object.entries(delayed)) {
      for(let id of Object.keys(data2)) {
        for(let search of data2[id]) {
          if( Object.keys(search).length ) {
            let result1 = (await models.get(table1, search)).shift();
            if(!result1) continue;
            await models.insert(models.getLinkedTableName(table1, table2), {[table2]: id, [table1]: result1.id});
          }
          delete delayed[table2][id];
        }
        if(!Object.keys(data2).length) delete delayed[table2];
      }
      if(!Object.keys(delayed).length) delete models.delayedData[table1];
    }
  }
};

// insert linked data if it is exists in linked table, store it in delayed otherwise
let processLinked = async (models, table1, result1, linkedData) => {
  for(let [table2, data2] of Object.entries(linkedData)) {
    for(let id of data2) {
      let search = typeof id === 'number'? {id} : id;
      let result2 = (await models.get(table2, search)).shift();
      if(result2) {
        await models.insert(models.getLinkedTableName(table1, table2), {[table1]: result1.id, [table2]: result2.id});
      } else {
        let t2 = models.delayedData[table2] || {};
        models.delayedData[table2] = { ...t2, [table1]: {...t2[table1], [result1.id]: linkedData[table2]} };
      }
    }
  }
};

module.exports = models => (name, link) => ({
  get: async (req, res, next) => {
    const where = [];

    const { id } = req.params;

    if (id) {
      where.push({ id });
    }

    const search = Object.keys(req.query).filter(key => !key.match(/^_/));

    for (const key of search) {
      where.push([key, 'like', `%${req.query[key]}%`]);
    }

    if(link) {
      where.push({ [name]: id });
      name = link;
    }
console.log(name, where)

    const data = await models.get(name, ...where);
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

    if(link) {
      const { id } = req.params;
      body[name] = body[name]? [].concat(body[name], id) : {id};
      name = link;
    }
    let linkedData = {};

    // store linked data
    for(let [key, search] of Object.entries(body)) {
      if(key === 'id' || currentSchema[key] || !models.schema[key]) continue;
      linkedData[key] = [].concat(search);
      delete body[key];
    }

    const result1 = await models.insert(name, body);

    await processLinked(models, name, result1, linkedData );
    await processDelayed(models, name);

    if(Object.keys(models.delayedData).length) console.log(JSON.stringify(models.delayedData))

    res.location(`/${name}/${result1.id}`);
    res.status(201).json(result1);
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
  },

});
