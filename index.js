#!/usr/bin/env node

const SpeedTest = require("./SpeedTest");
const minimist = require("minimist"); // For parsing command-line arguments

async function main() {
  const argv = minimist(process.argv.slice(2), {
    boolean: [
      "json",
      "download", // Now controls if download runs
      "upload", // Now controls if upload runs
      "latency", // Now controls if latency runs
      "packet-loss", // Now controls if packet loss runs
      "server-info", // Now controls if server info runs
      "version", // Add version flag
      "v", // Short alias for version
    ],
    default: {
      json: false,
      download: true, // Run by default
      upload: true, // Run by default
      latency: true, // Run by default
      "packet-loss": true, // Run by default
      "server-info": true, // Run by default
      version: false,
      v: false,
    },
  });

  // Read package.json for version
  const packageJson = require("./package.json");
  const cliVersion = packageJson.version;

  if (argv.version || argv.v) {
    console.log(cliVersion);
    process.exit(0);
  }

  const options = {
    // Flags to enable/disable specific measurements
    runDownload: argv["download"],
    runUpload: argv["upload"],
    runLatency: argv["latency"],
    runPacketLoss: argv["packet-loss"],
    runServerInfo: argv["server-info"],
    jsonOutput: argv["json"],
    hostname: argv["hostname"] || "speed.cloudflare.com",
    latencyCount: argv["latency-count"] ? parseInt(argv["latency-count"]) : 20,
    packetLossCount: argv["packet-loss-count"]
      ? parseInt(argv["packet-loss-count"])
      : 1000,
    packetLossTimeout: argv["packet-loss-timeout"]
      ? parseInt(argv["packet-loss-timeout"])
      : 3000,
    downloadIterations: argv["download-iterations"]
      ? parseInt(argv["download-iterations"])
      : null, // Will handle default in SpeedTest.js
    uploadIterations: argv["upload-iterations"]
      ? parseInt(argv["upload-iterations"])
      : null, // Will handle default in SpeedTest.js
  };

  const speedTest = new SpeedTest(options);
  try {
    await speedTest.run();
    const summary = speedTest.results.getSummary();

    if (options.jsonOutput) {
      console.log(JSON.stringify(summary, null, 2));
    } else {
      // Human-readable output
      console.log("\n--- Cloudflare Speed Test Results ---");
      if (summary.serverLocation)
        console.log(`Server Location: ${summary.serverLocation}`);
      if (summary.yourIp) console.log(`Your IP: ${summary.yourIp}`);
      if (summary.ping !== null) console.log(`Ping: ${summary.ping} ms`);
      if (summary.jitter !== null) console.log(`Jitter: ${summary.jitter} ms`);
      if (summary.download !== null)
        console.log(`Download: ${summary.download} Mbps`);
      if (summary.upload !== null)
        console.log(`Upload: ${summary.upload} Mbps`);
      if (summary.packetLoss !== null)
        console.log(`Packet Loss: ${summary.packetLoss}%`);
    }
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }, null, 2));
    process.exit(1);
  }
}

main();
