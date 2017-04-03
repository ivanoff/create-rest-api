/**
 * Logger lib
 **/
'use strict';

var winston = require('winston');
var moment = require('moment-timezone');

var logLevel = process.env.LOG_LEVEL || 'info';

var Logger = winstonObj;

Logger.getInstance = function () {
  return new Logger();
};

// Log update setup
winston.setupLog = function (opt) {
  if (!opt) opt = {};
  if (typeof opt.timezone !== 'undefined')
    opt.timestamp = function () { return moment().tz(opt.timezone).format(); };

  if (typeof opt.timestamp === 'undefined')
    opt.timestamp = true;
  this.configure({
    transports: opt.hide ? [] : [new (this.transports.Console)(opt)],
  });
};

// Return new end-to-end numbering Id for logline
winston.makeId = (function () {
  var index = 0;
  return function () {
    return ++index;
  };
})();

module.exports = Logger.getInstance();

function winstonObj() {
  winston.emitErrs = true;

  winston.setLevels({
    emerg: 0, alert: 1, crit: 2, error: 3,
    warning: 4, notice: 5, info: 6, debug: 7, });
  winston.addColors({ emerg: 'red', alert: 'red', crit: 'red', error: 'red',
    warning: 'yellow', notice: 'cyan', info: 'blue', debug: 'green', });

  winston.remove(winston.transports.Console);
  winston.add(winston.transports.Console, {
    level: logLevel,
    colorize: true,
    timestamp: true,
  });

  // get Id from first parameter as a number or create new Id and add it to logline
  var _log = winston.log;
  winston.log = function () {
    var a = Array.from(arguments);
    var hasId = typeof a[1] === 'number';
    var id = hasId ? a[1] : winston.makeId();
    if (typeof a[1] === 'object') {
      a.splice(1, 0, '[' + id + ']');
    } else {
      a[1] = '[' + id + ']' + (hasId ? '' : ' ' + a[1]);
    }

    _log.apply(this, a);
  };

  return winston;
}
