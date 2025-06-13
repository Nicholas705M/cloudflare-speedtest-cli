const { request } = require("../utils/network");
const stats = require("../utils/stats");

class LatencyMeasurement {
  constructor(hostname = "speed.cloudflare.com") {
    this.hostname = hostname;
    this.measurements = [];
  }

  /**
   * Measures latency by performing a series of small HTTP GET requests.
   * @param {number} numPackets - The number of latency measurements to perform.
   * @returns {Promise<object>} A promise that resolves with latency statistics (min, max, average, median, jitter).
   */
  async run(numPackets = 20) {
    this.measurements = [];
    for (let i = 0; i < numPackets; i += 1) {
      try {
        const options = {
          hostname: this.hostname,
          path: `/__down?bytes=0`, // Smallest possible download to measure TTFB
          method: "GET",
        };
        const response = await request(options);
        // response: [started, ttfb, ended, serverTime]
        // Network latency = (Time to first byte - Request start time) - Server processing time
        const networkLatency = response[1] - response[0] - response[3];
        this.measurements.push(networkLatency);
      } catch (error) {
        console.error(`Error measuring latency: ${error.message}`);
      }
    }

    return {
      min: stats.min(this.measurements),
      max: stats.max(this.measurements),
      average: stats.average(this.measurements),
      median: stats.median(this.measurements),
      jitter: stats.jitter(this.measurements),
      raw: this.measurements,
    };
  }
}

module.exports = LatencyMeasurement;
