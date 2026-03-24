const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    // Check for input fields in modals
    const inputs = await page.$$('input, textarea');
    console.log(`Total inputs on page: ${inputs.length}`);

    for (let i = 0; i < inputs.length; i++) {
      const tag = await inputs[i].evaluate(el => el.tagName);
      const type = await inputs[i].getAttribute('type');
      const placeholder = await inputs[i].getAttribute('placeholder');
      const name = await inputs[i].getAttribute('name');
      const visible = await inputs[i].isVisible();
      console.log(`Input ${i}: <${tag} type="${type}" placeholder="${placeholder}" name="${name}" visible=${visible}`);
    }

    // Check for any form elements
    const forms = await page.$$('form');
    console.log(`\nForms found: ${forms.length}`);

    // Check current body text around "Are you sure"
    const bodyText = await page.textContent('body');
    const lines = bodyText.split('\n');
    const startIdx = lines.findIndex(l => l.includes('Are you sure'));
    if (startIdx !== -1) {
      console.log('\n=== Modal content ===');
      lines.slice(startIdx, startIdx + 10).forEach(l => console.log(l.trim()));
    }

  } catch (error) {
    console.log(JSON.stringify({ error: error.message }));
  } finally {
    await browser.close();
  }
})();