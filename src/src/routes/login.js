var LoginController = require('../controllers/login');

class LoginRouter {

  constructor(base) {
    const c = new LoginController(base);
    base.app.get('/login', c.info.bind(c));
    base.app.post('/login', c.login.bind(c));
    base.app.patch('/login', c.update.bind(c));
  }

}

module.exports = LoginRouter;
