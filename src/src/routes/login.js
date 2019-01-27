const ControllersLogin = require('../controllers/login');

class LoginRouter {
  constructor({app, config, models}) {
    const c = new ControllersLogin({config, models});
    app.get('/login', c.info.bind(c));
    app.post('/login', c.login.bind(c));
    app.patch('/login', c.update.bind(c));
  }
}

module.exports = LoginRouter;
