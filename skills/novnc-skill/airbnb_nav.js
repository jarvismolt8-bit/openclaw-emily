const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[3]; // Tab 3 = Airbnb

  try {
    // Wait for page
    await page.waitForTimeout(2000);

    // Look for common Airbnb navigation: Places to stay, Experiences, Online Experiences
    const navSelectors = [
      'a[href*="places"]',
      'a:has-text("Places to stay")',
      'a:has-text("Experiences")',
      'button:has-text("Search")',
      'a[aria-label="Search"]'
    ];

    let clicked = false;
    for (const sel of navSelectors) {
      try {
        await page.waitForSelector(sel, { timeout: 2000 });
        await page.click(sel);
        console.log(`Clicked: ${sel}`);
        clicked = true;
        break;
      } catch (e) {}
    }

    if (!clicked) {
      // Fallback: click any link with "places" in href or text
      const links = await page.$$('a');
      for (const link of links) {
        const text = await link.textContent();
        const href = await link.getAttribute('href');
        if ((text && text.toLowerCase().includes('place')) || (href && href.includes('places'))) {
          await link.click();
          console.log(`Clicked link: ${text.trim()}`);
          clicked = true;
          break;
        }
      }
    }

    console.log(JSON.stringify({ success: clicked, message: clicked ? 'Airbnb nav clicked' : 'No nav found' }));
    await page.waitForTimeout(2000);

  } catch (error) {
    console.log(JSON.stringify({ success: false, error: error.message }));
  } finally {
    await browser.close();
  }
})();