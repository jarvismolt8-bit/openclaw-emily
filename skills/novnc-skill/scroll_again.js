const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    // Scroll down by 600 pixels
    await page.evaluate(() => window.scrollBy(0, 600));
    console.log(JSON.stringify({ success: true, message: 'Scrolled down 600px' }));
  } catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
  } finally {
    await browser.close();
  }
})();