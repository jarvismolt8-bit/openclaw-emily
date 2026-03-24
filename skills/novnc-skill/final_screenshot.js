const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    const screenshot = await page.screenshot({ fullPage: true, path: '/tmp/timeout_final.png' });
    console.log(`Screenshot saved: /tmp/timeout_final.png (${screenshot.length} bytes)`);
  } catch (error) {
    console.log(JSON.stringify({ error: error.message }));
  } finally {
    await browser.close();
  }
})();