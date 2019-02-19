const error = require('../errors');

module.exports = (openMethods, denyMethods = []) => async (ctx, next) => {
  return next();
  const methods = Array.isArray(openMethods) ? openMethods : [openMethods];
  const accessGranted = openMethods && ( methods.includes(ctx.method) || methods.includes('*') );

  const methodsDenied = Array.isArray(denyMethods) ? denyMethods : [denyMethods];
  const accessDenied = !accessGranted || methodsDenied.includes(ctx.method);

  return next( accessDenied && !ctx._currentUser ? error.ACCESS_DENIED : undefined );
};
