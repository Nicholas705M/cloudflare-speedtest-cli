# Cloudflare Speedtest CLI

A command-line interface (CLI) tool to measure internet connection speed (download, upload, ping, jitter, packet loss) using Cloudflare's speed test endpoints. This CLI is built natively in Node.js and outputs results in a structured JSON format, along with connection quality classifications.

## Installation

### Global Installation (Recommended for CLI usage)

To install the CLI globally and run it from any directory:

```bash
npm install -g cloudflare-speedtest-cli
```

### Local Project Usage

If you prefer to install it as a local dependency within another Node.js project:

1.  **Install as a local dependency**:
    ```bash
    npm install cloudflare-speedtest-cli
    ```
2.  **Run using npx**:
    ```bash
    npx cloudflare-speedtest
    ```

## Usage

Once installed globally, run the CLI:

```bash
cloudflare-speedtest
```

### Example JSON Output

```json
{
  "download": "95.75", // Mbps
  "upload": "80.23", // Mbps
  "ping": "15.23", // ms
  "jitter": "2.10", // ms
  "packetLoss": "0.00", // %
  "server": {
    "city": "Los Angeles",
    "colo": "LAX",
    "ip": "104.20.20.20" // Example server IP
  },
  "clientIp": "192.0.2.1", // Your IP
  "totalDurationMs": "5000.00" // Total test duration in milliseconds
}
```

## Error Handling

In case of an error during the speed test, the CLI will output a JSON object with an `error` key to `stderr` and exit with a non-zero status code.

```json
{
  "error": "Error message details"
}
```
