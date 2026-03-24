const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    // Find all elements that might be TIME OUT
    const elements = await page.$$('button, a, div[role="button"], span');
    console.log(`Total clickables: ${elements.length}`);

    for (let i = 0; i < elements.length; i++) {
      try {
        const txt = await elements[i].textContent();
        if (txt && txt.toUpperCase().includes('TIME')) {
          const visible = await elements[i].isVisible();
          console.log(`${i}: "${txt.trim()}" visible=${visible}`);
        }
      } catch (e) {}
    }

  } catch (error) {
    console.log(JSON.stringify({ error: error.message }));
  } finally {
    await browser.close();
  }
})();