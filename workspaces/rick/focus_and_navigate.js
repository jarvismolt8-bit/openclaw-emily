const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();

  console.log(`Found ${pages.length} tabs.`);
  const target = pages[0]; // first tab
  await target.bringToFront();
  console.log('Bringing first tab to front...');

  console.log('Navigating to example.com...');
  await target.goto('https://example.com', { waitUntil: 'domcontentloaded' });

  console.log('Done. You should see example.com now.');
  await browser.close();
})().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
