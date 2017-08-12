"use strict"
var md5 = require('md5');
var uuid = require('uuid');

module.exports = {

  modelName : 'users',

  search : function(req, data, res) {
    var search = (data.login)? { login: data.login, password: data.password } : { _refreshToken: data.refreshToken };
    req._db.collection(this.modelName).findOne(search, res);
  },

  updateOne : function(req, data, res) {
    req._db.collection(this.modelName).updateOne(data, {$set:res});
  },

}
