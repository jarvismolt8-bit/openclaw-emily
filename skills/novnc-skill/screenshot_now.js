const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    // Take screenshot and save to file
    const screenshot = await page.screenshot({ fullPage: true, path: '/tmp/timeout_screenshot.png' });
    console.log(`Screenshot saved: /tmp/timeout_screenshot.png (${screenshot.length} bytes)`);
    console.log('Screenshot also available as base64 for viewing');
  } catch (error) {
    console.log(JSON.stringify({ error: error.message }));
  } finally {
    await browser.close();
  }
})();