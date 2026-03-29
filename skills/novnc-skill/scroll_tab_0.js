const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0]; // Tab 0

  try {
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollBy(0, 800));
    console.log(JSON.stringify({ success: true, message: 'Scrolled 9GAG tab 0' }));
  } catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
  } finally {
    await browser.close();
  }
})();