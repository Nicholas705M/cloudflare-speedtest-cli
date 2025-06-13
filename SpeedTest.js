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
  constructor(hostname = "speed.cloudflare.com") {
    this.hostname = hostname;
    this.results = new Results();
    this.latencyMeasurement = new LatencyMeasurement(this.hostname);
    this.downloadMeasurement = new DownloadMeasurement(this.hostname);
    this.uploadMeasurement = new UploadMeasurement(this.hostname);
    this.packetLossMeasurement = new PacketLossMeasurement(this.hostname);
  }

  async run() {
    try {
      console.log("Starting Cloudflare speed test...");

      // 1. Fetch Server Info
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
      console.log(`Server location: ${city} (${cfTraceData.colo})`);
      console.log(`Your IP: ${cfTraceData.ip} (${cfTraceData.loc})`);

      // 2. Measure Latency
      console.log("Measuring latency...");
      const latencyResults = await this.latencyMeasurement.run(20);
      this.results.setLatencyResults(latencyResults);
      console.log(
        `Latency: ${latencyResults.median.toFixed(
          2
        )} ms, Jitter: ${latencyResults.jitter.toFixed(2)} ms`
      );

      // 3. Measure Download Speed
      console.log("Measuring download speed...");
      await this.downloadMeasurement.run(101000, 5); // 100KB, reduced iterations
      await this.downloadMeasurement.run(1001000, 4); // 1MB, reduced iterations
      await this.downloadMeasurement.run(10001000, 2); // 10MB, reduced iterations
      // Removed larger download tests
      this.results.raw.download = this.downloadMeasurement.getResults(); // Update raw results
      console.log(`Download speed: ${this.results.getSummary().download} Mbps`);

      // 4. Measure Upload Speed
      console.log("Measuring upload speed...");
      await this.uploadMeasurement.run(11000, 5); // 10KB, reduced iterations
      await this.uploadMeasurement.run(101000, 4); // 100KB, reduced iterations
      // Removed larger upload tests
      this.results.raw.upload = this.uploadMeasurement.getResults(); // Update raw results
      console.log(`Upload speed: ${this.results.getSummary().upload} Mbps`);

      // 5. Measure Packet Loss
      console.log("Measuring packet loss...");
      const packetLossResults = await this.packetLossMeasurement.run(
        1000,
        3000
      );
      this.results.setPacketLossResults(packetLossResults);
      console.log(`Packet Loss: ${this.results.getSummary().packetLoss}%`);

      // Final Summary
      const finalSummary = this.results.getSummary();
      console.log("\n--- Speed Test Results ---");
      console.log(JSON.stringify(finalSummary, null, 2));
    } catch (error) {
      console.error(`Speed test failed: ${error.message}`);
      throw error; // Re-throw to be caught by index.js
    }
  }
}

module.exports = SpeedTest;
