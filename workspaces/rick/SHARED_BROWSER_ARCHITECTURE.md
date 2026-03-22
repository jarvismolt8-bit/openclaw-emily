# Shared Browser Access Architecture

## Overview
Enable a **single Chrome browser instance** on the server that can be:
- Manually viewed and controlled via a web interface ("browser-in-browser")
- Programmatically controlled by multiple OpenClaw agents (Playwright/CDP)
- Supports manual login to social media/web apps, then agent automation on the same session

---

## Architecture Components

### 1. Chrome with Remote Debugging (CDP)
- Google Chrome launched with `--remote-debugging-port=9222`
- Optional: `--user-data-dir` to use a persistent profile (keeps cookies/sessions)
- Disable headless mode to have a real UI display
- May run on a virtual X server (Xvfb) or physical display if available

**Purpose**: Single source of truth. All automation and manual viewing attach to this same browser.

### 2. X Virtual Framebuffer (Xvfb) or Physical Display
- Xvfb provides a virtual display for Chrome when no GUI is present (headless server)
- If the server has a real display (X11), Chrome can run there instead

**Purpose**: Chrome needs an X display to render a UI, even if headless mode is off.

### 3. noVNC (WebSockify) - Optional
- Optional: Provides a VNC server that serves a canvas-based VNC client over HTTP/WebSocket
- Or use **x11vnc** + noVNC to expose the X display via a web page

**Purpose**: Human can open `http://SERVER/browser` (or custom path) and see/interact with Chrome.

**Alternative**: Expose Chrome's DevTools Protocol frontend directly:
- Chrome's internal `chrome://inspect` remote debugging UI, or
- DevTools frontend via `http://SERVER:9222` (limited remote access, but live DOM inspector)

### 4. Shared Chrome Profile
- Dedicated `--user-data-dir` (e.g., `/var/lib/openclaw/browser-profile`)
- Manual login to social media/apps persists across agent sessions
- **Critical**: The browser skill must connect via CDP, not launch its own instance

### 5. New OpenClaw Skill: `shared-browser-skill`
- Wraps Playwright's `connect` logic to attach to the existing CDP endpoint
- API: `browser.open(url, options)`, `browser.snapshot()`, `browser.click(selector)`, etc.
- Mirror the same interface as the current `browser-skill`, but target the shared browser
- Configuration: `{ "cdpUrl": "http://127.0.0.1:9222" }` (or `ws://...`)
- Agent usage:
  ```javascript
  await browser.open("https://example.com", { profile: "shared" });
  ```

---

## Data Flow

```
┌─────────────────┐
│   Human User    │
│  (Web Browser)  │
│   http://Srv/browser  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌────────────────────┐
│      noVNC      │◄────►│    X Virtual      │
│   (WebSocket)   │      │    Display        │
└────────┬────────┘      │   (Xvfb or X11)   │
         │               └─────────┬──────────┘
         │                         │
         │                ┌────────▼──────────┐
         │                │   Google Chrome   │
         │                │ (--remote-debugging-port=9222)│
         │                └─────────┬──────────┘
         │                          │ CDP (WebSocket)
         │                          │
         │                ┌────────▼──────────┐
         └──────────────►│  OpenClaw Agents  │
                          │ (shared-browser-skill)│
                          └───────────────────┘
```

---

## Setup Steps

1. **Install Dependencies**
   - `xvfb` (if needed)
   - `x11vnc` + `novnc` (optional, for web VNC)
   - Chrome/Chromium (already present)

2. **Create Chrome Wrapper Script**
   - Launch Chrome with: `xvfb-run` (if no display), `--remote-debugging-port=9222`, `--user-data-dir=/var/lib/openclaw/browser-profile`, `--no-sandbox` (if needed)
   - Systemd service to run at boot, restart on failure

3. **Expose VNC/noVNC** (optional)
   - Start `x11vnc` on the Xvfb display
   - Start `websockify` (noVNC proxy)
   - Configure web server to serve noVNC at `/browser`

4. **Create `shared-browser-skill`**
   - Directory: `/root/.openclaw/skills/shared-browser-skill/`
   - `SKILL.md` documenting usage, config, requirements
   - Implement Playwright connection:
     ```javascript
     const browser = await playwright.chromium.connectOverCDP('http://127.0.0.1:9222');
     ```
   - Reuse existing Playwright helpers from `browser-skill`

5. **Configure OpenClaw**
   - Add skill to openclaw.json (auto-loaded from skills folder)
   - Verify agent permissions for browser control

6. **Testing**
   - Launch shared Chrome
   - Access VNC view (if enabled), confirm Chrome appears
   - Manually log into a test site
   - Run an agent using `shared-browser-skill` to navigate, scrape, click—same session
   - Verify cookies/session persist

---

## Security Considerations

- **Authentication**: noVNC should require credentials; consider reverse proxy auth (nginx)
- **Network Isolation**: Bind CDP port to 127.0.0.1; agents on same host OK, remote agents need tunnel/SSH port forward
- **Profile Isolation**: The shared browser profile is persistent; clean it periodically if used for sensitive tasks
- **Admin Access**: Only privileged users should be able to start/stop the shared Chrome service
- **Logging**: Record agent actions (URLs visited, selectors clicked) for audit trail

---

## Pros & Cons

**Pros**:
- Single browser used for both manual and automated work
- Maintains session state (logins, cookies)
- Same visual UI for debugging agent actions
- Agents get full browser features, not headless quirks

**Cons**:
- Potential interference if human and agents interact simultaneously
- Requires X display; Xvfb adds minor overhead
- Slightly more complex infrastructure
- Requires careful service management

---

## Alternatives Considered

- **Browserless**: Already in use, but separate from manual browser; doesn't meet "see what's happening" requirement
- **Direct DevTools connection**: Agents can attach to any Chrome with CDP; BUT currently skill launches its own headless Chrome. Would require modifying existing skill to support shared mode.
- **Separate VNC-only browser**: Agents use CDP, human uses VNC—**two decoupled browsers**. Not acceptable because sessions wouldn't match.

---

## Implementation Roadmap

- [ ] Install and test Xvfb + x11vnc + noVNC on server
- [ ] Create systemd unit for shared Chrome
- [ ] Verify manual access via VNC client
- [ ] Create `shared-browser-skill` directory and scaffolding
- [ ] Implement `index.js` with CDP connect, context reuse
- [ ] Write `SKILL.md` with usage examples
- [ ] Test simple agent navigate/click
- [ ] Harden security (auth, localhost binding)
- [ ] Document usage for human operators

---

## Questions & Decisions

- Do we want human to view via VNC *or* directly at `http://SERVER:9222`?
  - **Recommend**: VNC for full UI; 9222 only gives DevTools
- Should agents be able to close the browser accidentally?
  - Implement read-only mode, or require explicit flag to close
- How many concurrent agents?
  - Single Chrome supports multiple CDP connections (should be fine)
