const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  const target = pages[0] || await context.newPage();

  // Get CDP session attached to the target
  const client = await target.target().createCDPSession();
  const { windowId } = await client.send('Browser.getWindowForTarget');

  // Set window bounds to a visible position
  await client.send('Browser.setWindowBounds', {
    windowId,
    bounds: {
      left: 50,
      top: 50,
      width: 1600,
      height: 1000,
      windowState: 'normal'
    }
  });

  await target.bringToFront();
  await target.goto('https://example.com', { waitUntil: 'domcontentloaded' });

  console.log('Window bounds set and navigated. Should be visible now.');
  await browser.close();
})().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
