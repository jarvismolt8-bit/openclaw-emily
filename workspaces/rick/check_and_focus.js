const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();

  console.log(`Chrome has ${pages.length} tab(s).`);
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    console.log(`Tab ${i + 1}: ${await p.title().catch(() => 'no title')} — ${p.url()}`);
  }

  if (pages.length > 0) {
    const target = pages[0];
    console.log('Bringing first tab to front...');
    await target.bringToFront();
    console.log('Navigating to example.com...');
    await target.goto('https://example.com', { waitUntil: 'domcontentloaded' });
    console.log('Done. You should now see example.com in a Chrome window.');
  } else {
    console.log('No tabs found, opening new tab...');
    const newPage = await context.newPage();
    await newPage.goto('https://example.com', { waitUntil: 'domcontentloaded' });
    console.log('Opened example.com in new tab.');
  }

  // Keep open briefly to ensure actions render
  await new Promise(r => setTimeout(r, 3000));
  await browser.close();
  console.log('Disconnected.');
})().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
