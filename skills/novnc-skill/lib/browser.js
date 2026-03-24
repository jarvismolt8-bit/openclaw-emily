const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

const CDP_URL = process.env.NOVNC_CDP_URL || 'http://127.0.0.1:9222';

class BrowserController {
  constructor() {
    this.browser = null;
  }

  async connect() {
    if (this.browser) return this.browser;
    this.browser = await chromium.connectOverCDP(CDP_URL);
    return this.browser;
  }

  async getContext() {
    const browser = await this.connect();
    const contexts = browser.contexts();
    if (contexts.length === 0) {
      throw new Error('No browser contexts available');
    }
    return contexts[0];
  }

  async getPage(index = 0) {
    const context = await this.getContext();
    const pages = context.pages();
    if (pages.length === 0) {
      return await context.newPage();
    }
    return pages[Math.min(index, pages.length - 1)];
  }

  async goto(url, waitUntil = 'networkidle', timeout = 30000) {
    const page = await this.getPage();
    await page.goto(url, { waitUntil, timeout });
    return { success: true, url: page.url() };
  }

  async click(selector, timeout = 5000) {
    const page = await this.getPage();
    await page.waitForSelector(selector, { timeout });
    await page.click(selector);
    return { success: true };
  }

  async type(selector, text, delay = 50) {
    const page = await this.getPage();
    await page.waitForSelector(selector, { timeout: 5000 });
    await page.fill(selector, '');
    await page.type(selector, text, { delay });
    return { success: true };
  }

  async fill(selector, text) {
    const page = await this.getPage();
    await page.waitForSelector(selector, { timeout: 5000 });
    await page.fill(selector, text);
    return { success: true };
  }

  async press(key) {
    const page = await this.getPage();
    await page.keyboard.press(key);
    return { success: true };
  }

  async content() {
    const page = await this.getPage();
    return await page.content();
  }

  async title() {
    const page = await this.getPage();
    return await page.title();
  }

  async url() {
    const page = await this.getPage();
    return page.url();
  }

  async textContent(selector = 'body') {
    const page = await this.getPage();
    return await page.textContent(selector);
  }

  async screenshot(encoding = 'base64') {
    const page = await this.getPage();
    const buffer = await page.screenshot({ fullPage: false });
    if (encoding === 'base64') {
      return buffer.toString('base64');
    }
    return buffer;
  }

  async waitForSelector(selector, timeout = 5000) {
    const page = await this.getPage();
    await page.waitForSelector(selector, { timeout });
    return { success: true };
  }

  async waitForLoadState(state = 'networkidle', timeout = 30000) {
    const page = await this.getPage();
    await page.waitForLoadState(state, { timeout });
    return { success: true };
  }

  async reload(timeout = 30000) {
    const page = await await this.getPage();
    await page.reload({ waitUntil: 'networkidle', timeout });
    return { success: true };
  }

  async back() {
    const page = await this.getPage();
    await page.goBack();
    return { success: true };
  }

  async forward() {
    const page = await this.getPage();
    await page.goForward();
    return { success: true };
  }

  async newPage(url = 'about:blank') {
    const context = await this.getContext();
    const page = await context.newPage();
    if (url !== 'about:blank') {
      await page.goto(url, { waitUntil: 'networkidle' });
    }
    return { success: true, url: page.url() };
  }

  async closeDisconnect() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // NEW: Wait for element to be visible and clickable with dynamic selector matching
  async waitFor(condition, timeout = 10000) {
    const page = await this.getPage();
    const start = Date.now();

    return new Promise((resolve, reject) => {
      const check = async () => {
        try {
          if (condition.type === 'selector') {
            await page.waitForSelector(condition.selector, { timeout: 1000 });
            resolve({ success: true, message: `Selector "${condition.selector}" appeared` });
          } else if (condition.type === 'text') {
            const text = await page.textContent('body');
            if (text.includes(condition.text)) {
              resolve({ success: true, message: `Text "${condition.text}" found` });
            } else {
              throw new Error('Text not yet found');
            }
          } else if (condition.type === 'function') {
            const result = await page.evaluate(condition.fn);
            if (result) {
              resolve({ success: true, message: 'Condition satisfied' });
            } else {
              throw new Error('Condition not yet met');
            }
          } else if (condition.type === 'visible') {
            const element = await page.$(condition.selector);
            if (element) {
              const visible = await element.isVisible();
              if (visible) {
                resolve({ success: true, message: `Element ${condition.selector} is visible` });
              } else {
                throw new Error('Element not visible yet');
              }
            } else {
              throw new Error('Element not found');
            }
          }
        } catch (e) {
          if (Date.now() - start > timeout) {
            reject(new Error(`Timeout waiting for condition: ${e.message}`));
          } else {
            setTimeout(check, 250);
          }
        }
      };
      check();
    });
  }

  // NEW: Robust click with multiple selector strategies and visibility wait
  async robustClick(target, timeout = 10000) {
    const page = await this.getPage();
    const start = Date.now();

    // Strategy 1: Try exact text match on clickable elements
    const tryTextClick = async () => {
      const elements = await page.$$('button, a, div[role="button"], span');
      for (const el of elements) {
        try {
          const txt = await el.textContent();
          if (txt && txt.trim() === target) {
            await el.scrollIntoViewIfNeeded();
            await page.waitForTimeout(200);
            await el.click();
            return { success: true, method: 'text-match' };
          }
        } catch (e) {}
      }
      throw new Error('No element with exact text found');
    };

    // Strategy 2: Try CSS selector with :has-text
    const trySelectorClick = async () => {
      const selectors = [
        `button:has-text("${target}")`,
        `a:has-text("${target}")`,
        `div:has-text("${target}")`,
        `[aria-label*="${target}"]`,
        `[title*="${target}"]`,
        `.${target.toLowerCase().replace(/\s+/g, '-')}`,
        `#${target.toLowerCase().replace(/\s+/g, '-')}`
      ];

      for (const selector of selectors) {
        try {
          await page.waitForSelector(selector, { timeout: 2000 });
          await page.click(selector);
          return { success: true, method: `selector:${selector}` };
        } catch (e) {
          continue;
        }
      }
      throw new Error('No selector matched');
    };

    // Strategy 3: Force click via JS
    const tryJSClick = async () => {
      const result = await page.evaluate((t) => {
        const elements = Array.from(document.querySelectorAll('button, a, div[role="button"], span'));
        const el = elements.find(e => e.textContent && e.textContent.trim() === t);
        if (el) {
          el.click();
          return 'js-click';
        }
        return null;
      }, target);
      if (result) {
        return { success: true, method: 'js-injection' };
      }
      throw new Error('JS click failed');
    };

    // Execute strategies with timeout
    const strategies = [tryTextClick, trySelectorClick, tryJSClick];
    let lastError;

    for (const strategy of strategies) {
      try {
        const result = await Promise.race([
          strategy(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Strategy timeout')), timeout / strategies.length))
        ]);
        return result;
      } catch (e) {
        lastError = e;
        // Continue to next strategy
      }
    }

    throw new Error(`All click strategies failed. Last error: ${lastError?.message}`);
  }

  // NEW: Fill form field with better waiting
  async robustFill(selector, text, options = {}) {
    const page = await this.getPage();
    const { clear = true, blur = true } = options;

    // Wait for field to be ready
    await page.waitForSelector(selector, { timeout: 5000 });
    const element = await page.$(selector);

    if (!element) {
      throw new Error(`Element not found: ${selector}`);
    }

    // Scroll into view
    await element.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);

    // Focus and clear if needed
    await element.focus();
    if (clear) {
      await page.keyboard.down('Control');
      await page.keyboard.press('A');
      await page.keyboard.up('Control');
      await page.keyboard.press('Backspace');
    }

    // Type with variable speed
    await page.type(selector, text, { delay: 50 + Math.random() * 100 });

    if (blur) {
      await page.keyboard.press('Tab');
    }

    return { success: true };
  }

  // NEW: Wait for modal to appear and be ready
  async waitForModal(timeout = 10000) {
    const page = await this.getPage();

    return await page.waitForFunction(() => {
      const modals = document.querySelectorAll('[role="dialog"], .modal, .popup, .overlay');
      for (const modal of modals) {
        if (modal.offsetParent !== null) {
          return true;
        }
      }
      return false;
    }, { timeout });

    return { success: true };
  }

  // NEW: Take screenshot and optionally extract text via OCR (basic)
  async captureWithText() {
    const page = await this.getPage();
    const screenshot = await page.screenshot({ fullPage: true });
    const base64 = screenshot.toString('base64');

    // Extract visible text as simple alternative to OCR
    const pageText = await page.textContent('body');

    return {
      success: true,
      screenshot: base64,
      text: pageText.substring(0, 5000) // Limit size
    };
  }

  // NEW: Execute custom JavaScript safely
  async execute(script, args = []) {
    const page = await this.getPage();
    const result = await page.evaluate(script, ...args);
    return { success: true, result };
  }
}

module.exports = BrowserController;