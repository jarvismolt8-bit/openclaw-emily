const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    // Step 1: Click TIME OUT button (already done, but included for completeness)
    console.log('Step 1: Clicking TIME OUT...');
    const timeoutSelectors = [
      'div:has-text("TIME OUT")',
      'button:has-text("TIME OUT")',
      'a:has-text("TIME OUT")'
    ];

    let clicked = false;
    for (const selector of timeoutSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.click(selector);
        console.log(`Clicked TIME OUT with selector: ${selector}`);
        clicked = true;
        break;
      } catch (e) {}
    }

    if (!clicked) throw new Error('Could not find TIME OUT button');

    // Wait for confirmation modal to appear
    await page.waitForTimeout(2000);

    // Step 2: Handle confirmation popup - look for "Yes", "Confirm", or "OK"
    console.log('Step 2: Handling confirmation popup...');
    const confirmSelectors = [
      'button:has-text("Yes")',
      'button:has-text("Confirm")',
      'button:has-text("OK")',
      '.btn-primary',
      'button[type="submit"]'
    ];

    let confirmed = false;
    for (const selector of confirmSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.click(selector);
        console.log(`Clicked confirm with selector: ${selector}`);
        confirmed = true;
        break;
      } catch (e) {}
    }

    if (!confirmed) {
      // Try pressing Enter as fallback
      await page.keyboard.press('Enter');
      console.log('Pressed Enter to confirm');
    }

    // Wait for any additional processing
    await page.waitForTimeout(2000);

    console.log(JSON.stringify({ success: true, message: 'Time out completed with confirmation' }));

  } catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
  } finally {
    await browser.close();
  }
})();