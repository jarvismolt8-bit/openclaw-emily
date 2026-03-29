const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[2]; // Tab 2 = Reddit

  try {
    await page.waitForTimeout(1000);

    // Get current URL before going back
    const beforeUrl = page.url();
    console.log('Before back:', beforeUrl);

    // Use browser back
    await page.goBack();
    await page.waitForTimeout(2000);

    const afterUrl = page.url();
    console.log('After back:', afterUrl);

    const success = beforeUrl !== afterUrl;
    console.log(JSON.stringify({ success, message: success ? 'Back navigation worked' : 'URL unchanged' }));

  } catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
  } finally {
    await browser.close();
  }
})();