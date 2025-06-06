# Cloudflare Speedtest CLI

A command-line interface (CLI) tool to perform speed tests using the `Nicholas705M/cloudflare-speedtest` library, which includes ICMP packet loss measurement. The results are output in a structured JSON format.

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
  "download": 95.75,
  "upload": 80.23,
  "ping": 15.23,
  "jitter": 2.1,
  "packetLoss": 0.05,
  "loadedLatency": 30.5
}
```

## Error Handling

In case of an error during the speed test, the CLI will output a JSON object with an `error` key to `stderr` and exit with a non-zero status code.

```json
{
  "error": "Error message details"
```
