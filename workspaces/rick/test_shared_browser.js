const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  // Connect to the shared Chrome via CDP
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  console.log('Connected to shared Chrome. Navigating to Google...');
  await page.goto('https://www.google.com', { waitUntil: 'networkidle' });

  // Accept cookies if the consent dialog appears (EU/other regions)
  try {
    await page.waitForSelector('button:has-text("Accept all")', { timeout: 3000 }).then(async (btn) => {
      await btn.click();
      console.log('Accepted cookies.');
    }).catch(() => {
      // No consent dialog
    });
  } catch (e) {
    // ignore
  }

  // Type into the search box
  const searchBox = await page.waitForSelector('textarea[name="q"], input[name="q"]');
  await searchBox.fill('morty');
  await searchBox.press('Enter');

  // Wait for results
  await page.waitForNavigation({ waitUntil: 'networkidle' });
  console.log('Search performed. Current URL:', page.url());

  // Optional: take a screenshot for proof
  await page.screenshot({ path: '/tmp/morty_search.png', fullPage: false });
  console.log('Screenshot saved to /tmp/morty_search.png');

  // Disconnect (does not kill Chrome)
  await browser.close();
  console.log('Disconnected from shared Chrome.');
})().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
