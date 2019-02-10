
module.exports = models => {

  return (name, link) => ({
    get: async (req, res, next) => {
      const { id } = req.params;

      let where = id ? { id } : {};

      const search = Object.keys(req.query).filter(key => !key.match(/^_/));

      for (const key of search) {
        where[key] = req.query[key];
      }

      const data = await models.get({name, link, where});

      if(id && !link) {
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
      }
      let linkedData = {};

      // store linked data
      for(let [key, search] of Object.entries(body)) {
        if(key === 'id' || currentSchema[key] || !models.schema[key]) continue;
        linkedData[key] = [].concat(search).map(id => typeof id === 'number' ? {id} : id);
        delete body[key];
      }

      const realName = link || name;
      const result1 = await models.insert(realName, body);

      for(let [table2, data2] of Object.entries(linkedData)) {
        if( (realName) === table2 ) continue;
        let key = `${realName}/${result1.id}/${table2}`;
        models.dD[key] = (models.dD[key] || []).concat(data2);
      }

      await processLinked();

      res.location(`/${realName}/${result1.id}`);
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

  // insert linked data if it is exists in linked table, store it in delayed otherwise
  async function processLinked (name, id1, linkedData) {
    const prefix = new RegExp(`^([^\/]+)\/([^\/]+)\/([^\/]+)$`);

    for(let link of Object.keys(models.dD)) {
      const found = link.match(prefix);
      if(!found) continue;
      const [, table1, id1, table2] = found;

      let data2 = models.dD[link];

      let result1 = (await models.get({name: table1, where: {id:id1}})).shift();
      for(let i = 0; i < data2.length; i++) {
        let result2 = (await models.get({name: table2, where: data2[i]})).shift();
        if(result1 && result2) {
          await models.insert(models.getLinkedTableName(table1, table2), {[table1]: result1.id, [table2]: result2.id});
          data2[i] = undefined;
        }
      }

      models.dD[link] = data2.filter( item => item && Object.keys(item).length);
      if(!models.dD[link].length) delete models.dD[link];
    }

    if(Object.keys(models.dD).length) console.log('delayed linked data:', models.dD);
  };

}