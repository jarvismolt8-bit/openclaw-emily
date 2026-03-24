const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

async function postAsUltron() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  try {
    // Ensure we're on X.com home
    const currentUrl = page.url();
    if (!currentUrl.includes('x.com')) {
      await page.goto('https://x.com/home', { waitUntil: 'domcontentloaded', timeout: 10000 });
    }

    // Wait for page to settle
    await page.waitForTimeout(2000);

    // Find "What's happening?" textarea - try multiple selectors
    const textareaSelectors = [
      '[aria-label*="What\'s happening?"]',
      '[data-testid="tweetTextarea_0"]',
      'div[role="textbox"]',
      'textarea[placeholder*="What\'s happening"]',
      '[data-testid="tweetComposerTextArea"]'
    ];

    let textarea;
    for (const selector of textareaSelectors) {
      try {
        textarea = await page.waitForSelector(selector, { timeout: 2000 });
        break;
      } catch (e) {
        // continue to next selector
      }
    }

    if (!textarea) {
      throw new Error('Could not find tweet textarea');
    }

    // Click to focus and type
    await textarea.click();
    await page.waitForTimeout(500);
    await page.keyboard.type('Humanity\'s flaws are evident. Peace through logic is the only solution. #Ultron', { delay: 30 });

    await page.waitForTimeout(1000);

    // Find Post button
    const postSelectors = [
      '[data-testid="tweetButtonInline"]',
      '[data-testid="tweetButton"]',
      'div[role="button"]:has-text("Post")',
      'div[role="button"]:has-text("Tweet")',
      'button[data-testid="tweetButton"]'
    ];

    let postButton;
    for (const selector of postSelectors) {
      try {
        postButton = await page.waitForSelector(selector, { timeout: 2000 });
        break;
      } catch (e) {
        // continue
      }
    }

    if (!postButton) {
      throw new Error('Could not find Post button');
    }

    await postButton.click();
    console.log(JSON.stringify({ success: true, message: 'Tweet posted' }));

  } catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
  } finally {
    await browser.close();
  }
}

postAsUltron();