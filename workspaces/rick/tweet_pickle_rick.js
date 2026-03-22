const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();

  // Find the Twitter/X tab
  const twitterPage = pages.find(p => /x\.com|twitter\.com/.test(p.url()));
  if (!twitterPage) {
    console.log('No Twitter/X tab found. Aborting.');
    await browser.close();
    process.exit(1);
  }

  console.log('Found Twitter tab. Activating and composing tweet...');

  // Bring the Twitter tab to front (important for focus)
  await twitterPage.bringToFront();

  // Wait for page to be ready
  await twitterPage.waitForLoadState('domcontentloaded');
  await twitterPage.waitForTimeout(1000);

  // Try to find the tweet box. Twitter's selectors vary; we'll try common ones.
  const tweetBoxSelectors = [
    '[data-testid="tweetTextarea_0"]', // tweet textarea
    'div[aria-label="Tweet text"]',
    'div[role="textbox"]',
    'div[contenteditable="true"]'
  ];

  let tweetBox = null;
  for (const sel of tweetBoxSelectors) {
    try {
      tweetBox = await twitterPage.waitForSelector(sel, { timeout: 3000 });
      if (tweetBox) break;
    } catch (e) {
      // continue
    }
  }

  if (!tweetBox) {
    console.log('Could not locate tweet textbox. Aborting.');
    await browser.close();
    process.exit(1);
  }

  // Type the tweet
  const tweetText = 'pickle rick!!!';
  await tweetBox.click();
  await twitterPage.keyboard.type(tweetText);
  console.log('Typed tweet:', tweetText);

  // Find and click the "Tweet" button
  const tweetButtonSelectors = [
    '[data-testid="tweetButton"]',
    'div[role="button"]:has-text("Tweet")',
    'button:has-text("Tweet")'
  ];

  let tweetBtn = null;
  for (const sel of tweetButtonSelectors) {
    try {
      tweetBtn = await twitterPage.waitForSelector(sel, { timeout: 3000 });
      if (tweetBtn) break;
    } catch (e) {
      // continue
    }
  }

  if (!tweetBtn) {
    console.log('Could not find Tweet button.');
  } else {
    await tweetBtn.click();
    console.log('Tweet button clicked.');
  }

  // Wait a moment for post to happen
  await twitterPage.waitForTimeout(2000);
  console.log('Done. Check Twitter to confirm.');

  await browser.close();
})().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
