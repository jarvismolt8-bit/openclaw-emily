const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();

  const xPage = pages.find(p => /x\.com|twitter\.com/.test(p.url()));
  const redditPage = pages.find(p => /reddit\.com/.test(p.url()));

  if (xPage) {
    await xPage.bringToFront();
    console.log('Brought X tab to front.');
  } else {
    console.log('No X tab found.');
  }

  // Optionally close Reddit tab to declutter
  if (redditPage) {
    await redditPage.close();
    console.log('Closed Reddit tab.');
  }

  // Ensure we're on the home page if something else
  if (xPage) {
    await xPage.goto('https://x.com/home', { waitUntil: 'domcontentloaded' });
    await xPage.bringToFront();
    console.log('Refreshed to X home.');
  }

  await browser.close();
  console.log('Done. X tab should be visible in VNC.');
})().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
