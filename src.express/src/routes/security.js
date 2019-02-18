const error = require('../errors');

module.exports = (openMethods, denyMethods = []) => async (req, res, next) => {
  const methods = Array.isArray(openMethods) ? openMethods : [openMethods];
  const accessGranted = openMethods && ( methods.includes(req.method) || methods.includes('*') );

  const methodsDenied = Array.isArray(denyMethods) ? denyMethods : [denyMethods];
  const accessDenied = !accessGranted || methodsDenied.includes(req.method);

  return next( accessDenied && !req._currentUser ? error.ACCESS_DENIED : undefined );
};
