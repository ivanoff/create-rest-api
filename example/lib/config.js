/***
 * Config lib
 **/
'use strict';

var fs = require('fs');

exports = module.exports = (function() {

  var env = typeof env !== 'undefined' ? env : process.env.NODE_ENV || 'default';

  var filename = './config/' + env + '.json';

  try {
    return JSON.parse(fs.readFileSync(filename, 'utf8'));
  } catch (e) {
    console.error(e);
    return {};
  }

} )();