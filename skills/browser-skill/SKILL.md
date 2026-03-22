# Browser Skill

Configure **Google Chrome** as the primary browser for web browsing, with **Browserless** as the alternative fallback.

## Configuration
- **Primary Profile:** openclaw (Google Chrome)
- **Alternative Profile:** browserless (Browserless.io remote CDP)
- **Parameter Reminder:** Always use `targetUrl` when opening a website.
- **Browser:** Google Chrome 144.0.7559.132
- **Location:** /usr/bin/google-chrome
- **Timeout:** 20000ms HTTP, 25000ms WebSocket

## Usage Examples

### Open a Page (Primary - Chrome)
```javascript
await browser.open("https://example.com", { profile: "openclaw" });
```

### Take Snapshot (Primary - Chrome)
```javascript
await browser.snapshot({ profile: "openclaw" });
```

### Take Screenshot (Primary - Chrome)
```javascript
await browser.screenshot({ profile: "openclaw" });
```

### Alternative: Use Browserless
```javascript
// For remote/CDP-based browsing
await browser.open("https://example.com", { profile: "browserless" });
await browser.snapshot({ profile: "browserless" });
```

## Primary vs Alternative

### Google Chrome (Primary) - profile: "openclaw"
- ✅ **Fast**: Local execution, no network latency
- ✅ **Reliable**: Direct control, no dependency on external services
- ✅ **Full Features**: All Playwright features available
- ✅ **Screenshots**: Saves to ~/.openclaw/media/browser/
- ⚠️ **Resource Usage**: Uses local RAM (~200-400MB)
- ⚠️ **Requires**: Chrome must be installed

### Browserless (Alternative) - profile: "browserless"
- ✅ **Remote**: No local resource usage
- ✅ **Scalable**: Can handle multiple requests
- ⚠️ **Latency**: 1.7s round-trip time
- ⚠️ **External Dependency**: Requires Browserless service
- ⚠️ **Credits**: Uses Browserless API credits
- ⚠️ **Slower**: Network-dependent performance

## Default Browser Protocol

### For Web Search & Crawling
1. **ALWAYS use profile="openclaw"** (Google Chrome) as default
2. Chrome is configured with headless mode for efficiency
3. Screenshots save to: ~/.openclaw/media/browser/

### For Snapshots & Screenshots
1. **Primary**: Use `profile: "openclaw"` for fast local screenshots
2. **Alternative**: Use `profile: "browserless"` if Chrome unavailable
3. **Format**: PNG files with UUID naming

### When to Use Browserless
- When Chrome is not responding
- When you need to conserve local resources
- For testing remote CDP functionality
- As a fallback when primary fails

## Common Tasks

### Web Search & Analysis
```javascript
// Step 1: Open website
await browser.open("https://example.com", { profile: "openclaw" });

// Step 2: Take snapshot for content analysis
const snapshot = await browser.snapshot({ profile: "openclaw" });

// Step 3: Take screenshot for visual reference
const screenshot = await browser.screenshot({ profile: "openclaw" });
```

### Full Page Screenshot
```javascript
await browser.screenshot({ profile: "openclaw", fullPage: true });
```

### Element Screenshot
```javascript
// First get snapshot to find element ref
const snapshot = await browser.snapshot({ profile: "openclaw" });
// Then screenshot specific element
await browser.screenshot({ profile: "openclaw", ref: "12" });
```

## Error Handling

### If Chrome (openclaw) fails:
1. Check status: `openclaw browser status --browser-profile openclaw`
2. Try restarting: `systemctl --user restart openclaw-gateway`
3. **Fallback to browserless**: Use `profile: "browserless"`

### If Browserless fails:
1. Check connectivity: `curl https://production-ams.browserless.io`
2. Verify API key is set in environment
3. **Use Chrome instead**: Switch to `profile: "openclaw"`

## Important Notes

- **Default Profile**: openclaw (Google Chrome) is now the default
- **Headless Mode**: Chrome runs in headless mode automatically
- **No Sandbox**: Configured for headless server environment
- **Screenshots**: Always check ~/.openclaw/media/browser/ for saved files
- **Two Options**: You have both Chrome (fast/local) and Browserless (remote/fallback)

## System Information
- **Server**: Hetzner Ubuntu (headless)
- **RAM**: 2GB available
- **Chrome**: /usr/bin/google-chrome
- **Config**: /root/.openclaw/openclaw.json
- **Screenshots**: ~/.openclaw/media/browser/

## Quick Reference

| Task | Primary (Chrome) | Alternative (Browserless) |
|------|------------------|---------------------------|
| Open URL | `profile: "openclaw"` | `profile: "browserless"` |
| Screenshot | `profile: "openclaw"` | `profile: "browserless"` |
| Snapshot | `profile: "openclaw"` | `profile: "browserless"` |
| Speed | Fast (local) | Slow (network) |
| Reliability | High | Depends on service |

**Bottom line**: Use Chrome (openclaw) for everything by default. Switch to browserless only if needed.