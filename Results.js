const stats = require("./utils/stats");
const { classifyConnection } = require("./utils/classification");

class Results {
  constructor() {
    this.raw = {
      latency: null,
      download: [],
      upload: [],
      packetLoss: null,
      serverInfo: null,
    };
  }

  setLatencyResults(results) {
    this.raw.latency = results;
  }

  addDownloadMeasurement(measurement) {
    this.raw.download.push(measurement);
  }

  addUploadMeasurement(measurement) {
    this.raw.upload.push(measurement);
  }

  setPacketLossResults(results) {
    this.raw.packetLoss = results;
  }

  setServerInfo(info) {
    this.raw.serverInfo = info;
  }

  getSummary() {
    const summary = {
      download:
        this.raw.download.length > 0
          ? stats.quartile(this.raw.download, 0.9).toFixed(2)
          : null,
      upload:
        this.raw.upload.length > 0
          ? stats.quartile(this.raw.upload, 0.9).toFixed(2)
          : null,
      ping: this.raw.latency ? this.raw.latency.median.toFixed(2) : null,
      jitter: this.raw.latency ? this.raw.latency.jitter.toFixed(2) : null,
      packetLoss: this.raw.packetLoss
        ? (this.raw.packetLoss.packetLoss * 100).toFixed(2)
        : null, // Convert to percentage
      serverLocation: this.raw.serverInfo
        ? `${this.raw.serverInfo.city} (${this.raw.serverInfo.colo})`
        : null,
      yourIp: this.raw.serverInfo
        ? `${this.raw.serverInfo.ip} (${this.raw.serverInfo.loc})`
        : null,
    };

    // Add classification
    summary.classification = classifyConnection({
      download: parseFloat(summary.download),
      upload: parseFloat(summary.upload),
      ping: parseFloat(summary.ping),
      jitter: parseFloat(summary.jitter),
      packetLoss: parseFloat(summary.packetLoss) / 100, // Convert back to ratio for classification
    });

    return summary;
  }

  getRawResults() {
    return this.raw;
  }
}

module.exports = Results;
