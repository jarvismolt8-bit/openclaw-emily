const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  const target = pages[0] || await context.newPage();

  // Get CDP session attached to the target
  const client = await target.target.createCDPSession();

  // Get current window for this target
  const { windowId } = await client.send('Browser.getWindowForTarget');

  // Set window bounds to a visible position and size
  await client.send('Browser.setWindowBounds', {
    windowId,
    bounds: {
      left: 100,
      top: 100,
      width: 1200,
      height: 800,
      windowState: 'normal' // 'minimized', 'maximized', etc.
    }
  });

  console.log('Set window bounds to 100,100 1200x800');

  // Bring the page to front
  await target.bringToFront();
  await target.goto('https://example.com', { waitUntil: 'domcontentloaded' });

  console.log('Navigated. Chrome window should now be visible.');
  await browser.close();
})().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
