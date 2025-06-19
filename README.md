# Cloudflare Speedtest CLI

A command-line interface (CLI) tool to measure internet connection speed (download, upload, ping, jitter, packet loss) using Cloudflare's speed test endpoints. This CLI is built natively in Node.js and outputs results in a structured JSON format, along with connection quality classifications.

## Installation

1.  **Clone this repository**:

    ```bash
    git clone https://github.com/Nicholas705M/cloudflare-speedtest-cli.git
    cd cloudflare-speedtest-cli
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

## Usage

Run the CLI directly:

```bash
./index.js
```

Or using `node`:

```bash
node index.js
```

### Example JSON Output

```json
{
  "download": "95.75", // Mbps
  "upload": "80.23", // Mbps
  "ping": "15.23", // ms
  "jitter": "2.10", // ms
  "packetLoss": "0.00", // %
  "serverLocation": "Los Angeles (LAX)",
  "yourIp": "192.0.2.1 (LAX)"
}
```

## Error Handling

In case of an error during the speed test, the CLI will output a JSON object with an `error` key to `stderr` and exit with a non-zero status code.

```json
{
  "error": "Error message details"
}
```
