const md5 = require('md5');
const config = require('../../config');

class LoginModel {

  constructor(db) {
    this.name = 'users';
    this.db = db;
  }

  async search({ login, password, refreshToken }) {
    password = md5(password);
    return this.db(this.name).select('*').where({ login, password, refreshToken }).first();
  }

  async insert(body) {
    return this.db(this.name).insert(body).returning('*');
  }

  async update(user, body) {
    return this.db(this.name).where(user).update(body);
  }

}

module.exports = LoginModel;
