const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();

  console.log(`Total pages: ${pages.length}`);

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const title = await page.title();
    const url = page.url();
    console.log(`Tab ${i}: ${title} - ${url}`);

    // Take a small screenshot to verify visual state
    try {
      const screenshot = await page.screenshot({ fullPage: false });
      console.log(`Tab ${i} screenshot: ${screenshot.length} bytes`);
    } catch (e) {
      console.log(`Tab ${i} screenshot failed: ${e.message}`);
    }
  }

  await browser.close();
})();