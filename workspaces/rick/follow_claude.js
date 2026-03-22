const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  await page.bringToFront();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  console.log('Navigating to X.com home...');
  await page.goto('https://x.com/home', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Click search box
  try {
    const searchInputSelectors = [
      'input[aria-label="Search"]',
      'input[placeholder="Search"]',
      'input[type="text"]'
    ];
    let searchInput = null;
    for (const sel of searchInputSelectors) {
      try {
        searchInput = await page.waitForSelector(sel, { timeout: 3000 });
        if (searchInput) break;
      } catch (e) {}
    }

    if (!searchInput) {
      console.log('Could not find search input.');
      await browser.close();
      process.exit(1);
    }

    await searchInput.click();
    await page.keyboard.type('claude');
    await page.keyboard.press('Enter');
    console.log('Searched for "claude".');
    await page.waitForNavigation({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
  } catch (e) {
    console.error('Search failed:', e);
    await browser.close();
    process.exit(1);
  }

  // Look for the top result - likely Claude AI's official account
  try {
    // First try to click the first result with "Claude" in name
    const userLinkSelectors = [
      'a[href*="/claude"]',
      'a:has-text("Claude")',
      'div[data-testid*="User-"] a[href*="/claude"]'
    ];

    let followed = false;
    for (const sel of userLinkSelectors) {
      try {
        const link = await page.waitForSelector(sel, { timeout: 3000 });
        if (link) {
          await link.click();
          console.log('Clicked on Claude result.');
          followed = true;
          break;
        }
      } catch (e) {}
    }

    if (!followed) {
      console.log('Could not find Claude link. Trying generic first user card.');
      // Fallback: click first user card
      const firstUser = await page.$('div[data-testid="UserCell"] a');
      if (firstUser) {
        await firstUser.click();
        console.log('Clicked first user result.');
      } else {
        console.log('No user results found.');
      }
    }

    // After landing on profile, click Follow if not already
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    const followBtnSelectors = [
      'div[data-testid="User-Profile"] button:has-text("Follow")',
      'button[data-testid="followButton"]',
      'button:has-text("Follow")'
    ];

    let clickedFollow = false;
    for (const sel of followBtnSelectors) {
      try {
        const btn = await page.waitForSelector(sel, { timeout: 3000 });
        if (btn) {
          await btn.click();
          console.log('Clicked Follow button.');
          clickedFollow = true;
          break;
        }
      } catch (e) {}
    }

    if (!clickedFollow) {
      console.log('Follow button not found or already following.');
    } else {
      console.log('Follow action completed.');
    }
  } catch (e) {
    console.error('Profile navigation/follow failed:', e);
  }

  await page.waitForTimeout(1000);
  await browser.close();
  console.log('Done.');
})().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
