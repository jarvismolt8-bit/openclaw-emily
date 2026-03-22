const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  await page.bringToFront();
  await page.goto('https://x.com/home', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  console.log('Searching for "claude"...');

  // Find search input and type
  const searchInput = await page.waitForSelector('input[aria-label="Search"], input[placeholder="Search"]', { timeout: 5000 });
  await searchInput.click();
  await page.keyboard.type('claude');
  await page.keyboard.press('Enter');
  console.log('Entered search.');

  // Wait for results to appear (not full networkidle)
  await page.waitForTimeout(4000);

  // Click first result that looks like Claude account (by href containing "claude")
  try {
    const claudeLink = await page.waitForSelector('a[href*="/claude"]', { timeout: 8000 });
    if (claudeLink) {
      await claudeLink.click();
      console.log('Clicked Claude account link.');
    } else {
      console.log('No Claude link found.');
    }
  } catch (e) {
    console.log('No specific claude link, trying first user card.');
    const firstUserLink = await page.$('div[data-testid="UserCell"] a');
    if (firstUserLink) {
      await firstUserLink.click();
      console.log('Clicked first user.');
    } else {
      console.log('No user links found.');
    }
  }

  // Wait for profile page
  await page.waitForTimeout(3000);

  // Click Follow if visible
  try {
    const followBtn = await page.waitForSelector('button:has-text("Follow"), button[data-testid="followButton"]', { timeout: 5000 });
    if (followBtn) {
      await followBtn.click();
      console.log('Clicked Follow.');
    } else {
      console.log('Follow button not visible (maybe already following).');
    }
  } catch (e) {
    console.log('Follow button error:', e.message);
  }

  await page.waitForTimeout(1000);
  await browser.close();
  console.log('Done.');
})().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
