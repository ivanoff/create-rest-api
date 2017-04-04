'use strict';
var v = require('2valid');
var _ = require('lodash');

exports = module.exports = function (name, model) {

  return {
    defaultLinks: {
      self: 'GET',
      update: 'PUT',
      replace: 'PATCH',
      delete: 'DELETE',
    },

    get: function (req, res, next) {
      var q = req.query;
      if (!q._fields) q._fields = q._filter;
      if (!q._start) q._start = q._begin;
      if (!q._sort) q._sort = q._order;

      var start = parseInt(q._start || 0);
      var limit = parseInt(q._limit || 10);

      var fields = {};
      if (q._fields) {
        var fieldsNames = q._fields.split(',');
        for (var i = 0; i < fieldsNames.length; i++)
          fields[fieldsNames[i]] = 1;
      }

      var sort = {};
      if (q._sort) {
        var sortNames = q._sort.split(',');
        for (var i = 0; i < sortNames.length; i++)
          sort[sortNames[i].replace(/^-/, '')] = (sortNames[i].indexOf('-') === 0) ? -1 : 1;
      }

      var search = _.pickBy(req.query, function (value, key) { return !key.match(/^_/); });

      var searchKeys = Object.keys(search);
      for (var key in search) {
        var f = search[key].match(/^\/(.+)\/([igumy]*)$/);
        if (f && f[1]) {
          search[key] = new RegExp(f[1], f[2]);
        }

        if (search[key] == parseInt(search[key])) {
          search[key] = { $in: [parseInt(search[key]), search[key]] };
        }
      }

      var rel = req._relations[req.route.path.replace(/^\/+/, '')];
      if (rel && req.params[rel.name]) {
        rel.data = req.params[rel.name];
      } else {
        rel = null;
      }

      req._log.debug(req._id, name, 'model.get(',
        [search, fields, sort, start, limit, rel].prettyJSON().join(', '), ')');

      model.get(search, fields, sort, start, limit, rel, function (err, docs) {
        if (err) return req._error.show(err);
        if (!docs || !docs[0]) return req._error.NOT_FOUND(name, search);

        res.json(docs);
      });
    },

    getById: function (req, res, next) {
      var _this = this;
      var search = { _id: req.params._id };
      req._log.debug(req._id, name, 'model.get(', search, ', {} , {} , 0 , 1 , null )');
      model.get(search, {}, {}, 0, 1, null, function (err, docs) {
        if (err) return req._error.show(err);
        if (!docs || !docs[0]) return req._error.NOT_FOUND(name.replace(/s$/, ''), search);

        var doc = docs[0];
        doc._links = {};
        doc._links['/' + name + '/' + doc._id] = _this.defaultLinks;

        var relKeys = req._relations? Object.keys(req._relations) : [];
        relKeys.forEach( function(key) {
          if(req._relations[key].table1 === name) {
            var urlId = '/' + key.replace( ':' + req._relations[key].name, doc._id);
            doc._links[urlId] = {};
            doc._links[urlId][req._relations[key].table2] = 'GET';
          }
        });

        res.json(doc);
      });
    },

    add: function (req, res, next) {
      var _this = this;
      var doc = req.body;
      v.validate(model.object, doc, function (err) {
        if (err) return req._error.DATA_VALIDATION_ERROR(err);

        model.add(doc, function (err, result) {
          if (err) return req._error.show(err);

          doc._links = {};
          var url = '/' + name + '/' + doc._id;
          doc._links[url] = _this.defaultLinks;

          var relKeys = req._relations? Object.keys(req._relations) : [];
          relKeys.forEach( function(key) {
            if(req._relations[key].table1 === name) {
              var urlId = '/' + key.replace( ':' + req._relations[key].name, doc._id);
              doc._links[urlId] = {};
              doc._links[urlId][req._relations[key].table2] = 'GET';
            }
          });

          res.location(url);
          res.status(201).json(doc);
        });
      });
    },

    replace: function (req, res, next) {
      var _this = this;
      var toUpdate = req.body;
      v.validate(model.object, toUpdate, { notRequired: req._updateOnly }, function (err) {
        if (err) return req._error.DATA_VALIDATION_ERROR(err);

        var search = { _id: req.params._id };
        model.get(search, {}, {}, 0, 1, null, function (err, oldDoc) {
          if (Array.isArray(oldDoc)) oldDoc = oldDoc[0];

          if (err) return req._error.show(err);
          if (!oldDoc) return req._error.NOT_FOUND(name.replace(/s$/, ''), search);

          if (!req._updateOnly) oldDoc = { _id: req.params._id };
          toUpdate = _.merge(oldDoc, toUpdate);
          model.update(req.params._id, toUpdate, function (err, doc) {
            if (err) return req._error.show(err);

            doc._links = {};
            var url = '/' + name + '/' + doc._id;
            doc._links[url] = _this.defaultLinks;

            var relKeys = req._relations? Object.keys(req._relations) : [];
            relKeys.forEach( function(key) {
              if(req._relations[key].table1 === name) {
                var urlId = '/' + key.replace( ':' + req._relations[key].name, doc._id);
                doc._links[urlId] = {};
                doc._links[urlId][req._relations[key].table2] = 'GET';
              }
            });

            res.location(url);
            res.status(200).json(toUpdate);
          });

        });
      });
    },

    update: function (req, res, next) {
      req._updateOnly = 1;
      this.replace(req, res, next);
    },

    delete: function (req, res, next) {
      var search = { _id: req.params._id };
      model.delete(search, function (err, doc) {
        if (err) return req._error.show(err);
        if (!doc || !doc.result.n) return req._error.NOT_FOUND(name.replace(/s$/, ''), search);

        res.json({ ok: 1, _id: req.params._id });
      });
    },

  };

};
