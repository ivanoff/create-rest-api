
module.exports = models => {

  return (name, link) => ({
    get: async ctx => {
      const { id } = ctx.params;
      let where = id ? { id } : {};

      const search = Object.keys(ctx.request.query).filter(key => !key.match(/^_/));

      for (const key of search) {
        where[key] = ctx.request.query[key];
      }

      const data = await models.get({name, link, where});

      if(id && !link && !data[0]) throw 'NOT_FOUND';

      ctx.body = id && !link ? data[0] : data;
    },

    post: async ctx => {
      let { body } = ctx.request;
      let currentSchema = models.schema[name] || {};

      if(link) {
        const { id } = ctx.params;
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
        models.delayedData[key] = (models.delayedData[key] || []).concat(data2);
      }

      await processLinked();

      ctx.status = 201;
      ctx.location = `/${realName}/${result1.id}`;
      ctx.body = result1;
    },

    replace: async ctx => {
      await models.replace(name, ctx.params.id, ctx.request.body);
      ctx.body = ctx.params;
    },

    update: async ctx => {
      ctx.body = await models.update(name, ctx.params.id, ctx.request.body);
    },

    delete: async ctx => {
      ctx.body = await models.delete(name, ctx.params.id);
    },

  });

  // insert linked data if it is exists in linked table, store it in delayed otherwise
  async function processLinked (name, id1, linkedData) {
    const prefix = new RegExp(`^([^\/]+)\/([^\/]+)\/([^\/]+)$`);

    for(let link of Object.keys(models.delayedData)) {
      const found = link.match(prefix);
      if(!found) continue;
      const [, table1, id1, table2] = found;

      let data2 = models.delayedData[link];

      let result1 = (await models.get({name: table1, where: {id:id1}})).shift();
      for(let i = 0; i < data2.length; i++) {
        let result2 = (await models.get({name: table2, where: data2[i]})).shift();
        if(result1 && result2) {
          await models.insert(models.getLinkedTableName(table1, table2), {[table1]: result1.id, [table2]: result2.id});
          data2[i] = undefined;
        }
      }

      models.delayedData[link] = data2.filter( item => item && Object.keys(item).length);
      if(!models.delayedData[link].length) delete models.delayedData[link];
    }

    if(Object.keys(models.delayedData).length) console.log('delayed linked data:', models.delayedData);
  };

}