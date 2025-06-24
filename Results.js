const stats = require("./utils/stats");

class Results {
  constructor() {
    this.raw = {
      latency: null,
      download: [],
      upload: [],
      packetLoss: null,
      server: {
        city: null,
        colo: null,
        ip: null,
      },
      clientIp: null,
      totalDuration: null,
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

  setClientAndServerLocationInfo(info) {
    this.raw.server.city = info.city;
    this.raw.server.colo = info.colo;
    this.raw.clientIp = info.clientIp;
  }

  setServerIp(ip) {
    this.raw.server.ip = ip;
  }

  setTotalDuration(duration) {
    this.raw.totalDuration = duration;
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
      server: {
        city: this.raw.server.city,
        colo: this.raw.server.colo,
        ip: this.raw.server.ip, // Renamed to server.ip
      },
      clientIp: this.raw.clientIp || null, // Top-level client IP
      totalDurationMs: this.raw.totalDuration
        ? this.raw.totalDuration.toFixed(2)
        : null,
    };

    return summary;
  }

  getRawResults() {
    return this.raw;
  }
}

module.exports = Results;
