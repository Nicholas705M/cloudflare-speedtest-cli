#!/usr/bin/env node

const { chromium } = require("playwright");
const path = require("path");
const http = require("http");
const handler = require("serve-handler");

const PORT = 3000;

async function runSpeedtestCLI() {
  let browser;
  let server;

  try {
    // Start a local HTTP server
    server = http.createServer((request, response) => {
      // Serve files from the current directory and node_modules
      return handler(request, response, {
        public: path.resolve(__dirname),
        rewrites: [
          {
            source: "/node_modules/:path*",
            destination: "/node_modules/:path*",
          },
        ],
      });
    });

    await new Promise((resolve) => {
      server.listen(PORT, () => {
        console.log(`Local server running at http://localhost:${PORT}`);
        resolve();
      });
    });

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Listen for all console messages from the page
    page.on("console", async (msg) => {
      const text = msg.text();
      console.log(`[Browser Console] ${msg.type().toUpperCase()}: ${text}`); // Log all messages

      try {
        const jsonOutput = JSON.parse(text);
        // Check if it's the speedtest result or an error
        if (jsonOutput.download || jsonOutput.error) {
          console.log(JSON.stringify(jsonOutput, null, 2));
          await browser.close();
          server.close();
          process.exit(jsonOutput.error ? 1 : 0);
        }
      } catch (e) {
        // If it's not valid JSON, it's likely an informational message, so we just log it above.
        // No need to log parsing errors here unless we specifically want to debug malformed JSON.
      }
    });

    // Listen for page errors (unhandled exceptions in the browser context)
    page.on("pageerror", (error) => {
      console.error(
        JSON.stringify(
          {
            browserPageError: error.message,
            stack: error.stack,
            errorObject: error,
          },
          null,
          2
        )
      );
      // Do not exit here, let the main logic handle the timeout or speedtest.onError
    });

    // Navigate to the local HTML file served by the HTTP server
    const htmlFilePath = `http://localhost:${PORT}/speedtest.html`;
    await page.goto(htmlFilePath);
    console.log(`Navigated to ${htmlFilePath}`);

    // Set a timeout to prevent indefinite hanging
    const timeoutPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Speed test timed out after 120 seconds."));
      }, 120000); // 2 minutes timeout
      // Clear timeout if browser closes
      page.once("close", () => clearTimeout(timeout));
    });

    await timeoutPromise;
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }, null, 2));
    // Ensure server is closed on error before exiting
    if (server && server.listening) {
      server.close();
    }
    process.exit(1);
  } finally {
    if (browser && browser.isConnected()) {
      await browser.close();
    }
    if (server && server.listening) {
      server.close();
    }
  }
}

runSpeedtestCLI();
