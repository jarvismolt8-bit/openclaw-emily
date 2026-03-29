const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();

  console.log(`Total tabs: ${pages.length}`);

  for (let i = 0; i < pages.length; i++) {
    const title = await pages[i].title();
    const url = pages[i].url();
    console.log(`Tab ${i}: ${title} - ${url}`);
  }

  await browser.close();
})();