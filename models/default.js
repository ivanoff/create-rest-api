'use strict'
var uuid = require('uuid');

module.exports = function (name, model, db) {

  return {
    object: model,

    get: function (search, fields, sort, skip, limit, relation, next) {
      if (relation) {
        var s = { _id: relation.data };
        db.collection(relation.table1).find(s).toArray(function (err, arr) {
          var a = [];
          for (var i = 0; i < arr.length; i++) {
            var d = arr[i][relation.field1];
            if (Array.isArray(d)) {
              a = a.concat(d);
            } else {
              a.push(d);
            }
          }

          search[relation.field2] = { $in: a };
          db.collection(name).find(search, fields).sort(sort).skip(skip).limit(limit).toArray(next);
        });
      } else {
        var res = db.collection(name).find(search, fields).sort(sort);
        if(skip) res = res.skip(skip);
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
