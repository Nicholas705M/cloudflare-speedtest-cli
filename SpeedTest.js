const LatencyMeasurement = require("./measurements/LatencyMeasurement");
const DownloadMeasurement = require("./measurements/DownloadMeasurement");
const UploadMeasurement = require("./measurements/UploadMeasurement");
const PacketLossMeasurement = require("./measurements/PacketLossMeasurement");
const Results = require("./Results");
const {
  fetchServerLocationData,
  fetchCfCdnCgiTrace,
} = require("./utils/server-info");

class SpeedTest {
  constructor(options) {
    this.options = {
      hostname: "speed.cloudflare.com",
      latencyCount: 20,
      packetLossCount: 1000,
      packetLossTimeout: 3000,
      downloadIterations: { "101000": 5, "1001000": 4, "10001000": 2 },
      uploadIterations: { "11000": 5, "101000": 4, "1001000": 8 },
      ...options, // Override defaults with provided options
    };

    this.results = new Results();
    this.latencyMeasurement = new LatencyMeasurement(this.options.hostname);
    this.downloadMeasurement = new DownloadMeasurement(this.options.hostname);
    this.uploadMeasurement = new UploadMeasurement(this.options.hostname);
    this.packetLossMeasurement = new PacketLossMeasurement(this.options.hostname);
  }

  async run() {
    try {
      console.log("Starting Cloudflare speed test...");

      // 1. Fetch Server Info
      if (!this.options.noServerInfo) {
        const [serverLocationData, cfTraceData] = await Promise.all([
          fetchServerLocationData(),
          fetchCfCdnCgiTrace(),
        ]);

        const city = serverLocationData[cfTraceData.colo];
        this.results.setServerInfo({
          ip: cfTraceData.ip,
          loc: cfTraceData.loc,
          colo: cfTraceData.colo,
          city: city,
        });
        // console.log(`Server location: ${city} (${cfTraceData.colo})`); // Output handled by index.js
        // console.log(`Your IP: ${cfTraceData.ip} (${cfTraceData.loc})`); // Output handled by index.js
      }

      // 2. Measure Latency
      if (!this.options.noLatency) {
        console.log("Measuring latency...");
        const latencyResults = await this.latencyMeasurement.run(this.options.latencyCount);
        this.results.setLatencyResults(latencyResults);
        // console.log(`Latency: ${latencyResults.median.toFixed(2)} ms, Jitter: ${latencyResults.jitter.toFixed(2)} ms`); // Output handled by index.js
      }

      // 3. Measure Download Speed
      if (!this.options.noDownload) {
        console.log("Measuring download speed...");
        const downloadIterations = this.options.downloadIterations || { "101000": 5, "1001000": 4, "10001000": 2 };
        for (const bytes in downloadIterations) {
          await this.downloadMeasurement.run(parseInt(bytes, 10), downloadIterations[bytes]);
        }
        this.results.raw.download = this.downloadMeasurement.getResults(); // Update raw results
        // console.log(`Download speed: ${this.results.getSummary().download} Mbps`); // Output handled by index.js
      }

      // 4. Measure Upload Speed
      if (!this.options.noUpload) {
        console.log("Measuring upload speed...");
        const uploadIterations = this.options.uploadIterations || { "11000": 5, "101000": 4, "1001000": 8 };
        for (const bytes in uploadIterations) {
          await this.uploadMeasurement.run(parseInt(bytes, 10), uploadIterations[bytes]);
        }
        this.results.raw.upload = this.uploadMeasurement.getResults(); // Update raw results
        // console.log(`Upload speed: ${this.results.getSummary().upload} Mbps`); // Output handled by index.js
      }

      // 5. Measure Packet Loss
      if (!this.options.noPacketLoss) {
        console.log("Measuring packet loss...");
        const packetLossResults = await this.packetLossMeasurement.run(
          this.options.packetLossCount,
          this.options.packetLossTimeout
        );
        this.results.setPacketLossResults(packetLossResults);
        // console.log(`Packet Loss: ${this.results.getSummary().packetLoss}%`); // Output handled by index.js
      }

      // Final Summary is retrieved by index.js
      // console.log("\n--- Speed Test Results ---"); // Output handled by index.js
      // console.log(JSON.stringify(finalSummary, null, 2)); // Output handled by index.js
    } catch (error) {
      console.error(`Speed test failed: ${error.message}`);
      throw error; // Re-throw to be caught by index.js
    }
  }
}

module.exports = SpeedTest;
