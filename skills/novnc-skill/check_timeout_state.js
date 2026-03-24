const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    const title = await page.title();
    const url = page.url();
    console.log(`Title: ${title}`);
    console.log(`URL: ${url}`);

    // Get all visible text
    const bodyText = await page.textContent('body');
    console.log('\n=== Page Text Preview ===');
    const lines = bodyText.split('\n').filter(l => l.trim().length > 0);
    lines.slice(0, 50).forEach((line, i) => {
      console.log(`${i + 1}: ${line.trim().substring(0, 80)}`);
    });

    // Find all elements containing "TIME"
    console.log('\n=== Elements containing "TIME" ===');
    const allElements = await page.$$('*');
    for (const el of allElements) {
      try {
        const text = await el.textContent();
        if (text && text.toUpperCase().includes('TIME')) {
          console.log(`- "${text.trim().substring(0, 60)}"`);
        }
      } catch (e) {}
    }

  } catch (error) {
    console.log(JSON.stringify({ error: error.message }));
  } finally {
    await browser.close();
  }
})();