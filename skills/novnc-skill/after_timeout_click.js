const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    // Click TIME OUT first
    const timeoutBtn = await page.$('button:has-text("TIME OUT"), a:has-text("TIME OUT"), div:has-text("TIME OUT")');
    if (timeoutBtn) {
      await timeoutBtn.click();
      console.log('Clicked TIME OUT');
      await page.waitForTimeout(1500);
    }

    // Dump page HTML to see what the modal contains
    const html = await page.content();
    console.log('=== Modal HTML snippet ===');
    // Find modal content around confirm buttons
    const modalMatch = html.match(/Are you sure.*?<\/div>/is);
    if (modalMatch) {
      console.log(modalMatch[0].substring(0, 1000));
    } else {
      console.log('No modal match found');
    }

    // List all button-like elements with their text
    console.log('\n=== All buttons/links after click ===');
    const elements = await page.$$('button, a, div[role="button"]');
    for (let i = 0; i < Math.min(elements.length, 30); i++) {
      const text = await elements[i].textContent();
      console.log(`${i}: ${text ? text.trim().substring(0, 50) : ''}`);
    }

    // Take screenshot
    try {
      const screenshot = await page.screenshot({ fullPage: false });
      console.log(`\nScreenshot: ${screenshot.length} bytes`);
    } catch (e) {}

  } catch (error) {
    console.log(JSON.stringify({ error: error.message }));
  } finally {
    await browser.close();
  }
})();