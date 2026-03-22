const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();

  const twitterPage = pages.find(p => /x\.com|twitter\.com/.test(p.url()));
  if (!twitterPage) {
    console.log('No Twitter/X tab.');
    await browser.close();
    process.exit(1);
  }

  await twitterPage.bringToFront();
  await twitterPage.waitForTimeout(1000);

  console.log('Attempting to click Tweet/Post button...');

  // Try a comprehensive list of selectors for the tweet button
  const selectors = [
    '[data-testid="tweetButton"]',
    '[data-testid="tweetButtonInline"]',
    '[data-testid="tweetButton"]',
    'div[data-testid="tweetButton"]',
    'button:has-text("Tweet")',
    'button:has-text("Post")',
    'div[role="button"]:has-text("Tweet")',
    'div[role="button"]:has-text("Post")',
    'a[role="button"]:has-text("Tweet")'
  ];

  let clicked = false;
  for (const sel of selectors) {
    try {
      const btn = await twitterPage.waitForSelector(sel, { timeout: 1500 });
      if (btn) {
        await btn.click();
        console.log(`Clicked button via selector: ${sel}`);
        clicked = true;
        break;
      }
    } catch (e) {}
  }

  if (!clicked) {
    console.log('Could not click via selectors. Trying keyboard shortcuts (Enter or Cmd+Enter)...');
    // Common shortcuts: sometimes Enter sends tweet if textarea focused
    await twitterPage.keyboard.press('Meta+Enter'); // Cmd+Enter on macOS - YMMV
    await twitterPage.waitForTimeout(500);
    await twitterPage.keyboard.press('Enter');
    console.log('Sent keyboard shortcuts.');
  }

  await twitterPage.waitForTimeout(2000);
  console.log('Operation complete. Check VNC to verify.');

  await browser.close();
})().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
