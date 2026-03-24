const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    // Find and click the visible Submit button
    const submitBtn = await page.$('button:has-text("Submit"), input[value="Submit"], div:has-text("Submit")');
    if (!submitBtn) throw new Error('Submit button not found');

    const isVisible = await submitBtn.isVisible();
    console.log(`Submit button visible: ${isVisible}`);

    await submitBtn.click();
    console.log('Clicked Submit');
    await page.waitForTimeout(2000);

    console.log(JSON.stringify({ success: true, message: 'Submit clicked' }));

  } catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
  } finally {
    await browser.close();
  }
})();