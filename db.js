import "dotenv/config"
import mysql from 'mysql2/promise';
const db = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: "std",
  password: "std",
  database: "test",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
export default db;