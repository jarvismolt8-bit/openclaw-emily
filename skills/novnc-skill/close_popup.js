const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    // Wait a bit for page to be fully interactive
    await page.waitForTimeout(1000);

    // Try to find and click the Close button in the announcement modal
    // The close button text is "Close"
    const closeSelectors = [
      'button:has-text("Close")',
      '.close-btn',
      '[data-dismiss="modal"]',
      'button.close',
      'a:has-text("Close")'
    ];

    let closed = false;
    for (const selector of closeSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.click(selector);
        console.log(`Clicked close button with selector: ${selector}`);
        closed = true;
        break;
      } catch (e) {
        // continue to next selector
      }
    }

    if (!closed) {
      // Try pressing Escape key to dismiss modal
      await page.keyboard.press('Escape');
      console.log('Pressed Escape to close popup');
    }

    // Wait a moment for the popup to close
    await page.waitForTimeout(1000);

    console.log(JSON.stringify({ success: true, message: 'Popup closed' }));

  } catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
  } finally {
    await browser.close();
  }
})();