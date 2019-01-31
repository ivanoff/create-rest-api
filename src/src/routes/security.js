module.exports = (freeAccess, error) => (req, res, next) => {
  const { url, method } = req;
  const name = url.match( /^\/([^\/]+)/ );

  const free = name && freeAccess[name[1]] && freeAccess[name[1]].includes(method);
  next( !free && error.ACCESS_DENIED );
};
