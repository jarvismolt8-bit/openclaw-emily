const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0]; // Tab 0 = 9GAG

  try {
    // Reload 9GAG to ensure fresh content
    await page.goto('https://9gag.com/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);

    const result = await page.screenshot({ fullPage: false });
    console.log(`Screenshot: ${result.length} bytes`);

    // Also get some text content
    const text = await page.textContent('body');
    const lines = text.split('\n').filter(l => l.trim().length > 0).slice(0, 10);
    console.log('First lines:', lines.join(' | '));

  } catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
  } finally {
    await browser.close();
  }
})();