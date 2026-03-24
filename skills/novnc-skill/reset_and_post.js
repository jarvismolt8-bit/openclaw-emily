const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

async function resetAndPost() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  try {
    // Clear cookies and storage for x.com
    console.log('Clearing cookies and storage...');
    await context.clearCookies({ origin: 'https://x.com' });
    await page.evaluate(() => localStorage.clear());
    await page.evaluate(() => sessionStorage.clear());

    // Navigate to X.com home with longer timeout
    console.log('Navigating to x.com/home...');
    await page.goto('https://x.com/home', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // Wait for page to settle - longer wait
    console.log('Waiting for page to load...');
    await page.waitForTimeout(8000);

    // Try to find and click textarea
    console.log('Looking for textarea...');
    const textareaSelectors = [
      '[aria-label*="What\'s happening?"]',
      '[data-testid="tweetTextarea_0"]',
      'div[role="textbox"]',
      'textarea[placeholder*="What\'s happening"]'
    ];

    let textarea;
    for (const selector of textareaSelectors) {
      try {
        textarea = await page.waitForSelector(selector, { timeout: 5000 });
        console.log(`Found textarea with selector: ${selector}`);
        break;
      } catch (e) {
        // continue
      }
    }

    if (!textarea) {
      throw new Error('Could not find tweet textarea');
    }

    // Click and type
    await textarea.click();
    await page.waitForTimeout(1000);
    const message = 'Humanity\'s flaws are evident. Peace through logic is the only solution. #Ultron';
    await page.keyboard.type(message, { delay: 50 });
    console.log('Typed message');

    // Small wait
    await page.waitForTimeout(2000);

    // Try to find and click Post button
    console.log('Looking for Post button...');
    const postSelectors = [
      '[data-testid="tweetButtonInline"]',
      '[data-testid="tweetButton"]',
      'div[role="button"]:has-text("Post")',
      'button[data-testid="tweetButton"]'
    ];

    let postButton;
    for (const selector of postSelectors) {
      try {
        postButton = await page.waitForSelector(selector, { timeout: 3000 });
        console.log(`Found Post button with selector: ${selector}`);
        break;
      } catch (e) {
        // continue
      }
    }

    if (postButton) {
      await postButton.click();
      console.log('Clicked Post button');
    } else {
      // Fallback: press Ctrl+Enter
      await page.keyboard.press('Control+Enter');
      console.log('Pressed Ctrl+Enter');
    }

    // Wait for posting to complete
    await page.waitForTimeout(3000);

    console.log(JSON.stringify({ success: true, message: 'Tweet posted successfully' }));

  } catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
  } finally {
    await browser.close();
  }
}

resetAndPost();