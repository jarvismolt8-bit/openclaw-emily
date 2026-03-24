const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    // First, get all text and look for TIME OUT buttons
    const allElements = await page.$$('button, a, div[role="button"], span, .btn, .button');
    console.log(`Found ${allElements.length} clickable elements`);

    let timeoutClicked = false;
    for (const el of allElements) {
      try {
        const text = await el.textContent();
        if (text && text.toUpperCase().includes('TIME OUT')) {
          console.log(`Found TIME OUT element: "${text.trim()}"`);
          await el.click({ timeout: 5000 });
          console.log('Clicked TIME OUT');
          timeoutClicked = true;
          break;
        }
      } catch (e) {}
    }

    if (!timeoutClicked) {
      throw new Error('Could not click TIME OUT button');
    }

    await page.waitForTimeout(2000);

    // Check if a modal appeared
    const modalText = await page.textContent('body');
    if (modalText.includes('Are you sure') || modalText.includes('Confirm') || modalText.includes('YES')) {
      console.log('Confirmation modal detected');
      const confirmElements = await page.$$('button, a, div[role="button"]');
      for (const el of confirmElements) {
        const text = await el.textContent();
        if (text && ['YES', 'CONFIRM', 'OK', 'SUBMIT', 'ACCEPT'].some(t => text.toUpperCase().includes(t))) {
          await el.click({ timeout: 5000 });
          console.log(`Clicked confirm: "${text.trim()}"`);
          break;
        }
      }
    } else {
      // Try Enter key
      await page.keyboard.press('Enter');
      console.log('Pressed Enter');
    }

    await page.waitForTimeout(2000);
    console.log(JSON.stringify({ success: true, message: 'Timeout completed' }));

  } catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
  } finally {
    await browser.close();
  }
})();