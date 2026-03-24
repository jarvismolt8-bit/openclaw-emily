const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    // Use JavaScript to find and click TIME OUT
    console.log('Clicking TIME OUT via JS...');
    const result1 = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('button, a, div[role="button"], span'));
      for (const el of elements) {
        if (el.textContent && el.textContent.trim() === 'TIME OUT') {
          el.click();
          return 'TIME OUT clicked';
        }
      }
      return 'TIME OUT not found';
    });
    console.log(result1);
    await page.waitForTimeout(2000);

    // Use JavaScript to click Submit
    console.log('Clicking Submit via JS...');
    const result2 = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('button, a, div[role="button"], input[type="submit"]'));
      for (const el of elements) {
        const txt = el.textContent || el.value;
        if (txt && txt.trim() === 'SUBMIT') {
          el.click();
          return 'Submit clicked';
        }
      }
      return 'Submit not found';
    });
    console.log(result2);
    await page.waitForTimeout(2000);

    console.log(JSON.stringify({ success: true, message: 'JS injection completed' }));

  } catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
  } finally {
    await browser.close();
  }
})();