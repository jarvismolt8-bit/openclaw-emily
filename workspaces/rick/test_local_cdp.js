const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  try {
    console.log('Attempting to connect to CDP at ws://127.0.0.1:9222 ...');
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const contexts = browser.contexts();
    console.log(`Connected. Found ${contexts.length} browser context(s).`);
    const pages = contexts[0] ? contexts[0].pages() : [];
    console.log(`First context has ${pages.length} page(s).`);
    if (pages.length > 0) {
      const p = pages[0];
      console.log('Tab 1 URL:', p.url());
      console.log('Tab 1 title:', await p.title().catch(() => '(no title)'));
    }
    await browser.close();
    console.log('Disconnected.');
  } catch (err) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  }
})().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
