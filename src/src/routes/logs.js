module.exports = (log, id = 0) => (ctx, next) => {

  ctx._id = ++id;
  const { _id, method, url, params, query, headers, body } = ctx;

  log.debug(`${_id} [IN] ${method}, ${url}`);
  log.debug(`${_id} [IN] ${JSON.stringify([
    { params, query, body }, { headers },
  ])}`);

/*
  // Show outgoing information by overriding send method
  const _send = res.send;
  res.send = (bodySent) => {
    log.debug(`${_id} [OUT] ${bodySent}`);
    _send.call(res, bodySent);
  };
*/
  next();
};
