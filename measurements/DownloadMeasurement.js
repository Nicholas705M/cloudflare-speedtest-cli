const { request } = require('../utils/network');
const stats = require('../utils/stats');

class DownloadMeasurement {
  constructor(hostname = "speed.cloudflare.com") {
    this.hostname = hostname;
    this.measurements = [];
  }

  /**
   * Measures download speed by performing HTTP GET requests for a given byte size.
   * @param {number} bytes - The size of the file to download in bytes.
   * @param {number} iterations - The number of times to perform the download.
   * @returns {Promise<Array<number>>} A promise that resolves with an array of download speeds in Mbps.
   */
  async run(bytes, iterations) {
    const currentMeasurements = [];
    for (let i = 0; i < iterations; i += 1) {
      try {
        const options = {
          hostname: this.hostname,
          path: `/__down?bytes=${bytes}`,
          method: "GET",
        };
        const response = await request(options);
        // response: [started, ttfb, ended, serverTime]
        // Transfer time = Request ended time - Time to first byte
        const transferTime = response[2] - response[1];
        const speedMbps = (bytes * 8) / (transferTime / 1000) / 1e6; // Convert to Mbps
        currentMeasurements.push(speedMbps);
      } catch (error) {
        console.error(`Error measuring download (${bytes}B): ${error.message}`);
      }
    }
    this.measurements.push(...currentMeasurements);
    return currentMeasurements;
  }

  /**
   * Returns all collected download measurements.
   * @returns {Array<number>} An array of download speeds in Mbps.
   */
  getResults() {
    return this.measurements;
  }
}

module.exports = DownloadMeasurement;
