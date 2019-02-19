const uuid = require('uuid');
const jwt = require('jsonwebtoken');

class LoginController {
  constructor({ config, models }) {
    this.models = models;
    if (!config.token.secret) throw ('NO_TOKEN_SECRET');
    this.secret = config.token.secret;
    this.expire = config.token.expire;
  }

  async login(ctx) {
    const { login, password, refresh } = ctx.request.body;
    const user = await this.models.login.search({ login, password, refresh });
    ctx.body = await this._updateUserData(user)
  }

  async login2(ctx) {
    const { login, password, refresh } = ctx.request.body;
    const user = await this.models.login.search({ login, password, refresh });
    ctx.body = await this._updateUserData(user)
  }

  async update(ctx) {
    const user = await this.models.login.search({ refresh: this._decoded(ctx.request).refresh });
    ctx.body = await this._updateUserData(user)
  }

  async info(ctx) {
    ctx.body = await this._decoded(ctx.request);
  }

  _decoded(ctx) {
    const token = ctx.request.headers['x-access-token'] || ctx.request.body._token || ctx.request.query._token;
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
