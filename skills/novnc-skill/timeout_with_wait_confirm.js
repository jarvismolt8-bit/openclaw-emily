const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    // Click TIME OUT
    console.log('Clicking TIME OUT...');
    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('button, a, div[role="button"], span'));
      for (const el of elements) {
        if (el.textContent && el.textContent.trim() === 'TIME OUT') {
          el.click();
          return;
        }
      }
    });
    await page.waitForTimeout(3000); // Wait longer for modal animation

    // Try to click Confirm using force option or via JS
    console.log('Attempting to click Confirm...');
    const confirmFound = await page.$('button:has-text("Confirm")');
    if (confirmFound) {
      const visible = await confirmFound.isVisible();
      console.log(`Confirm button visible: ${visible}`);
      if (visible) {
        await confirmFound.click({ force: true });
        console.log('Clicked Confirm with force');
      } else {
        // JS click fallback
        await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
          for (const btn of btns) {
            if (btn.textContent && btn.textContent.trim() === 'Confirm') {
              btn.click();
              return 'JS clicked Confirm';
            }
          }
          return 'Confirm not found via JS';
          });
          }
        } else {
          throw new Error('Confirm button element not found');
        }

        await page.waitForTimeout(2000);
        console.log(JSON.stringify({ success: true, message: 'Timeout flow done' }));

      } catch (error) {
        console.log(JSON.stringify({ success: false, error: error.message }));
      } finally {
        await browser.close();
      }
    })();