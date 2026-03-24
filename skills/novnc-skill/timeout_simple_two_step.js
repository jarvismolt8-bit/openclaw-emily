const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    // Step 1: Click TIME OUT
    const timeoutBtn = await page.$('div:has-text("TIME OUT"), button:has-text("TIME OUT")');
    if (!timeoutBtn) throw new Error('TIME OUT button not found');

    await timeoutBtn.click();
    console.log('Clicked TIME OUT');
    await page.waitForTimeout(2000);

    // Step 2: Click Submit in the modal
    const submitBtn = await page.$('button:has-text("Submit"), a:has-text("Submit"), div:has-text("Submit")');
    if (!submitBtn) throw new Error('Submit button not found');

    await submitBtn.click();
    console.log('Clicked Submit');
    await page.waitForTimeout(2000);

    console.log(JSON.stringify({ success: true, message: 'Time out completed' }));

  } catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
  } finally {
    await browser.close();
  }
})();