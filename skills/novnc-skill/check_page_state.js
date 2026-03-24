const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    // Get page title and URL
    const title = await page.title();
    const url = page.url();
    console.log(`Title: ${title}`);
    console.log(`URL: ${url}`);

    // Look for TIME OUT text anywhere on page
    const pageText = await page.textContent('body');
    const timeOutMatches = pageText.match(/TIME OUT/g);
    console.log(`Found "TIME OUT" ${timeOutMatches ? timeOutMatches.length : 0} times`);

    // Find all clickable elements with TIME OUT text
    const elements = await page.$$('button, a, div[role="button"], span');
    console.log(`Total clickable elements: ${elements.length}`);

    for (let i = 0; i < Math.min(elements.length, 20); i++) {
      const text = await elements[i].textContent();
      if (text && text.toUpperCase().includes('TIME OUT')) {
        console.log(`Element ${i}: "${text.trim()}"`);
      }
    }

    // Take screenshot to see current state
    try {
      const screenshot = await page.screenshot({ fullPage: false });
      console.log(`Screenshot: ${screenshot.length} bytes`);
    } catch (e) {}

  } catch (error) {
    console.log(JSON.stringify({ error: error.message }));
  } finally {
    await browser.close();
  }
})();