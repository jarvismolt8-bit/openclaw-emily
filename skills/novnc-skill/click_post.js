const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

async function clickPost() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    // Try multiple selectors for the Post button
    const postSelectors = [
      '[data-testid="tweetButtonInline"]',
      '[data-testid="tweetButton"]',
      'div[role="button"]:has-text("Post")',
      'div[role="button"]:has-text("Tweet")',
      'button[data-testid="tweetButton"]',
      '[aria-label="Post"]',
      '[aria-label="Tweet"]'
    ];

    let clicked = false;
    for (const selector of postSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.click(selector);
        console.log(`Clicked Post button with selector: ${selector}`);
        clicked = true;
        break;
      } catch (e) {
        // continue to next selector
      }
    }

    if (!clicked) {
      // Try pressing Enter key as fallback
      await page.keyboard.press('Enter');
      console.log('Pressed Enter as fallback');
    }

    // Wait a moment for posting
    await page.waitForTimeout(2000);

    console.log(JSON.stringify({ success: true, message: 'Post action completed' }));

  } catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
  } finally {
    await browser.close();
  }
}

clickPost();