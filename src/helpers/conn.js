const knex = require('knex')
const Sql = require('../helpers/sql')

const connection = knex({
  client: 'mysql',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    charset: 'utf8',
    dateStrings: true
  },
  useNullAsDefault: true
})

module.exports = new Sql(connection)
