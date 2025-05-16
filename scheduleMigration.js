const cron = require('node-cron');
const migrateData = require('../db/migrateWeeklyToHistorical');

// Schedule: every Sunday at 02:00 AM
cron.schedule('0 2 * * 0', async () => {
  console.log(`[${new Date().toISOString()}] 🔄 Running weekly migration`);
  await migrateData();
});
