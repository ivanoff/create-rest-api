'use strict';
var Api = require('./src');
var api = new Api();

console.log("This is an example of api.model('writers')")

api.model('writers', { name: 'string', birth: { type: 'date', notNull: true } });
api.start();
