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

    // Click Confirm (not Submit!)
    console.log('Clicking Confirm...');
    const confirmBtn = await page.$('button:has-text("Confirm"), a:has-text("Confirm"), div:has-text("Confirm")');
    if (!confirmBtn) throw new Error('Confirm button not found');

    await confirmBtn.click();
    console.log('Clicked Confirm');
    await page.waitForTimeout(2000);

    console.log(JSON.stringify({ success: true, message: 'Timeout completed via Confirm' }));

  } catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
  } finally {
    await browser.close();
  }
})();