const https = require("https");
const { performance } = require("perf_hooks");

/**
 * Makes an HTTPS request and captures timing information.
 * @param {object} options - HTTPS request options (hostname, path, method, headers).
 * @param {string} [data=""] - Data to send in the request body (for POST requests).
 * @returns {Promise<Array<number|string>>} A promise that resolves with an array of timing data:
 *   [started, ttfb, ended, serverTime, serverIp]
 */
function request(options, data = "") {
  let started;
  let ttfb;
  let ended;
  let serverIp = null;

  // Use a new Agent for each request to prevent connection reuse, ensuring fresh timing
  options.agent = new https.Agent(options);

  return new Promise((resolve, reject) => {
    started = performance.now();
    const req = https.request(options, (res) => {
      res.once("readable", () => {
        ttfb = performance.now(); // Time to first byte
      });
      res.on("data", () => {}); // Consume data to ensure 'end' event fires
      res.on("end", () => {
        ended = performance.now(); // Request ended

        const serverTimingHeader = res.headers["server-timing"];
        let serverTime = 0;
        if (serverTimingHeader) {
          const match = serverTimingHeader.match(/dur=([0-9.]+)/);
          if (match && match[1]) {
            serverTime = parseFloat(match[1]);
          }
        }
        resolve([started, ttfb, ended, serverTime, serverIp]);
      });
    });

    req.on("socket", (socket) => {
      socket.on("connect", () => {
        serverIp = socket.remoteAddress;
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

/**
 * Makes an HTTPS GET request and returns the response body as a string.
 * @param {string} hostname - The hostname of the server.
 * @param {string} path - The path of the resource.
 * @returns {Promise<string>} A promise that resolves with the response body.
 */
async function get(hostname, path) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname,
        path,
        method: "GET",
      },
      (res) => {
        const body = [];
        res.on("data", (chunk) => {
          body.push(chunk);
        });
        res.on("end", () => {
          try {
            resolve(Buffer.concat(body).toString());
          } catch (e) {
            reject(e);
          }
        });
      }
    );

    req.on("error", (err) => {
      reject(err);
    });

    req.end();
  });
}

module.exports = {
  request,
  get,
};
