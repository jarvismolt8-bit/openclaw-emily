const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    // Click TIME OUT
    console.log('Clicking TIME OUT...');
    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('button, a, div[role="button"], span'));
      for (const el of elements) {
        if (el.textContent && el.textContent.trim() === 'TIME OUT') {
          el.click();
          return;
        }
      }
    });
    await page.waitForTimeout(2000);

    // Fill the reason textarea
    console.log('Filling reason...');
    const reasonInput = await page.$('textarea[name="reason"]');
    if (!reasonInput) throw new Error('Reason textarea not found');

    await reasonInput.click();
    await reasonInput.fill('Personal break - time out');
    console.log('Reason entered');
    await page.waitForTimeout(500);

    // Click Confirm
    console.log('Clicking Confirm...');
    const confirmBtn = await page.$('button:has-text("Confirm")');
    if (!confirmBtn) throw new Error('Confirm button not found');

    await confirmBtn.click({ force: true });
    console.log('Clicked Confirm');
    await page.waitForTimeout(2000);

    console.log(JSON.stringify({ success: true, message: 'Timeout with reason completed' }));

  } catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
  } finally {
    await browser.close();
  }
})();