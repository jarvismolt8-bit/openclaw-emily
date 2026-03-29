const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => { }).catch(err => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();
  const target = pages[0] || await context.newPage();

  // Bring the page's window to front and set its bounds via CDP
  const client = await target.target().createCDPSession();
  const { windowId } = await client.send('Browser.getWindowForTarget');

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
}).catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
