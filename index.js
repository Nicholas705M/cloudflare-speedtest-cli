#!/usr/bin/env node

const SpeedTest = require('./SpeedTest');

async function main() {
  const speedTest = new SpeedTest();
  try {
    await speedTest.run();
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }, null, 2));
    process.exit(1);
  }
}

main();
