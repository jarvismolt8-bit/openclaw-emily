const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();

  console.log(`Total tabs before cleanup: ${pages.length}`);

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const url = page.url();
    const title = await page.title();

    // Close blank tab (chrome://new-tab-page/)
    if (url.includes('chrome://new-tab-page') || url === 'about:blank' && !title) {
      console.log(`Closing blank tab (Tab ${i})`);
      await page.close();
      continue;
    }

    // Refresh content tabs: 9gag, airbnb, reddit
    if (url.includes('9gag.com') || url.includes('airbnb.com') || url.includes('reddit.com')) {
      console.log(`Refreshing Tab ${i}: ${title.substring(0, 40)}...`);
      try {
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(1000);
        console.log(`  - Refreshed successfully`);
      } catch (error) {
        console.log(`  - Refresh error: ${error.message}`);
      }
    }
  }

  // Wait a moment for closures to settle
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Report final state
  const finalPages = context.pages();
  console.log(`\nTotal tabs after cleanup: ${finalPages.length}`);
  for (let i = 0; i < finalPages.length; i++) {
    const title = await finalPages[i].title();
    const url = finalPages[i].url();
    console.log(`Tab ${i}: ${title.substring(0, 50)} - ${url}`);
  }

  console.log('\n✅ Refresh and cleanup completed');
  await browser.close();
})();