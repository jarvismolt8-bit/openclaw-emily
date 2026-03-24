# YAHHUAPAYROLL TIME OUT PROCEDURE

## Overview
This document describes the steps to record a "TIME OUT" action on the YAHHUAPayroll employee portal using the novnc-skill (shared browser automation).

## Prerequisites
- Shared Chrome browser must be running (`pm2 status shared-chrome`)
- User must be logged into the YAHHUAPayroll employee portal
- Access to the novnc CLI tool: `node /root/.openclaw/skills/novnc-skill/cli.js`

## Step-by-Step Procedure

### 1. Navigate to the Employee Portal
```bash
node /root/.openclaw/skills/novnc-skill/cli.js open "https://yahshuapayroll.com/employee_portal/"
```

Wait for the page to load completely. The dashboard should display with user information, leave balances, and time tracking section.

### 2. Close the Announcement Popup (if present)
The system may show an "IMPORTANT ANNOUNCEMENTS" modal on first load.

**Method A: Click the "Close" button**
```bash
# Use a custom script or wait and click button with text "Close"
# The button selector typically is: button:has-text("Close")
```

**Method B: Press Escape key**
```bash
node /root/.openclaw/skills/novnc-skill/cli.js press "Escape"
```

### 3. Scroll to the Time Out Button
The "TIME OUT" button is located in the time tracking section, typically below the "On Shift" display. Scroll down to reveal it.

```bash
# Scroll down incrementally (500-800px per scroll) until the TIME OUT button is visible
node /root/.openclaw/skills/novnc-skill/cli.js scroll 500
# Repeat as needed
```

**Tip:** After scrolling, you can verify visibility by checking page text:
```bash
node /root/.openclaw/skills/novnc-skill/cli.js text | grep -i "TIME OUT"
```

### 4. Click the TIME OUT Button
The TIME OUT element is often a `<div>` styled as a button, not a `<button>` tag. Multiple selector strategies should be attempted:

```bash
# Using a custom script with multiple fallback selectors
# Try in order:
# - div:has-text("TIME OUT")
# - button:has-text("TIME OUT")
# - a:has-text("TIME OUT")
# - [title*="TIME OUT"]
# - .time-out
# - #time-out
```

Example script location: `/root/.openclaw/skills/novnc-skill/click_timeout.js`

Run:
```bash
node /root/.openclaw/skills/novnc-skill/cli.js click "div:has-text('TIME OUT')"
```

### 5. Verify Completion
After clicking, wait a moment for the page to update. You should see:
- The "On Shift" running time stops
- The TIME OUT button may change state or become unavailable until next shift
- The weekly hours summary updates

You can verify by checking the page content again or taking a screenshot.

## Troubleshooting

### "Could not find TIME OUT button"
- Ensure you have scrolled enough — the button may be below the fold
- Check if the user is currently "On Shift" — TIME OUT may only be active during a shift
- Inspect the actual page HTML in the VNC UI to find the correct selector

### Page navigation fails (timeout)
- The shared Chrome may have lost connection or cookies. Restart:
  ```bash
  pm2 restart shared-chrome
  ```
- Then re-open the employee portal and log in again manually via VNC UI

### Popup blocks interaction
- Close the "Important Announcements" modal first before attempting to click TIME OUT
- Click "Don't show this again" to prevent future interruptions during this session

## Notes
- The YAHHUAPayroll portal uses a mix of div-based buttons and traditional form elements. Multiple selector strategies increase reliability.
- Human-like delays (500-1000ms) between actions help avoid detection and ensure page updates.
- The employee portal runs an idle timer (3 minutes) that may trigger an automatic logout warning.

## Document References
- Novnc skill location: `/root/.openclaw/skills/novnc-skill/`
- CLI entry: `cli.js`
- Shared browser CDP: `http://127.0.0.1:9222`
- VNC UI: `https://46.225.69.45/browser/` (credentials: `browser` / `2011100099`)
