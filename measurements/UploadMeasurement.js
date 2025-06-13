const { request } = require('../utils/network');
const stats = require('../utils/stats');

class UploadMeasurement {
  constructor(hostname = "speed.cloudflare.com") {
    this.hostname = hostname;
    this.measurements = [];
  }

  /**
   * Measures upload speed by performing HTTP POST requests for a given byte size.
   * @param {number} bytes - The size of the payload to upload in bytes.
   * @param {number} iterations - The number of times to perform the upload.
   * @returns {Promise<Array<number>>} A promise that resolves with an array of upload speeds in Mbps.
   */
  async run(bytes, iterations) {
    const currentMeasurements = [];
    const data = "0".repeat(bytes); // Dummy payload

    for (let i = 0; i < iterations; i += 1) {
      try {
        const options = {
          hostname: this.hostname,
          path: "/__up",
          method: "POST",
          headers: {
            "Content-Length": Buffer.byteLength(data),
          },
        };
        const response = await request(options, data);
        // response: [started, ttfb, ended, serverTime]
        // For upload, serverTime from the header is often the most reliable transfer time
        const transferTime = response[3]; // serverTime
        const speedMbps = (bytes * 8) / (transferTime / 1000) / 1e6; // Convert to Mbps
        currentMeasurements.push(speedMbps);
      } catch (error) {
        console.error(`Error measuring upload (${bytes}B): ${error.message}`);
      }
    }
    this.measurements.push(...currentMeasurements);
    return currentMeasurements;
  }

  /**
   * Returns all collected upload measurements.
   * @returns {Array<number>} An array of upload speeds in Mbps.
   */
  getResults() {
    return this.measurements;
  }
}

module.exports = UploadMeasurement;
