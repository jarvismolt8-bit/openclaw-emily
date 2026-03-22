const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  console.log('Connected. Looking for "do not consent" type button...');

  // Try a few common selectors for consent rejection
  const selectors = [
    'button:has-text("Reject")',
    'button:has-text("Decline")',
    'button:has-text("Do not consent")',
    'button:has-text("No thanks")',
    'button:has-text("Ne consente pas")',
    '[aria-label*="Reject"]',
    '[aria-label*="Decline"]',
    'button[data-testid="reject-all"]'
  ];

  let clicked = false;
  for (const sel of selectors) {
    try {
      const btn = await page.waitForSelector(sel, { timeout: 2000 });
      if (btn) {
        await btn.click();
        console.log(`Clicked button with selector: ${sel}`);
        clicked = true;
        break;
      }
    } catch (e) {
      // try next
    }
  }

  if (!clicked) {
    console.log('Could not find "do not consent" button automatically. Please check the page manually.');
  }

  // Wait a moment for any transition
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/after_consent.png', fullPage: true });
  console.log('Screenshot saved to /tmp/after_consent.png');

  await browser.close();
  console.log('Done.');
})().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
