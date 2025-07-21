const sql = require("mssql");
require('dotenv').config();

const config = {
    user: 'VergAdmin',
    password: process.env.PASSWORD,
    server: process.env.SERVER,
    port: parseInt(process.env.DBPORT, 10), 
    database: process.env.DATABASE,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

let pool;

async function initializePool() {
    try {
        pool = await new sql.ConnectionPool(config).connect();
        console.log('Database pool initialized successfully');
        return pool;
    } catch (err) {
        console.error('Database pool initialization failed:', err);
        throw err;
    }
}

function getPool() {
    if (!pool) {
        throw new Error('Database pool not initialized. Call initializePool() first.');
    }
    return pool;
}

async function closePool() {
    try {
        if (pool) {
            await pool.close();
            console.log('Database pool closed');
        }
    } catch (err) {
        console.error('Error closing database pool:', err);
    }
}

module.exports = {
    initializePool,
    getPool,
    closePool,
    sql
};
