module.exports = {

  server: {
    host: 'localhost',
    port: 18877,
  },

  db: {
    client: 'sqlite3',
    connection: ':memory:',
    useNullAsDefault: true,
  },

  admin: {
    login:'admin',
    password:'test',
  },

  token: {
    secret: 'TEST',
    expire: 10,
  },

}
