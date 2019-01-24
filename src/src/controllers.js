const Knex = require('knex');
const models = require('./models').getModels();

class Controllers {

  constructor(name) {
    this.name = name;
  }

  async get(req, res, next) {
    let where = [];
    if(req.params._id) where.push([{ id: req.params._id }])

    let search = Object.keys(req.query).filter(key => !key.match(/^_/));
    console.log(search);
    console.log(req.query);
    for(let key of search) {
      where.push([key, 'like', `%${req.query[key]}%`])
    }
    res.json(await models.get(this.name, where))
  }

  async post(req, res, next) {
    res.json(await models.post(this.name, req.body))
  }

  async replace(req, res, next) {
    res.json(await models.post(this.name, req.body))
  }

  async update(req, res, next) {
    res.json(await models.post(this.name, req.body))
  }

  async delete(req, res, next) {
    res.json(await models.delete(this.name, req.body))
  }

}

module.exports = Controllers;
