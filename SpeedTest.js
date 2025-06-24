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
      downloadIterations: { 101000: 5, 1001000: 4, 10001000: 2 },
      uploadIterations: { 11000: 5, 101000: 4, 1001000: 8 },
      ...options, // Override defaults with provided options
    };

    this.results = new Results();
    this.latencyMeasurement = new LatencyMeasurement(this.options.hostname);
    this.downloadMeasurement = new DownloadMeasurement(this.options.hostname);
    this.uploadMeasurement = new UploadMeasurement(this.options.hostname);
    this.packetLossMeasurement = new PacketLossMeasurement(
      this.options.hostname
    );
  }

  async run() {
    let testStartTime; // Declare here to be accessible in finally
    let serverIp = null; // To store the resolved server IP

    try {
      // Only print progress messages if not in JSON output mode
      if (!this.options.jsonOutput) {
        console.log("Starting Cloudflare speed test...");
      }

      testStartTime = performance.now(); // Start overall test timer

      // 1. Fetch Server Info
      if (this.options.runServerInfo) {
        // Use runServerInfo
        const [serverLocationData, cfTraceData] = await Promise.all([
          fetchServerLocationData(),
          fetchCfCdnCgiTrace(),
        ]);

        const city = serverLocationData[cfTraceData.colo];
        this.results.setClientAndServerLocationInfo({
          ip: cfTraceData.ip || null, // Ensure ip is passed, or null if undefined
          colo: cfTraceData.colo,
          city: city,
        });
        if (!this.options.jsonOutput) {
          console.log(`Server location: ${city} (${cfTraceData.colo})`);
          console.log(`Your IP: ${cfTraceData.ip || "N/A"}`);
        }
      }

      // 2. Measure Latency
      if (this.options.runLatency) {
        // Use runLatency
        if (!this.options.jsonOutput) {
          console.log("Measuring latency...");
        }
        const latencyResults = await this.latencyMeasurement.run(
          this.options.latencyCount
        );
        this.results.setLatencyResults(latencyResults);
        // Capture server IP from the first successful request
        if (
          !serverIp &&
          latencyResults.raw.length > 0 &&
          latencyResults.raw[0][4]
        ) {
          serverIp = latencyResults.raw[0][4]; // Assuming the 5th element is serverIp
          this.results.setServerIp(serverIp);
        }
        if (!this.options.jsonOutput) {
          console.log(
            `Latency: ${latencyResults.median.toFixed(
              2
            )} ms, Jitter: ${latencyResults.jitter.toFixed(2)} ms`
          );
        }
      }

      // 3. Measure Download Speed
      if (this.options.runDownload) {
        // Use runDownload
        if (!this.options.jsonOutput) {
          console.log("Measuring download speed...");
        }
        const downloadChunkSizes = [101000, 1001000, 10001000]; // 100KB, 1MB, 10MB
        const defaultDownloadIterations = {
          101000: 5,
          1001000: 4,
          10001000: 2,
        };

        for (const bytes of downloadChunkSizes) {
          const iterations =
            this.options.downloadIterations !== null &&
            this.options.downloadIterations !== undefined
              ? this.options.downloadIterations
              : defaultDownloadIterations[bytes];
          await this.downloadMeasurement.run(bytes, iterations);
        }
        this.results.raw.download = this.downloadMeasurement.getResults(); // Update raw results
        if (!this.options.jsonOutput) {
          console.log(
            `Download speed: ${this.results.getSummary().download} Mbps`
          );
        }
      }

      // 4. Measure Upload Speed
      if (this.options.runUpload) {
        // Use runUpload
        if (!this.options.jsonOutput) {
          console.log("Measuring upload speed...");
        }
        const uploadChunkSizes = [11000, 101000, 1001000]; // 10KB, 100KB, 1MB
        const defaultUploadIterations = { 11000: 5, 101000: 4, 1001000: 8 };

        for (const bytes of uploadChunkSizes) {
          const iterations =
            this.options.uploadIterations !== null &&
            this.options.uploadIterations !== undefined
              ? this.options.uploadIterations
              : defaultUploadIterations[bytes];
          await this.uploadMeasurement.run(bytes, iterations);
        }
        this.results.raw.upload = this.uploadMeasurement.getResults(); // Update raw results
        if (!this.options.jsonOutput) {
          console.log(`Upload speed: ${this.results.getSummary().upload} Mbps`);
        }
      }

      // 5. Measure Packet Loss
      if (this.options.runPacketLoss) {
        // Use runPacketLoss
        if (!this.options.jsonOutput) {
          console.log("Measuring packet loss...");
        }
        const packetLossResults = await this.packetLossMeasurement.run(
          this.options.packetLossCount,
          this.options.packetLossTimeout
        );
        this.results.setPacketLossResults(packetLossResults);
        if (!this.options.jsonOutput) {
          console.log(`Packet Loss: ${this.results.getSummary().packetLoss}%`);
        }
      }

      // Final Summary is retrieved by index.js, no need to print here
    } catch (error) {
      console.error(`Speed test failed: ${error.message}`);
      throw error; // Re-throw to be caught by index.js
    } finally {
      let testEndTime = performance.now(); // End overall test timer
      this.results.setTotalDuration(testEndTime - testStartTime);
    }
  }
}

module.exports = SpeedTest;
