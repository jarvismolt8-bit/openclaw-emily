const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    // Wait for page load
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // Step 0: Close the Important Announcements popup if present
    console.log('Step 0: Closing announcements popup...');
    const closeBtns = await page.$$('button, a, div[role="button"]');
    let closed = false;
    for (const btn of closeBtns) {
      const text = await btn.textContent();
      if (text && text.toUpperCase().includes('CLOSE')) {
        await btn.click();
        console.log('Clicked Close on announcement');
        closed = true;
        await page.waitForTimeout(1000);
        break;
      }
    }

    // Step 1: Find and click TIME OUT button
    console.log('Step 1: Finding TIME OUT button...');
    await page.waitForTimeout(1000);

    const clickables = await page.$$('button, a, div[role="button"], span');
    let timeoutBtn = null;
    for (const el of clickables) {
      try {
        const txt = await el.textContent();
        if (txt && txt.trim() === 'TIME OUT') {
          timeoutBtn = el;
          break;
        }
      } catch (e) {}
    }

    if (!timeoutBtn) throw new Error('TIME OUT button not found');

    await timeoutBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await timeoutBtn.click();
    console.log('Clicked TIME OUT');
    await page.waitForTimeout(2000);

    // Step 2: Click Submit in the modal
    console.log('Step 2: Clicking Submit...');
    const submitBtns = await page.$$('button, a, div[role="button"]');
    let submitBtn = null;
    for (const el of submitBtns) {
      const txt = await el.textContent();
      if (txt && txt.trim() === 'SUBMIT') {
        submitBtn = el;
        break;
      }
    }

    if (!submitBtn) throw new Error('Submit button not found');

    await submitBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await submitBtn.click();
    console.log('Clicked Submit');
    await page.waitForTimeout(2000);

    console.log(JSON.stringify({ success: true, message: 'Full timeout flow completed' }));

  } catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
  } finally {
    await browser.close();
  }
})();