const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || context.pages()[1] || await context.newPage();

  await page.bringToFront();
  await page.waitForTimeout(2000);

  // Try to click tweet button directly by text without typing everything again
  console.log('Attempting to click Post/Tweet button directly...');
  const btns = await page.$$('button');
  let clicked = false;
  for (const btn of btns) {
    const txt = await btn.textContent().catch(() => '');
    if (/Tweet|Post/.test(txt)) {
      await btn.click();
      console.log('Clicked button with text:', txt.trim());
      clicked = true;
      break;
    }
  }

  if (!clicked) {
    console.log('No button clicked via brute force.');
  }

  await page.waitForTimeout(2000);
  await browser.close();
  console.log('Done.');
})().catch(err => {
  console.error('ERR:', err);
  process.exit(1);
});
