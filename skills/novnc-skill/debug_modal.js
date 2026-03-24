const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    // Click TIME OUT
    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('button, a, div[role="button"], span'));
      for (const el of elements) {
        if (el.textContent && el.textContent.trim() === 'TIME OUT') {
          el.click();
          return;
        }
      }
    });
    await page.waitForTimeout(2500);

    // Get all modal-related content
    const modalHTML = await page.evaluate(() => {
      // Find any visible modal/dialog
      const modals = Array.from(document.querySelectorAll('[role="dialog"], .modal, .popup, .overlay, form'));
      let result = '';
      modals.forEach((m, i) => {
        if (m.offsetParent !== null) { // visible
          result += `Modal ${i}: ${m.outerHTML.substring(0, 800)}\n`;
        }
      });
      return result;
    });

    console.log('=== Modal HTML ===');
    console.log(modalHTML);

    // List all buttons with their text and display
    const allButtons = await page.$$('button, input[type="submit"], a, div[role="button"]');
    console.log(`\nTotal interactive elements: ${allButtons.length}`);
    for (let i = 0; i < allButtons.length; i++) {
      const text = await allButtons[i].textContent();
      const tag = await allButtons[i].evaluate(el => el.tagName);
      const isVisible = await allButtons[i].isVisible();
      console.log(`${i}: <${tag}> "${text?.trim().substring(0, 40)}" visible=${isVisible}`);
    }

  } catch (error) {
    console.log(JSON.stringify({ error: error.message }));
  } finally {
    await browser.close();
  }
})();