const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@db:5432/postgres'
});

async function migrateData() {
  const client = await pool.connect();
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'move_weekly_to_historical.sql'), 'utf8');
    await client.query(sql);
    console.log(`[${new Date().toISOString()}] ✅ Migration successful`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] ❌ Migration error:`, err);
  } finally {
    client.release();
  }
}

module.exports = migrateData;
