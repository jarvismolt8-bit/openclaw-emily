const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    const title = await page.title();
    const url = page.url();
    console.log(`Title: ${title}`);
    console.log(`URL: ${url}`);

    // Check for time out status indicators
    const bodyText = await page.textContent('body');

    // Look for "On Shift" vs "Off Shift" or similar
    if (bodyText.includes('On Shift')) {
      console.log('Status: Still On Shift');
    }
    if (bodyText.includes('TIME OUT')) {
      console.log('Found TIME OUT button (could still be active)');
    }
    if (bodyText.includes('TIME IN')) {
      console.log('Found TIME IN button (might be timed out now)');
    }

    // Look for any success/confirmation messages
    if (bodyText.includes('successfully') || bodyText.includes('Success') || bodyText.includes('timed out')) {
      console.log('Detected success message');
    }

    console.log('\n=== Full page text (relevant lines) ===');
    const lines = bodyText.split('\n').filter(l => l.trim().length > 0);
    lines.forEach((line, i) => {
      if (line.toUpperCase().includes('SHIFT') || line.toUpperCase().includes('TIME') || line.toUpperCase().includes('OUT') || line.toUpperCase().includes('SUBMIT')) {
        console.log(`${i}: ${line.trim()}`);
      }
    });

  } catch (error) {
    console.log(JSON.stringify({ error: error.message }));
  } finally {
    await browser.close();
  }
})();