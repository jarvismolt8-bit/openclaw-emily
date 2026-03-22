const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  console.log('Navigating to Reddit search for "openclaw"...');
  // Direct search URL
  await page.goto('https://www.reddit.com/search/?q=openclaw', { waitUntil: 'domcontentloaded', timeout: 15000 });

  // Wait for results to load
  await page.waitForTimeout(3000);

  // Try to extract some result titles/links
  const results = await page.$$eval('h3, [data-testid="post-title"]', els => els.map(e => e.textContent.trim()));
  console.log('Found result titles:', results.slice(0, 5));

  // You can see the page in VNC at https://46.225.69.45/browser/
  await browser.close();
  console.log('Done.');
})().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
