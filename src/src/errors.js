module.exports = {

  MODEL_HAS_NO_NAME: "Model has no name. Please, define any name for model",

  NO_TOKEN: {
    status: 401,
    developerMessage: 'You need to login or use token',
  },

  ACCESS_DENIED: {
    status: 401,
    message: 'Access denied',
    developerMessage: 'additional',
  },

  METHOD_NOT_ALLOWED: {
    status: 405,
    message: 'Method Not Allowed',
  },

  METHOD_NOT_FOUND: {
    status: 404,
    message: 'Method Not Found',
  },

  USER_NOT_FOUND: {
    status: 404,
    message: 'User not found',
  },

  NOT_FOUND: {
    status: 404,
    message: 'Not Found',
  },

};
