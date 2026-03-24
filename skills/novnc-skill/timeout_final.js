const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    // Ensure we are on the profile/dashboard page
    await page.waitForTimeout(1000);

    // Find any clickable element with exact text "TIME OUT" (case-sensitive)
    const clickables = await page.$$('button, a, div[role="button"], span');
    console.log(`Scanning ${clickables.length} clickable elements for TIME OUT...`);

    for (const el of clickables) {
      try {
        const text = await el.textContent();
        if (text && text.trim() === 'TIME OUT') {
          console.log('Found exact TIME OUT button');
          await el.click({ timeout: 3000 });
          console.log('Clicked TIME OUT');
          break;
        }
      } catch (e) {}
    }

    await page.waitForTimeout(2000);

    // Step 2: Click confirmation (Yes/Confirm)
    console.log('Looking for confirmation...');
    const allEls = await page.$$('button, a, div[role="button"]');
    for (const el of allEls) {
      const txt = await el.textContent();
      if (txt && txt.toUpperCase().includes('CONFIRM')) {
        await el.click({ timeout: 3000 });
        console.log('Clicked Confirm');
        break;
      } else if (txt && txt.toUpperCase().includes('YES')) {
        await el.click({ timeout: 3000 });
        console.log('Clicked Yes');
        break;
      }
    }

    await page.waitForTimeout(2000);

    // Step 3: Click Submit
    console.log('Looking for Submit...');
    const allEls3 = await page.$$('button, a, div[role="button"]');
    for (const el of allEls3) {
      const txt = await el.textContent();
      if (txt && txt.toUpperCase().includes('SUBMIT')) {
        await el.click({ timeout: 3000 });
        console.log('Clicked Submit');
        break;
      }
    }

    await page.waitForTimeout(2000);
    console.log(JSON.stringify({ success: true, message: 'Completed TIME OUT with all modals' }));

  } catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
  } finally {
    await browser.close();
  }
})();