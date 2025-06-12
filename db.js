const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wa_gateway',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = {
  query: async (sql, params) => {
    const [rows] = await pool.query(sql, params);
    return rows;
  },
  execute: async (sql, params) => {
    const [result] = await pool.execute(sql, params);
    return result;
  },
  getConnection: async () => {
    return await pool.getConnection();
  }
};
