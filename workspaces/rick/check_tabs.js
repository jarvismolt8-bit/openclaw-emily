const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();

  console.log(`Found ${pages.length} open tab(s).`);
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    const url = p.url();
    const title = await p.title().catch(() => '(no title)');
    console.log(`Tab ${i + 1}: ${title} — ${url}`);
  }

  // Also detect any Twitter/X tabs specifically
  const twitterTabs = pages.filter(p => /twitter\.com|x\.com/.test(p.url()));
  if (twitterTabs.length > 0) {
    console.log(`\nTwitter/X tabs found: ${twitterTabs.length}`);
  } else {
    console.log('\nNo Twitter/X tabs currently open.');
  }

  await browser.close();
  console.log('Done.');
})().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
