# noVNC Skill — Shared Server Browser

Control a persistent Chrome browser running on the server. All actions are visible in real-time at **https://46.225.69.45/browser/** (credentials: `browser` / `2011100099`).

## Overview

- **CDP URL:** `http://127.0.0.1:9222`
- **Web UI:** `https://46.225.69.45/browser/`
- **Playwright module:** `/usr/lib/node_modules/openclaw/node_modules/playwright-core`
- **Browser user data:** `/var/lib/openclaw/browser-profile`
- **Display:** `:99` (Xvfb virtual display)

The shared Chrome runs headed (visible) under Xvfb. Both human and agents share the same browser session — cookies, logins, and page state persist across all interactions.

## Connection

### Pattern

```javascript
const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages()[0] || await context.newPage();
```

### Getting Pages

```javascript
// Get existing pages (may have been opened by human or previous agent)
const pages = browser.contexts()[0].pages();

// Open a new page in the shared session
const page = await browser.contexts()[0].newPage();
```

### Closing Connection

**IMPORTANT:** `browser.close()` on a CDP-connected browser **only disconnects** — it does NOT kill the shared Chrome process. Always call it when done.

```javascript
await browser.close();
```

## Usage Examples

### Open a URL

```javascript
const page = await browser.contexts()[0].newPage();
await page.goto('https://example.com', { waitUntil: 'networkidle' });
```



### Take Snapshot (HTML content)

```javascript
const page = browser.contexts()[0].pages()[0];
const content = await page.content();
```

### Click an Element

```javascript
await page.click('button#submit');
await page.click('a[href="/login"]');
```

### Type Text

```javascript
await page.fill('input[name="username"]', 'myuser');
await page.fill('input[name="password"]', 'mypass');
await page.click('button[type="submit"]');
```

### Get Text Content

```javascript
const text = await page.textContent('h1');
```

### Wait for Navigation

```javascript
await page.click('a.next-page');
await page.waitForNavigation({ waitUntil: 'networkidle' });
```

### Wait for Element

```javascript
await page.waitForSelector('div.success-message', { timeout: 10000 });
```



### Hover and Drag

```javascript
await page.hover('#draggable');
await page.dragAndDrop('#draggable', '#dropzone');
```

## Session Sharing

The shared browser is a **single persistent session** shared between human and all agents.

- Human logs in at `/browser/` — agent can access those sessions
- Agent navigates to a page — human sees it happen live
- Last write wins — no locking, cooperative access only

### When to Use

- Human has already logged into a site and agent needs to continue
- Agent actions need to be visible to human in real-time
- Any task requiring existing session state (cookies, auth tokens)

### When NOT to Use

- Parallel or isolated tasks — use separate browser profiles instead
- Tasks requiring fresh sessions — use browser-skill with `profile: "openclaw"`

## Screenshot Policy

- **DO NOT take screenshots automatically** — only when the human or task explicitly requests it
- The shared browser is visible in real-time at `/browser/` — the human can see all navigation without screenshots
- If a screenshot is needed, it will be requested explicitly

## Rules

- **NEVER call `browser.close()` and expect Chrome to stay running** — it only disconnects the CDP session; Chrome continues. However, do not call it unnecessarily.
- **DO call `browser.close()` when done** — releases the CDP connection properly.
- **Do not navigate to `about:blank`** or chrome-internal pages — these may cause issues.
- **Cooperative access only** — only one agent should control at a time.
- **CDP is local-only** — `http://127.0.0.1:9222` is never exposed externally.

## Troubleshooting

### `ECONNREFUSED` on CDP connection

The shared Chrome may have crashed. Check:
```bash
pm2 list
pm2 logs shared-chrome --lines 20
pm2 restart shared-chrome
```

### Page returns blank / about:blank

The shared Chrome may have been restarted or is on a blank page. Open a new page:
```javascript
const page = await browser.contexts()[0].newPage();
await page.goto('https://example.com');
```



### "Browser or context has been closed"

CDP connection was lost (Chrome restarted). Reconnect:
```javascript
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const context = browser.contexts()[0];
const page = context.pages()[0] || await context.newPage();
```

## Quick Reference

| Task | Code |
|------|------|
| Connect | `chromium.connectOverCDP('http://127.0.0.1:9222')` |
| Get page | `browser.contexts()[0].pages()[0]` |
| Open URL | `page.goto(url)` |
| Click | `page.click(selector)` |
| Type | `page.fill(selector, text)` |
| Disconnect | `browser.close()` |
