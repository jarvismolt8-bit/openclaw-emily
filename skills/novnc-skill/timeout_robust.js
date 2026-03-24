const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    // Wait for page to be fully loaded after reload
    console.log('Waiting for page to stabilize...');
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Step 1: Find TIME OUT button (could be div, button, or a)
    console.log('Step 1: Finding TIME OUT button...');
    const elements = await page.$$('button, a, div[role="button"], span');
    let timeoutBtn = null;

    for (const el of elements) {
      try {
        const text = await el.textContent();
        if (text && text.trim() === 'TIME OUT') {
          timeoutBtn = el;
          break;
        }
      } catch (e) {}
    }

    if (!timeoutBtn) {
      throw new Error('TIME OUT button not found on page');
    }

    // Ensure it's visible and click
    await timeoutBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await timeoutBtn.click();
    console.log('Clicked TIME OUT');
    await page.waitForTimeout(2000); // Wait for modal

    // Step 2: Find Submit button in the modal
    console.log('Step 2: Finding Submit button in modal...');
    const submitSelectors = [
      'button:has-text("Submit")',
      'input[value="Submit"]',
      'div:has-text("Submit")',
      'a:has-text("Submit")'
    ];

    let submitBtn = null;
    for (const selector of submitSelectors) {
      try {
        submitBtn = await page.$(selector);
        if (submitBtn) break;
      } catch (e) {}
    }

    if (!submitBtn) {
      // Fallback: search all visible buttons for text Submit
      const allButtons = await page.$$('button, a, div[role="button"]');
      for (const btn of allButtons) {
        const isVisible = await btn.isVisible();
        if (!isVisible) continue;
        const text = await btn.textContent();
        if (text && text.trim() === 'SUBMIT') {
          submitBtn = btn;
          break;
        }
      }
    }

    if (!submitBtn) throw new Error('Submit button not found');

    await submitBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await submitBtn.click();
    console.log('Clicked Submit');
    await page.waitForTimeout(2000);

    console.log(JSON.stringify({ success: true, message: 'Timeout flow completed' }));

  } catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
  } finally {
    await browser.close();
  }
})();