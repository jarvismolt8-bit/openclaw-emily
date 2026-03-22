const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();

  const twitterPage = pages.find(p => /x\.com|twitter\.com/.test(p.url()));
  if (!twitterPage) {
    console.log('No Twitter/X tab found. Aborting.');
    await browser.close();
    process.exit(1);
  }

  await twitterPage.bringToFront();
  await twitterPage.waitForTimeout(1000);

  // Ensure we're on the home/compose area. Click the "Post" button area to focus the textbox if needed.
  try {
    // Look for the main tweet textbox
    const textboxSelectors = [
      '[data-testid="tweetTextarea_0"]',
      'div[aria-label="Tweet text"]',
      'div[role="textbox"]',
      'div[contenteditable="true"]'
    ];
    let textbox = null;
    for (const sel of textboxSelectors) {
      try {
        textbox = await twitterPage.waitForSelector(sel, { timeout: 3000 });
        if (textbox) break;
      } catch (e) {}
    }

    if (!textbox) {
      console.log('Could not find tweet textbox.');
      await browser.close();
      process.exit(1);
    }

    // Click to focus and clear existing text
    await textbox.click();
    await twitterPage.keyboard.press('Control+A'); // Select all
    await twitterPage.keyboard.press('Backspace');
    await twitterPage.waitForTimeout(300);

    // Compose Rick-style thought
    const tweetText = `The universe is a cruel joke, but at least it's entertaining. #existential #RickSanchez`;
    await twitterPage.keyboard.type(tweetText);
    console.log('Composed tweet:', tweetText);

    // Click the Tweet/Post button
    const tweetBtnSelectors = [
      '[data-testid="tweetButtonInline"]',
      '[data-testid="tweetButton"]',
      'button:has-text("Post")',
      'button:has-text("Tweet")'
    ];
    let clicked = false;
    for (const sel of tweetBtnSelectors) {
      try {
        const btn = await twitterPage.waitForSelector(sel, { timeout: 2000 });
        if (btn) {
          await btn.click();
          console.log(`Clicked tweet button via: ${sel}`);
          clicked = true;
          break;
        }
      } catch (e) {}
    }

    if (!clicked) {
      console.log('Could not click tweet button. Trying keyboard shortcut...');
      await twitterPage.keyboard.press('Meta+Enter');
      await twitterPage.waitForTimeout(500);
      await twitterPage.keyboard.press('Enter');
    }

    await twitterPage.waitForTimeout(2000);
    console.log('Tweet attempt finished. Check VNC for confirmation.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await browser.close();
  }
})().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
