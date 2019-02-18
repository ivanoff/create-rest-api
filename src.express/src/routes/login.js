const ControllersLogin = require('../controllers/login');

class LoginRouter {
  constructor({ app, config, models, wrapAsync }) {
    const c = new ControllersLogin({ config, models });
    app.get('/login', wrapAsync( c.info.bind(c) ));
    app.post('/login', wrapAsync( c.login.bind(c) ));
    app.patch('/login', wrapAsync( c.update.bind(c) ));
  }
}

module.exports = LoginRouter;
