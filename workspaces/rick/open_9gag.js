const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();

  // Use the first tab, or create a new one if none exist
  const target = pages[0] || await context.newPage();
  await target.bringToFront();
  console.log('Bringing tab to front...');

  await target.goto('https://9gag.com', { waitUntil: 'domcontentloaded' });
  console.log('Navigated to 9gag.com. Current tab title:', await target.title());

  await browser.close();
  console.log('Done. You should see 9gag.com now.');
})().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
