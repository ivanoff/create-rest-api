const Base = require('../base');

class Controllers extends Base {
  constructor({models,name}) {
    super();
    this.models = models;
    this.name = name;
  }

  async get(req, res, next) {
    const where = [];
    if (req.params._id) where.push([{ id: req.params._id }]);

    const search = Object.keys(req.query).filter(key => !key.match(/^_/));
    // console.log(search);
    // console.log(req.query);
    for (const key of search) {
      where.push([key, 'like', `%${req.query[key]}%`]);
    }
    res.json(await this.models.get(this.name, where));
  }

  async post(req, res, next) {
    res.json(await this.models.post(this.name, req.body));
  }

  async replace(req, res, next) {
    res.json(await this.models.post(this.name, req.body));
  }

  async update(req, res, next) {
    res.json(await this.models.post(this.name, req.body));
  }

  async delete(req, res, next) {
    res.json(await this.models.delete(this.name, req.body));
  }
}

module.exports = Controllers;
