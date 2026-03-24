const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    // Step 1: Click TIME OUT button (visible at x~738, y~541)
    console.log('Step 1: Clicking TIME OUT...');
    const timeoutBtn = await page.$('button:has-text("TIME OUT"), a:has-text("TIME OUT"), div:has-text("TIME OUT")');
    if (!timeoutBtn) throw new Error('TIME OUT button not found');

    await timeoutBtn.click();
    console.log('Clicked TIME OUT');
    await page.waitForTimeout(2000); // Wait for modal

    // Step 2: Confirm - look for visible button with text Yes/Confirm/OK
    console.log('Step 2: Confirm modal...');
    const confirmBtns = await page.$$('button, a, div[role="button"]');
    let confirmed = false;

    for (const btn of confirmBtns) {
      const isVisible = await btn.isVisible();
      if (!isVisible) continue;

      const text = await btn.textContent();
      if (text && ['YES', 'CONFIRM', 'OK'].some(t => text.toUpperCase().includes(t))) {
        console.log(`Clicking confirm button: "${text.trim()}"`);
        await btn.click();
        confirmed = true;
        await page.waitForTimeout(2000);
        break;
      }
    }

    if (!confirmed) {
      throw new Error('No visible confirmation button found');
    }

    // Step 3: Submit - look for Submit button
    console.log('Step 3: Submit final popup...');
    const submitBtns = await page.$$('button, a, div[role="button"]');
    let submitted = false;

    for (const btn of submitBtns) {
      const isVisible = await btn.isVisible();
      if (!isVisible) continue;

      const text = await btn.textContent();
      if (text && text.toUpperCase().includes('SUBMIT')) {
        console.log(`Clicking submit: "${text.trim()}"`);
        await btn.click();
        submitted = true;
        await page.waitForTimeout(2000);
        break;
      }
    }

    if (!submitted) {
      throw new Error('No visible submit button found');
    }

    console.log(JSON.stringify({ success: true, message: 'TIME OUT fully completed' }));

  } catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
  } finally {
    await browser.close();
  }
})();