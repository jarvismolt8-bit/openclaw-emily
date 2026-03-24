const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  try {
    // Navigate to Google
    console.log('Navigating to Google...');
    await page.goto('https://www.google.com', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Accept cookies if Google shows consent (common in EU/other regions)
    try {
      const consentBtn = await page.waitForSelector('button:has-text("Accept"), button:has-text("I agree")', { timeout: 3000 });
      if (consentBtn) {
        await consentBtn.click();
        await page.waitForTimeout(1000);
      }
    } catch (e) {}

    // Find the search box - Google's search box usually has name='q' or 'textarea[name="q"]'
    console.log('Finding search box...');
    const searchSelectors = [
      'textarea[name="q"]',
      'input[name="q"]',
      'input[aria-label*="Search"]',
      'input[title*="Search"]'
    ];

    let searchBox;
    for (const selector of searchSelectors) {
      try {
        searchBox = await page.waitForSelector(selector, { timeout: 3000 });
        console.log(`Found search box with selector: ${selector}`);
        break;
      } catch (e) {
        // continue
      }
    }

    if (!searchBox) {
      throw new Error('Could not find search box');
    }

    // Click and type the search query with human-like typing
    await searchBox.click();
    await page.waitForTimeout(500);
    const query = 'event organizers in New Zealand wedding and event';
    console.log(`Typing search query: ${query}`);
    await page.keyboard.type(query, { delay: 100 }); // 100ms per key = human-like

    await page.waitForTimeout(1000);

    // Press Enter to search
    console.log('Pressing Enter to search...');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    console.log(JSON.stringify({ success: true, message: 'Google search completed' }));

  } catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
  } finally {
    await browser.close();
  }
})();