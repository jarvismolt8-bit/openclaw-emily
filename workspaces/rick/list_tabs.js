const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const contexts = browser.contexts();
  console.log(`Contexts: ${contexts.length}`);
  for (let i = 0; i < contexts.length; i++) {
    const ctx = contexts[i];
    const pages = ctx.pages();
    console.log(`Context ${i}: ${pages.length} page(s)`);
    for (let j = 0; j < pages.length; j++) {
      const p = pages[j];
      const url = p.url();
      const title = await p.title().catch(() => '(no title)');
      console.log(`  Tab ${j + 1}: ${title} — ${url}`);
    }
  }
  await browser.close();
})().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
