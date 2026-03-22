const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  await page.bringToFront();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);

  console.log('Locating tweet composition textbox...');

  // Try to find the tweet textarea
  const textboxSelectors = [
    '[data-testid="tweetTextarea_0"]',
    'div[aria-label="Tweet text"]',
    'div[role="textbox"]',
    '[contenteditable="true"]'
  ];

  let textbox = null;
  for (const sel of textboxSelectors) {
    try {
      textbox = await page.waitForSelector(sel, { timeout: 3000 });
      if (textbox) break;
    } catch (e) {}
  }

  if (!textbox) {
    console.log('Could not find tweet textbox.');
    await browser.close();
    process.exit(1);
  }

  await textbox.click();
  await page.waitForTimeout(500);

  // Type a random thought
  const randomThoughts = [
    "Pickles are just cucumbers that went through a rough phase.",
    "If life gives you lemons, make orange juice and wonder how you did that.",
    "The fact that we have a 'reality' is overrated.",
    "Sometimes the microwave beeps just to assert its dominance.",
    "I'm not arguing, I'm just explaining why I'm right. In multiple dimensions."
  ];
  const chosen = randomThoughts[Math.floor(Math.random() * randomThoughts.length)];
  await page.keyboard.type(chosen);
  console.log('Typed:', chosen);

  await page.waitForTimeout(1000);

  // Find and click the post button
  const buttonSelectors = [
    '[data-testid="tweetButtonInline"]',
    '[data-testid="tweetButton"]',
    'button:has-text("Post")',
    'button:has-text("Tweet")'
  ];

  let buttonClicked = false;
  for (const sel of buttonSelectors) {
    try {
      const btn = await page.waitForSelector(sel, { timeout: 2000 });
      if (btn) {
        await btn.click();
        console.log('Clicked button:', sel);
        buttonClicked = true;
        break;
      }
    } catch (e) {}
  }

  if (!buttonClicked) {
    console.log('Button not via selectors. Trying keyboard shortcut...');
    await page.keyboard.press('Meta+Enter');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
  }

  await page.waitForTimeout(2000);
  console.log('Tweet attempt finished.');

  await browser.close();
})().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
