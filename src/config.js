module.exports = {

  server: {
    host: 'localhost',
    port: 8877,
  },

  db: {
    client: 'sqlite3',
    connection: ':memory:',
  },

  admin: {
    login:'admin',
    password:'admin',
  },

  token: {
    secret: 'REPLACE_IT',
    expire: 10,
  },

}
