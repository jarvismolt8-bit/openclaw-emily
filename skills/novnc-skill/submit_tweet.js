const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

async function submitTweet() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    // Press Ctrl+Enter or just Enter to submit
    await page.keyboard.press('Control+Enter');
    await page.waitForTimeout(1000);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);

    console.log(JSON.stringify({ success: true, message: 'Tweet submitted via keyboard' }));
  } catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
  } finally {
    await browser.close();
  }
}

submitTweet();