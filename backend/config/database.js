const mysql = require('mysql2/promise');
require('dotenv').config();

// Pool de conexión para Hostinger
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    ssl: false // Hostigner normalmente no requiere SSL
});

// Probar conexión
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conectado a Hostinger MySQL');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Error conectando a Hostinger:', error.message);
        return false;
    }
}

module.exports = { pool, testConnection };