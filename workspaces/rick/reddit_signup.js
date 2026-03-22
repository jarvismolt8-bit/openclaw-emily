const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  console.log('Starting Reddit signup...');

  // Go to Reddit
  await page.goto('https://www.reddit.com', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Click "Sign Up" button - typical selector for the join/create account button
  try {
    // Try to find the join/signup button (there are multiple variations)
    const signupBtn = await page.waitForSelector('a[href*="signup"], button:has-text("Sign Up"), [data-testid="signup-button"]', { timeout: 5000 });
    if (signupBtn) {
      await signupBtn.click();
      console.log('Clicked sign up.');
    }
  } catch (e) {
    console.log('Could not find signup button automatically. Maybe already on signup page?');
  }

  // Wait for navigation to signup page
  await page.waitForTimeout(2000);

  // Fill email (random placeholder)
  const randomEmail = `user_${Date.now()}@example.com`;
  try {
    await page.fill('input[name="email"]', randomEmail);
    console.log('Filled email:', randomEmail);
  } catch (e) {
    console.log('Email field not found, maybe already filled?');
  }

  // Fill username
  const randomUser = `rick_${Math.floor(Math.random()*10000)}`;
  try {
    await page.fill('input[name="username"]', randomUser);
    console.log('Filled username:', randomUser);
  } catch (e) {
    console.log('Username field not found');
  }

  // Fill password
  const randomPass = 'TempPass123!@#';
  try {
    await page.fill('input[name="password"]', randomPass);
    console.log('Filled password');
  } catch (e) {
    console.log('Password field not found');
  }

  // Sometimes there's a "continue" button after basic info
  try {
    const continueBtn = await page.waitForSelector('button:has-text("Continue"), button[data-testid*="continue"]', { timeout: 3000 });
    if (continueBtn) {
      await continueBtn.click();
      console.log('Clicked continue.');
    }
  } catch (e) {
    // ignore
  }

  // Wait for interests selection (if present)
  await page.waitForTimeout(2000);

  // Select interests: marketing, weddings, events, openclaw, science
  const interests = ['marketing', 'weddings', 'events', 'openclaw', 'science'];
  let selectedCount = 0;

  // Try to find interest checkboxes/toggles - Reddit uses various selectors
  for (const interest of interests) {
    // Try a few selector patterns
    const selectors = [
      `input[value="${interest}"]`,
      `input[aria-label*="${interest}"]`,
      `text=//*[contains(text(),"${interest}")]/ancestor::button`,
      `button:has-text("${interest}")`,
      `[data-testid*="${interest}"]`
    ];

    for (const sel of selectors) {
      try {
        const el = await page.waitForSelector(sel, { timeout: 1000 });
        if (el) {
          await el.click();
          console.log(`Selected interest: ${interest}`);
          selectedCount++;
          break;
        }
      } catch (e) {
        // try next selector
      }
    }
  }

  console.log(`Selected ${selectedCount}/${interests.length} interests.`);

  // Submit/Done button if exists
  try {
    const doneBtn = await page.waitForSelector('button:has-text("Done"), button:has-text("Finish"), button:has-text("Sign up")', { timeout: 3000 });
    if (doneBtn) {
      await doneBtn.click();
      console.log('Clicked final button.');
    }
  } catch (e) {
    console.log('No final button found or already completed.');
  }

  await page.waitForTimeout(1500);

  // Snapshot of current state (content only)
  const html = await page.content();
  console.log('Current page title:', await page.title());
  console.log('HTML length:', html.length);

  // You can see the result in the VNC window
  await browser.close();
  console.log('Finished Reddit signup attempt.');
})().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
