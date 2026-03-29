const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();

  console.log(`Connected. Chrome has ${pages.length} tab(s).`);
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    console.log(`Tab ${i + 1}: ${await p.title().catch(() => 'no title')} — ${p.url()}`);
  }

  // Use first tab, bring to front, navigate
  const target = pages[0] || await context.newPage();
  await target.bringToFront();
  console.log('Bringing tab to front...');
  await target.goto('https://example.com', { waitUntil: 'domcontentloaded' });
  console.log('Navigated to example.com. Tab title:', await target.title());

  await browser.close();
  console.log('Done. You should see a Chrome window now.');
})().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
