const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    // Check for any visible modals or overlays
    const modals = await page.$$('[role="dialog"], .modal, .popup, .overlay');
    console.log(`Found ${modals.length} potential modals/overlays`);

    for (let i = 0; i < modals.length; i++) {
      const isVisible = await modals[i].isVisible();
      console.log(`Modal ${i}: visible=${isVisible}`);
    }

    // Check if TIME OUT button is visible
    const allClickables = await page.$$('button, a, div[role="button"], span');
    let timeoutBtn = null;
    for (const el of allClickables) {
      const txt = await el.textContent();
      if (txt && txt.trim() === 'TIME OUT') {
        timeoutBtn = el;
        break;
      }
    }

    if (timeoutBtn) {
      const isVisible = await timeoutBtn.isVisible();
      console.log(`TIME OUT button visibility: ${isVisible}`);
      const box = await timeoutBtn.boundingBox();
      console.log(`TIME OUT button position: ${JSON.stringify(box)}`);
    }

    // Take screenshot
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