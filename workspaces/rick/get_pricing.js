const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();

  console.log('Connected. Navigating to venued.app home page...');
  await page.goto('https://venued.app', { waitUntil: 'networkidle' });

  // Wait for page to load
  await page.waitForTimeout(2000);

  // Try to click a "Pricing" link if present
  try {
    const pricingLink = await page.waitForSelector('a[href*="pricing"], text=Pricing', { timeout: 3000 });
    if (pricingLink) {
      await pricingLink.click();
      console.log('Clicked Pricing link.');
      await page.waitForNavigation({ waitUntil: 'networkidle' });
    }
  } catch (e) {
    console.log('No explicit Pricing link found, scanning current page.');
  }

  // Wait for any lazy-loaded content
  await page.waitForTimeout(1500);

  // Extract text content that likely contains pricing
  const bodyText = await page.textContent('body');
  const pricingMatches = bodyText.match(/\$[\d,]+(\.\d{2})?/g) || [];
  const currencyMatches = bodyText.match(/USD\s+\$?[\d,]+/gi) || [];

  console.log('Potential pricing figures found:');
  console.log(' - $ amounts:', pricingMatches);
  console.log(' - USD mentions:', currencyMatches);

  // Also take a screenshot for reference
  await page.screenshot({ path: '/tmp/venued_pricing.png', fullPage: true });
  console.log('Screenshot saved to /tmp/venued_pricing.png');

  // Get page title
  const title = await page.title();
  console.log('Current page title:', title);

  await browser.close();
  console.log('Done.');
})().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
