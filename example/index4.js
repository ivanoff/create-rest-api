'use strict';

const Api = require('../');
const api = new Api();

// change model
api.model('comments');
api.models.comments.get = (params, next) => { next(null, [{params: params}]) }

// user defined methods
api.get('/ok', (req, res, next) => res.json( {ok:1} ) )
api.post('/ok', (req, res, next) => req._error.ACCESS_DENIED() )

api.start();
