const { Pool } = require('pg');
const format = require('pg-format');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

function formatDevEui(devEui) {
  return devEui.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getWeekStartDate(ts) {
  const date = new Date(ts);
  const first = date.getDate() - date.getDay(); // Sunday
  const sunday = new Date(date.setDate(first));
  sunday.setHours(0, 0, 0, 0);
  return sunday;
}

function getTableSuffix(timestamp) {
  const now = new Date();
  const tsDate = new Date(timestamp);
  const nowWeek = getWeekStartDate(now);
  const tsWeek = getWeekStartDate(tsDate);
  if (nowWeek.getTime() === tsWeek.getTime()) {
    return '_weekly';
  }
  return `_${tsDate.getFullYear()}_${String(tsDate.getMonth() + 1).padStart(2, '0')}`;
}

async function ensureTableExists(tableName) {
  const query = format(`
    CREATE TABLE IF NOT EXISTS %I (
      id SERIAL PRIMARY KEY,
      timestamp TIMESTAMPTZ NOT NULL,
      data JSONB NOT NULL
    );
  `, tableName);
  await pool.query(query);
}

async function insertDecodedMessage(devEui, decodedData, timestamp) {
  const safeDevEui = formatDevEui(devEui);
  const suffix = getTableSuffix(timestamp);
  const tableName = `data_dev_${safeDevEui}${suffix}`;

  await ensureTableExists(tableName);
  await pool.query(
    format('INSERT INTO %I (timestamp, data) VALUES ($1, $2)', tableName),
    [new Date(timestamp), decodedData]
  );
}

module.exports = { insertDecodedMessage };
