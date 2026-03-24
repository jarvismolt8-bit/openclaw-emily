const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    // Click TIME OUT first
    const clickables = await page.$$('button, a, div[role="button"], span');
    for (const el of clickables) {
      const txt = await el.textContent();
      if (txt && txt.trim() === 'TIME OUT') {
        await el.click();
        console.log('Clicked TIME OUT');
        await page.waitForTimeout(2000);
        break;
      }
    }

    // List all elements that might be confirmation buttons
    const allButtons = await page.$$('button, a, div[role="button"], input[type="submit"]');
    console.log(`Found ${allButtons.length} potential buttons after TIME OUT click`);

    for (let i = 0; i < allButtons.length; i++) {
      const text = await allButtons[i].textContent();
      const value = await allButtons[i].getAttribute('value');
      console.log(`${i}: text="${text?.trim()}" value="${value}"`);
    }

    // Also check for modal content
    const bodyText = await page.textContent('body');
    if (bodyText.includes('Are you sure')) {
      console.log('Confirmation modal is present');
    }

  } catch (error) {
    console.log(JSON.stringify({ error: error.message }));
  } finally {
    await browser.close();
  }
})();