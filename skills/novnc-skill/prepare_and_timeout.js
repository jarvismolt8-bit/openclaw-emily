const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    // First, ensure we're on the employee portal dashboard and scroll to time tracking section
    console.log('Ensuring correct page and scrolling...');
    await page.goto('https://yahshuapayroll.com/employee_portal/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(3000);

    // Scroll down multiple times to reveal TIME OUT
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(500);
    }

    // Now try to find TIME OUT
    console.log('Looking for TIME OUT button...');
    const allElements = await page.$$('button, a, div[role="button"], span, .btn, .button');
    console.log(`Total clickable elements: ${allElements.length}`);

    let timeoutClicked = false;
    for (const el of allElements) {
      try {
        const text = await el.textContent();
        if (text && text.toUpperCase().includes('TIME OUT')) {
          await el.click({ timeout: 5000 });
          console.log(`Clicked TIME OUT: "${text.trim()}"`);
          timeoutClicked = true;
          break;
        }
      } catch (e) {}
    }

    if (!timeoutClicked) {
      throw new Error('Could not find TIME OUT button after scrolling');
    }

    await page.waitForTimeout(1500);

    // Handle confirmation modal
    console.log('Handling confirmation modal...');
    const confirmElements = await page.$$('button, a, div[role="button"]');
    let confirmed = false;

    for (const el of confirmElements) {
      const text = await el.textContent();
      if (text && ['YES', 'CONFIRM', 'OK', 'SUBMIT', 'ACCEPT'].some(t => text.toUpperCase().includes(t))) {
        await el.click({ timeout: 5000 });
        console.log(`Clicked confirm: "${text.trim()}"`);
        confirmed = true;
        break;
      }
    }

    if (!confirmed) {
      await page.keyboard.press('Enter');
      console.log('Pressed Enter for confirmation');
    }

    await page.waitForTimeout(1500);

    // Handle final Submit popup
    console.log('Handling Submit popup...');
    const submitElements = await page.$$('button, a, div[role="button"]');
    let submitted = false;

    for (const el of submitElements) {
      const text = await el.textContent();
      if (text && text.toUpperCase() === 'SUBMIT') {
        await el.click({ timeout: 5000 });
        console.log(`Clicked Submit: "${text.trim()}"`);
        submitted = true;
        break;
      }
    }

    if (!submitted) {
      await page.keyboard.press('Enter');
      console.log('Pressed Enter to submit');
    }

    await page.waitForTimeout(2000);
    console.log(JSON.stringify({ success: true, message: 'Full timeout flow completed' }));

  } catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
  } finally {
    await browser.close();
  }
})();