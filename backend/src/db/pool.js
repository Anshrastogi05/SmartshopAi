'use strict';

const { Pool } = require('pg');

let pool;

/**
 * Returns a singleton pg Pool connected to DATABASE_URL.
 */
function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: true }
        : process.env.DB_SSL === 'true'
          ? { rejectUnauthorized: false }
          : false,
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('[DB] Unexpected pool error:', err.message);
    });

    pool.on('connect', () => {
      if (process.env.NODE_ENV !== 'test') {
        console.log('[DB] New client connected to PostgreSQL');
      }
    });
  }
  return pool;
}

/**
 * Execute a parameterized query safely.
 * @param {string} text  - SQL query text
 * @param {Array}  params - Query parameters
 */
async function query(text, params) {
  const client = getPool();
  const start = Date.now();
  const result = await client.query(text, params);
  const duration = Date.now() - start;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[DB Query] ${text} | duration: ${duration}ms | rows: ${result.rowCount}`);
  }

  return result;
}

/**
 * Get a client from the pool for transaction usage.
 */
async function getClient() {
  return getPool().connect();
}

/**
 * Check database connectivity (used in health check).
 */
async function checkConnection() {
  const result = await query('SELECT NOW() as now');
  return result.rows[0].now;
}

/**
 * Close the pool (for graceful shutdown / tests).
 */
async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = { getPool, query, getClient, checkConnection, closePool };
