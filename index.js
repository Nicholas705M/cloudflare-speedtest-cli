#!/usr/bin/env node

const SpeedTest = require("@cloudflare/speedtest").default;

async function runSpeedtest() {
  const speedtest = new SpeedTest({
    autoStart: false, // We will manually start it
    measurements: [
      { type: "packetLoss", numPackets: 1e3, responsesWaitTime: 3000 },
    ],
  });

  speedtest.onFinish = (results) => {
    const summary = results.getSummary();
    const output = {
      download: summary.download,
      upload: summary.upload,
      ping: summary.latency, // Renamed from ping to latency in summary
      jitter: summary.jitter,
      packetLoss: summary.packetLoss,
      loadedLatency: summary.downLoadedLatency, // Using downLoadedLatency as a general loaded latency
      // Add other relevant metrics as needed
    };
    console.log(JSON.stringify(output, null, 2));
  };

  speedtest.onError = (error) => {
    console.error(JSON.stringify({ error: error }, null, 2));
    process.exit(1);
  };

  speedtest.play();
}

runSpeedtest();
