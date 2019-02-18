module.exports = (log, id = 0) => (req, res, next) => {

  req._id = ++id;
  const { _id, method, url, params, query, headers, body } = req;

  log.debug(`${_id} [IN] ${method}, ${url}`);
  log.debug(`${_id} [IN] ${JSON.stringify([
    { params, query, body }, { headers },
  ])}`);

  // Show outgoing information by overriding send method
  const _send = res.send;
  res.send = (bodySent) => {
    log.debug(`${_id} [OUT] ${bodySent}`);
    _send.call(res, bodySent);
  };

  next();
};
