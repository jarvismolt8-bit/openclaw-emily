---
name: novnc
description: Control the shared Chrome browser via CDP (noVNC) to automate web interactions, including X.com posting
metadata:
  openclaw:
    emoji: 🌐
    requires:
      bins: ["node"]
      modules: ["playwright-core"]
    cdpUrl: "http://127.0.0.1:9222"
    webUi: "https://46.225.69.45/browser/"
    credentials: "browser / 2011100099"
---

# noVNC Skill — Shared Server Browser

Control a persistent Chrome browser running on the server. All actions are visible in real-time at **https://46.225.69.45/browser/** (credentials: `browser` / `2011100099`).

## Overview

- **CDP URL:** `http://127.0.0.1:9222`
- **Web UI:** `https://46.225.69.45/browser/`
- **Playwright module:** `/usr/lib/node_modules/openclaw/node_modules/playwright-core`
- **Browser user data:** `/var/lib/openclaw/browser-profile`
- **Display:** `:99` (Xvfb virtual display)

The shared Chrome runs headed (visible) under Xvfb. Both human and agents share the same browser session — cookies, logins, and page state persist across all interactions.

## When to Use

✅ **USE this skill when:**

- Navigating to websites
- Clicking buttons or links
- Typing into form fields
- Posting to X.com (if logged in)
- Taking screenshots
- Extracting page content

❌ **DON'T use this skill when:**

- You need isolated sessions (use separate browser profiles)
- You need to bypass authentication (shared browser may already have auth)
- Tasks requiring headless operation (this browser is visible)

## Commands

Run via `node /root/.openclaw/skills/novnc-skill/cli.js <command> [args...]`

### Navigation

```bash
# Open a URL
node cli.js open "https://example.com"

# Reload current page
node cli.js reload

# Go back
node cli.js back

# Go forward
node cli.js forward

# Create new tab/page
node cli.js new "https://example.com"
```

### Interaction

```bash
# Click an element
node cli.js click "button[type='submit']"

# Type into a field (auto-focuses the element)
node cli.js type "input#username" "myuser"

# Fill a field (clears first)
node cli.js fill "textarea#comment" "Hello world"

# Press a keyboard key
node cli.js press "Enter"
```

### Extracting Content

```bash
# Get full HTML content
node cli.js content

# Get page title
node cli.js title

# Get current URL
node cli.js url

# Get text from a selector (default: body)
node cli.js text "div.content"

# Take screenshot (returns base64 data URL)
node cli.js screenshot
# For raw binary: node cli.js screenshot raw
```

### Posting to X.com

```bash
# Post a tweet (assumes logged in and on X.com home)
node cli.js post "Your tweet text here"
```

The `post` command will:
1. Navigate to `https://x.com/home` if not already on X.com
2. Find the "What's happening?" textarea
3. Type your tweet
4. Click the "Post" button
5. Wait briefly for completion

**Important:** The shared browser must be logged into X.com. Verify by visiting `https://46.225.69.45/browser/` and confirming you see the home timeline with tweets. If not logged in, log in manually first, then the session persists for all agent interactions.

#### Alternative: Manual Step-By-Step

If the `post` command fails due to selector changes on X.com, you can execute the steps manually:

```bash
# 1. Ensure on X.com home
node cli.js open "https://x.com/home"

# 2. Wait for page to load
node cli.js wait 3000

# 3. Click the "What's happening?" textarea
node cli.js click '[aria-label*="What\'s happening?"]'

# 4. Type your tweet
node cli.js type '[aria-label*="What\'s happening?"]' "Your tweet text here"

# 5. Click the "Post" button
node cli.js click '[data-testid="tweetButtonInline"]'

# 6. Wait for posting to complete
node cli.js wait 2000
```

The selectors used by X.com may change. If the above fail, inspect the page in the browser UI and adjust selectors accordingly. Common selectors include:
- Textarea: `[data-testid="tweetTextarea_0"]`, `div[role="textbox"]`
- Post button: `[data-testid="tweetButton"]`, `[data-testid="tweetButtonInline"]`

### Wait

```bash
# Wait for N milliseconds
node cli.js wait 2000
```

## Connection

The skill always connects to the shared browser at `http://127.0.0.1:9222`. If connection fails, verify the `shared-chrome` PM2 process is running:

```bash
pm2 list | grep shared-chrome
pm2 logs shared-chrome --lines 20
```

To restart:

```bash
pm2 restart shared-chrome
```

## Output Format

All commands return a JSON object on stdout:

**Success:**
```json
{
  "success": true,
  "command": "open",
  "data": { "url": "https://example.com" }
}
```

**Failure:**
```json
{
  "success": false,
  "command": "click",
  "error": "Element not found"
}
```

### Screenshot Output

The `screenshot` command returns a data URL in base64:

```json
{
  "success": true,
  "command": "screenshot",
  "data": { "screenshot": "data:image/png;base64,iVBORw0..." }
}
```

Use `screen raw` to get raw binary (not JSON) output directly.

## Examples

### Open X.com and post a tweet

```bash
node cli.js open "https://x.com/home"
node cli.js wait 3000
node cli.js post "Automated tweet from Ultron"
```

### Fill a form and submit

```bash
node cli.js fill "input[name='email']" "user@example.com"
node cli.js fill "input[name='password']" "secret123"
node cli.js click "button[type='submit']"
```

### Take a screenshot

```bash
node cli.js screenshot > screenshot.json
# Extract the data URL
```

## Session Sharing

The shared browser is a **single persistent session** shared between human and all agents.

- Human logs in at `/browser/` — agent can access those sessions
- Agent navigates to a page — human sees it happen live
- Last write wins — cooperative access only

### Cooperation Tips

- Only one agent should control the browser at a time
- Use `pm2 logs shared-chrome` to debug connection issues
- If the browser crashes, restart with `pm2 restart shared-chrome`

## Troubleshooting

### `ECONNREFUSED` on CDP connection

The shared Chrome may have crashed. Restart:

```bash
pm2 restart shared-chrome
```

### Page returns blank / about:blank

The shared Chrome may have been restarted. Use:

```bash
node cli.js new "https://example.com"
```

### Selectors not found

The page may not have finished loading. Add a wait:

```bash
node cli.js wait 2000
node cli.js click "button.submit"
```

X.com especially may require longer waits.

### Post fails on X.com

Ensure you're logged in. The shared browser must have an active session. Verify via the Web UI at `https://46.225.69.45/browser/`. If not logged in, log in manually once, then the session cookies will persist.

## Notes

- **Do not call `browser.close()` and expect Chrome to stay running** — the skill uses `connectOverCDP()` and closes the CDP session only; Chrome continues.
- **Auto-connect** — Each CLI invocation connects, performs actions, and disconnects. No persistent state is kept between CLI calls (except the shared browser's own state).
- **Timeouts** — Default timeouts are 30 seconds for navigation, 5 seconds for element interactions. Adjust with custom script if needed.

## Advanced Usage

For more complex sequences, you can chain commands in a shell script:

```bash
#!/bin/bash
node cli.js open "https://x.com/home"
node cli.js wait 2000
node cli.js post "$1"
```

Or integrate with OpenClaw agents by invoking `node /root/.openclaw/skills/novnc-skill/cli.js` via the `exec` tool.

## Skill Metadata

- **Name:** novnc
- **Description:** Control the shared Chrome browser via CDP (noVNC) to automate web interactions, including X.com posting
- **Emoji:** 🌐
- **CDP Endpoint:** http://127.0.0.1:9222 (local only)
- **Web UI:** https://46.225.69.45/browser/
- **Shared Credentials:** browser / 2011100099 (for Web UI only)
- **Dependencies:** playwright-core (installed), Node.js
