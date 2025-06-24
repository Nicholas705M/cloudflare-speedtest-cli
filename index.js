#!/usr/bin/env node

const SpeedTest = require("./SpeedTest");
const minimist = require("minimist");

async function main() {
  const argv = minimist(process.argv.slice(2), {
    boolean: [
      'json',
      'download',
      'upload',
      'latency',
      'packet-loss',
      'server-info',
      'version',
      'v'
    ],
    default: {
      'json': false,
      'download': true,
      'upload': true,
      'latency': true,
      'packet-loss': true,
      'server-info': true,
      'version': false,
      'v': false
    }
  });

  const packageJson = require('./package.json');
  const cliVersion = packageJson.version;

  if (argv.version || argv.v) {
    console.log(cliVersion);
    process.exit(0);
  }

  const options = {
    runDownload: argv['download'],
    runUpload: argv['upload'],
    runLatency: argv['latency'],
    runPacketLoss: argv['packet-loss'],
    runServerInfo: argv['server-info'],
    jsonOutput: argv['json'],
    hostname: argv['hostname'] || "speed.cloudflare.com",
    latencyCount: argv['latency-count'] ? parseInt(argv['latency-count']) : 20,
    packetLossCount: argv['packet-loss-count']
      ? parseInt(argv['packet-loss-count'])
      : 1000,
    packetLossTimeout: argv['packet-loss-timeout']
      ? parseInt(argv['packet-loss-timeout'])
      : 3000,
    downloadIterations: argv['download-iterations']
      ? parseInt(argv['download-iterations'])
      : null,
    uploadIterations: argv['upload-iterations']
      ? parseInt(argv['upload-iterations'])
      : null,
  };

  const speedTest = new SpeedTest(options);
  try {
    await speedTest.run();
    const summary = speedTest.results.getSummary();

    if (options.jsonOutput) {
      console.log(JSON.stringify(summary, null, 2));
    } else {
      console.log("\n--- Cloudflare Speed Test Results ---");
      if (summary.server && summary.server.city)
        console.log(`Server Location: ${summary.server.city} (${summary.server.colo})`);
      if (summary.server && summary.server.ip)
        console.log(`Server IP: ${summary.server.ip}`);
      if (summary.clientIp)
        console.log(`Your IP: ${summary.clientIp}`);
      if (summary.ping !== null) console.log(`Ping: ${summary.ping} ms`);
      if (summary.jitter !== null) console.log(`Jitter: ${summary.jitter} ms`);
      if (summary.download !== null)
        console.log(`Download: ${summary.download} Mbps`);
      if (summary.upload !== null)
        console.log(`Upload: ${summary.upload} Mbps`);
      if (summary.packetLoss !== null)
        console.log(`Packet Loss: ${summary.packetLoss}%`);
      if (summary.totalDurationMs !== null)
        console.log(`Total Duration: ${summary.totalDurationMs} ms`);
    }
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }, null, 2));
    process.exit(1);
  }
}

main();
