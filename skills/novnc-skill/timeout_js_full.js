const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    // Click TIME OUT and fill reason using JS
    console.log('Executing timeout flow via JS...');
    const result = await page.evaluate(() => {
      // Click TIME OUT
      const timeoutEl = Array.from(document.querySelectorAll('button, a, div[role="button"], span'))
        .find(el => el.textContent && el.textContent.trim() === 'TIME OUT');
      if (!timeoutEl) return 'TIME OUT not found';

      timeoutEl.click();

      // Wait a bit for modal
      return new Promise(resolve => {
        setTimeout(() => {
          // Fill textarea with name="reason"
          const textarea = document.querySelector('textarea[name="reason"]');
          if (!textarea) return resolve('textarea not found');
          textarea.value = 'Personal break - time out';
          textarea.dispatchEvent(new Event('input', { bubbles: true }));

          // Click Confirm button
          const confirmBtn = Array.from(document.querySelectorAll('button, a, div[role="button"]'))
            .find(el => el.textContent && el.textContent.trim() === 'Confirm');
          if (!confirmBtn) return resolve('Confirm not found');

          confirmBtn.click();
          resolve('All steps done');
        }, 2000);
      });
    });

    console.log('JS result:', result);
    await page.waitForTimeout(2000);

    console.log(JSON.stringify({ success: true, message: 'JS flow executed' }));

  } catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
  } finally {
    await browser.close();
  }
})();