const { CronJob } = require('cron');
const run = require('./run');

const job = new CronJob({
  cronTime: '0 00 19 * * *', // UTC time used as server this runs on is UTC
  onTick: run,
});

job.start();
console.log('Started...');
