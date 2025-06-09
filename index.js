#!/usr/bin/env node

const { chromium } = require('playwright');
const path = require('path');

async function runSpeedtestCLI() {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // Listen for console messages from the page
    page.on('console', async (msg) => {
      const text = msg.text();
      try {
        const jsonOutput = JSON.parse(text);
        // Check if it's the speedtest result or an error
        if (jsonOutput.download || jsonOutput.error) {
          console.log(JSON.stringify(jsonOutput, null, 2));
          await browser.close();
          process.exit(jsonOutput.error ? 1 : 0);
        }
      } catch (e) {
        // Ignore non-JSON console messages
        // console.log(`Browser console: ${text}`);
      }
    });

    // Navigate to the local HTML file
    const htmlFilePath = `file://${path.resolve(__dirname, 'speedtest.html')}`;
    await page.goto(htmlFilePath);

    // Keep the script running until results are received or timeout
    // The onFinish/onError handlers in speedtest.html will close the browser
    // and exit the process.
    await new Promise(() => {}); // This promise will never resolve, keeping the process alive
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }, null, 2));
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
}

runSpeedtestCLI();
