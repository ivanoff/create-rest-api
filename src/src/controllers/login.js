const uuid = require('uuid');
const jwt = require('jsonwebtoken');

class LoginController {

  constructor(base) {
    this.secret = base.config.token ? base.config.token.secret : undefined;
    if (!this.secret) throw(new Error(`NO_TOKEN_SECRET`));
  }

  async login(req, res, next) {
    let { login, password } = req.body;

    const user = await models.login.search({ login, password });

    return res.json(await this._updateUserData(user));
  }

  async update(req, res, next) {
    const decoded = jwt.decode(this._getToken(req), this.secret);

    const user = await models.login.search({ refreshToken: decoded.refreshToken });

    return res.json(await this._updateUserData(user));
  }

  async info(req, res, next) {
    const decoded = jwt.decode(this._getToken(req), this.secret);
    res.json(decoded);
  }

  _getToken(req) {
    const token = req.headers['x-access-token'] || req.body.token || req.query.token;
    if (!token) throw(new Error(base.error.NO_TOKEN));
    return token;
  }

  async _updateUserData(user) {
    if (!user) throw(new Error(`USER_NOT_FOUND`));

    const refreshToken = uuid.v4();

    const { id, login, group, name } = user;
    const data = { id, login, group, name, refreshToken };

    const token = jwt.sign(data, this.secret, { expiresIn: config.token.expire || 60 });

    await models.login.update(user, { refreshToken: refreshToken });

    return {...data, token}
  }

}

module.exports = LoginController;
