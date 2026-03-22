const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  console.log('Connected. Navigating to venued.app...');
  await page.goto('https://venued.app', { waitUntil: 'networkidle' });

  // Wait a moment for the page to settle
  await page.waitForTimeout(2000);

  // Take screenshot
  await page.screenshot({ path: '/tmp/venued_app.png', fullPage: true });
  console.log('Screenshot saved to /tmp/venued_app.png');

  // Optionally get page title
  const title = await page.title();
  console.log('Page title:', title);

  await browser.close();
  console.log('Done.');
})().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
