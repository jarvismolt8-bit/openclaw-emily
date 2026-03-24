const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    // Step 1: Click TIME OUT button
    console.log('Step 1: Clicking TIME OUT...');
    const allElements = await page.$$('button, a, div[role="button"], span, .btn, .button');
    let timeoutClicked = false;

    for (const el of allElements) {
      try {
        const text = await el.textContent();
        if (text && text.toUpperCase().includes('TIME OUT')) {
          await el.click({ timeout: 5000 });
          console.log('Clicked TIME OUT');
          timeoutClicked = true;
          break;
        }
      } catch (e) {}
    }

    if (!timeoutClicked) throw new Error('Could not find TIME OUT button');

    await page.waitForTimeout(1500);

    // Step 2: Handle first confirmation modal (Confirm/Yes/OK)
    console.log('Step 2: Handling confirmation modal...');
    const pageText1 = await page.textContent('body');
    const confirmElements1 = await page.$$('button, a, div[role="button"]');
    let confirmed = false;

    for (const el of confirmElements1) {
      const text = await el.textContent();
      if (text && ['YES', 'CONFIRM', 'OK', 'SUBMIT', 'ACCEPT'].some(t => text.toUpperCase().includes(t))) {
        await el.click({ timeout: 5000 });
        console.log(`Clicked: "${text.trim()}"`);
        confirmed = true;
        break;
      }
    }

    if (!confirmed) {
      await page.keyboard.press('Enter');
      console.log('Pressed Enter for confirmation');
    }

    await page.waitForTimeout(1500);

    // Step 3: Handle second popup with Submit button
    console.log('Step 3: Handling Submit popup...');
    const pageText2 = await page.textContent('body');
    const confirmElements2 = await page.$$('button, a, div[role="button"]');
    let submitted = false;

    for (const el of confirmElements2) {
      const text = await el.textContent();
      if (text && text.toUpperCase().includes('SUBMIT')) {
        await el.click({ timeout: 5000 });
        console.log(`Clicked Submit: "${text.trim()}"`);
        submitted = true;
        break;
      }
    }

    if (!submitted) {
      // Try Enter key as final fallback
      await page.keyboard.press('Enter');
      console.log('Pressed Enter to submit');
    }

    await page.waitForTimeout(2000);
    console.log(JSON.stringify({ success: true, message: 'Full timeout flow completed (TIME OUT -> Confirm -> Submit)' }));

  } catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
  } finally {
    await browser.close();
  }
})();