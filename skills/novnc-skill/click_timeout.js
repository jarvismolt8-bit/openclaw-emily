const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    // Look for TIME OUT button or link
    const selectors = [
      'button:has-text("TIME OUT")',
      'a:has-text("TIME OUT")',
      'div:has-text("TIME OUT")',
      '[title*="TIME OUT"]',
      '.time-out',
      '#time-out'
    ];

    let clicked = false;
    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.click(selector);
        console.log(`Clicked TIME OUT with selector: ${selector}`);
        clicked = true;
        break;
      } catch (e) {
        // continue to next selector
      }
    }

    if (!clicked) {
      throw new Error('Could not find TIME OUT button');
    }

    // Wait a moment for action to complete
    await page.waitForTimeout(1000);

    console.log(JSON.stringify({ success: true, message: 'TIME OUT clicked' }));

  } catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
  } finally {
    await browser.close();
  }
})();