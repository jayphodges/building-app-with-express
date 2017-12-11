const environment = process.env.NODE_ENV || 'development'
const configuration = require('./knexfile')[environment]
const database = require('knex')(configuration)

const getAllSecrets = () => {
  return database.raw('SELECT * FROM secrets')
}

const insertSecret = (secret) => {
  return database.raw(`
    INSERT INTO secrets (message, created_at) VALUES (?, ?)`, [secret, new Date])
}

const logAndExit = (data) => {
  console.log(data)
  process.exit()
}

insertSecret("Yay Elen Mary")
  .then(getAllSecrets)
  .then(logAndExit)
