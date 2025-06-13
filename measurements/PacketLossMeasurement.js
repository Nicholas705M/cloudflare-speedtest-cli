const { spawn } = require("child_process");
const os = require("os");

class PacketLossMeasurement {
  constructor(host = "speed.cloudflare.com") {
    this.host = host;
    this.measurements = [];
  }

  /**
   * Measures ICMP packet loss by executing the system's `ping` command.
   * @param {number} numPackets - The number of ICMP packets to send.
   * @param {number} timeoutMs - Timeout for each ping in milliseconds.
   * @returns {Promise<object>} A promise that resolves with packet loss details.
   */
  async run(numPackets = 1000, timeoutMs = 3000) {
    this.measurements = [];
    const pingPromises = [];
    let successfulPings = 0;
    let failedPings = 0;

    const isWindows = os.platform() === "win32";
    const pingCommand = "ping";

    for (let i = 0; i < numPackets; i++) {
      const pingArgs = isWindows
        ? ["-n", "1", "-w", String(timeoutMs), this.host]
        : ["-c", "1", "-W", String(timeoutMs / 1000), this.host]; // -W is in seconds for macOS/Linux

      const pingPromise = new Promise((resolve) => {
        const child = spawn(pingCommand, pingArgs);
        let stdout = "";
        let stderr = "";

        child.stdout.on("data", (data) => {
          stdout += data.toString();
        });

        child.stderr.on("data", (data) => {
          stderr += data.toString();
        });

        child.on("error", (err) => {
          console.error(
            `PacketLossMeasurement: Spawn error for ping ${i + 1}: ${
              err.message
            }`
          );
          failedPings++;
          resolve(false); // Indicate failure
        });

        child.on("close", (code) => {
          if (code === 0) {
            successfulPings++;
            resolve(true); // Indicate success
          } else {
            failedPings++;
            resolve(false); // Indicate failure
          }
        });
      });
      pingPromises.push(pingPromise);
    }

    await Promise.all(pingPromises);

    const totalSent = numPackets;
    const totalReceived = successfulPings;
    const totalLost = failedPings;
    const packetLossRatio = totalSent > 0 ? totalLost / totalSent : 0;

    this.measurements.push(packetLossRatio);

    return {
      packetLoss: packetLossRatio,
      totalMessages: totalSent,
      numMessagesSent: totalSent, // All packets were attempted to be sent
      lostMessages: totalLost,
      // rawOutput and errorOutput are not easily aggregated for concurrent pings
      exitCode: totalLost === 0 ? 0 : 1, // 0 if no loss, 1 if any loss
    };
  }
}

module.exports = PacketLossMeasurement;
