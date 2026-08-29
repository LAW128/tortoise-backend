const { Pool } = require('pg');
require('dotenv').config();

// Create the pool with conservative settings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,                          // limit simultaneous connections
  idleTimeoutMillis: 60000,        // keep idle connections alive for 1 minute
  connectionTimeoutMillis: 60000,  // wait up to 1 minute for a connection
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
});

// Save the original query function to avoid recursion
const originalQuery = pool.query.bind(pool);

// ---------- Retry helper ----------
async function queryWithRetry(text, params, retries = 5) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await originalQuery(text, params);
    } catch (err) {
      const isTransient =
        err.code === 'ECONNRESET' ||
        err.code === 'ETIMEDOUT' ||
        err.code === '57P01' ||               // admin shutdown
        err.message.includes('Connection terminated unexpectedly') ||
        err.message.includes('read ECONNRESET') ||
        err.message.includes('timeout');

      if (isTransient && attempt < retries) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 10000); // 1s, 2s, 4s, 8s, 10s
        console.warn(`Database query failed (${err.code}). Retrying in ${delay}ms...`);
        await new Promise(res => setTimeout(res, delay));
      } else {
        throw err;
      }
    }
  }
}

// Override pool.query with the retry wrapper
pool.query = queryWithRetry;

// ---------- Keep‑Alive Ping ----------
let keepAliveInterval;
function startKeepAlive() {
  if (keepAliveInterval) clearInterval(keepAliveInterval);
  keepAliveInterval = setInterval(async () => {
    try {
      await originalQuery('SELECT 1');
      console.log('💚 Database keep‑alive ping successful');
    } catch (err) {
      console.warn('💔 Keep‑alive ping failed:', err.message);
    }
  }, 20000); // every 20 seconds
}

// ---------- Warm‑up ----------
async function warmUp(retries = 5) {
  for (let i = 1; i <= retries; i++) {
    try {
      await originalQuery('SELECT 1');
      console.log('✅ Database warmed up successfully');
      startKeepAlive();
      return true;
    } catch (err) {
      console.warn(`Warmup attempt ${i} failed: ${err.message}`);
      if (i < retries) await new Promise(res => setTimeout(res, 2000 * i));
    }
  }
  console.error('❌ Database warmup completely failed');
  return false;
}

// Start warmup
warmUp();

// Handle unexpected pool errors
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err.message);
});

module.exports = pool;