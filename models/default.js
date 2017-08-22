'use strict'
var uuid = require('uuid');

module.exports = function (name, model, db) {

  return {
    object: model,

    get: function (params, next) {
      var search = params.search;
      var fields = params.fields || {};
      var sort = params.sort || {};
      var start = params.start || 0;
      var limit = params.limit;
      var rel = params.rel;

      if (rel) {
        var s = { _id: rel.data };
        db.collection(rel.table1).find(s).toArray(function (err, arr) {
          var a = [];
          for (var i = 0; i < arr.length; i++) {
            var d = arr[i][rel.field1];
            if (Array.isArray(d)) {
              a = a.concat(d);
            } else {
              a.push(d);
            }
          }

          search[rel.field2] = { $in: a };
          db.collection(name).find(search, fields).sort(sort).skip(start).limit(limit).toArray(next);
        });
      } else {
        var res = db.collection(name).find(search, fields).sort(sort);
        if(start) res = res.skip(start);
        if(limit) res = res.limit(limit);
        res.toArray(next);
      }
    },

    add: function (data, next) {
      data._id = uuid.v4();
      db.collection(name).insert(data, next);
    },

    update: function (id, data, res) {
      db.collection(name).update({ _id: id }, data, res);
    },

    delete: function (data, next) {
      db.collection(name).remove(data, next);
    },

  };
};
