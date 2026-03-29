const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();

  console.log(`Initial tabs: ${pages.length}`);
  for (const p of pages) {
    console.log(' -', await p.title().catch(() => 'no title'), p.url());
  }

  console.log('Opening example.com in new tab...');
  const newPage = await context.newPage();
  await newPage.goto('https://example.com', { waitUntil: 'domcontentloaded' });
  await newPage.bringToFront();
  console.log('New tab title:', await newPage.title());
  console.log('New tab URL:', newPage.url());

  console.log('Done. You should see example.com in your Chrome window.');
  // Keep connection alive a moment
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
