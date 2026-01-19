const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'ecoshare',
  password: 'ecoshare123',
  database: 'ecoshare'
});

module.exports = pool;
