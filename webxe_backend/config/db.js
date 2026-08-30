const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  server: process.env.DB_SERVER || 'localhost',
  port: Number(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME || 'QuanLyXe',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '123456',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
    enableArithAbort: true,
  },
};

async function connectDB() {
  try {
    await sql.connect(dbConfig);
    console.log('✅ Kết nối SQL Server thành công');
  } catch (error) {
    console.error('❌ Kết nối SQL Server thất bại:', error.message);
    process.exit(1);
  }
}

module.exports = { sql, dbConfig, connectDB };
