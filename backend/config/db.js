const mysql = require('mysql2/promise')
require('dotenv').config()

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection()

    console.log('=================================')
    console.log('MySQL Connected Successfully!')
    console.log('Database:', process.env.DB_NAME)
    console.log('=================================')

    connection.release()
  } catch (error) {
    console.error(
      'MySQL Connection Failed:',
      error.message
    )

    throw error
  }
}

module.exports = {
  pool,
  testDatabaseConnection,
}