const uuid = require('uuid');
const jwt = require('jsonwebtoken');

class LoginController {
  constructor({ config, models }) {
    this.models = models;
    if (!config.token.secret) throw ('NO_TOKEN_SECRET');
    this.secret = config.token.secret;
    this.expire = config.token.expire;

    this.aa = async (cb, res, next) => {
      try {
        res.json(await cb)
      } catch(err) {
        next(err)
      }
    }
  }

  async login(req, res) {
    const { login, password, refresh } = req.body;
    const user = await this.models.login.search({ login, password, refresh });
    res.json(await this._updateUserData(user));
  }

  async login2(req, ...args) {
    const { login, password, refresh } = req.body;
    const user = await this.models.login.search({ login, password, refresh });
    this.aa(this._updateUserData(user), ...args);
  }

  async update(req, ...args) {
    const user = await this.models.login.search({ refresh: this._decoded(req).refresh });
    this.aa(this._updateUserData(user), ...args);
  }

  async info(req, ...args) {
    this.aa(this._decoded(req), ...args);
  }

  _decoded(req) {
    const token = req.headers['x-access-token'] || req.body.token || req.query.token;
    if (!token) throw 'NO_TOKEN';
    return jwt.decode(token, this.secret);
  }

  async _updateUserData(user) {
    if (!user) throw 'USER_NOT_FOUND';

    const refresh = uuid.v4();

    const {
      id, login, group, name,
    } = user;
    const data = {
      id, login, group, name, refresh,
    };

    const token = jwt.sign(data, this.secret, { expiresIn: this.expire || 60 });

    await this.models.login.update(user, { refresh });

    return { ...data, token };
  }
}

module.exports = LoginController;
