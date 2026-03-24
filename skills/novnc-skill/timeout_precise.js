const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    // Scroll to ensure TIME OUT is visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Try exact text match for TIME OUT button using XPath
    const timeoutElement = await page.$x("//*[text()[contains(., 'TIME OUT')]]");
    console.log(`Found ${timeoutElement.length} elements with TIME OUT text`);

    if (timeoutElement.length > 0) {
      // Click the first one
      await timeoutElement[0].click();
      console.log('Clicked TIME OUT element via XPath');
    } else {
      // Fallback to CSS selector with exact text
      const allButtons = await page.$$('button, a, div[role="button"]');
      console.log(`Searching among ${allButtons.length} clickable elements...`);

      for (const btn of allButtons) {
        const text = await btn.textContent();
        if (text && text.includes('TIME OUT')) {
          await btn.click();
          console.log(`Clicked button with text: "${text.trim()}"`);
          break;
        }
      }
    }

    await page.waitForTimeout(1500);

    // Now handle confirmation dialog
    // Look for "Yes" or "Confirm" in buttons
    const confirmButtons = await page.$$('button, a, div[role="button"]');
    let confirmed = false;

    for (const btn of confirmButtons) {
      const text = await btn.textContent();
      if (text && ['YES', 'CONFIRM', 'OK', 'SUBMIT'].some(t => text.toUpperCase().includes(t))) {
        await btn.click();
        console.log(`Clicked confirm button: "${text.trim()}"`);
        confirmed = true;
        break;
      }
    }

    if (!confirmed) {
      // Try Enter key
      await page.keyboard.press('Enter');
      console.log('Pressed Enter to confirm');
    }

    await page.waitForTimeout(2000);
    console.log(JSON.stringify({ success: true, message: 'Timeout process completed' }));

  } catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
  } finally {
    await browser.close();
  }
})();