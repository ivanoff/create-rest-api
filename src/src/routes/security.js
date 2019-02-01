const error = require('../errors');

module.exports = (openMethods, denyMethods = []) => (req, res, next) => {
  const methodsDenied = Array.isArray(denyMethods) ? denyMethods : [denyMethods];
  const accessDenied = methodsDenied.includes(req.method);

  const methods = Array.isArray(openMethods) ? openMethods : [openMethods];
  const accessGranted = openMethods && ( methods.includes(req.method) || methods.includes('*') );

  return next( accessDenied? error.METHOD_NOT_ALLOWED : !accessGranted ? error.ACCESS_DENIED : undefined );
};
