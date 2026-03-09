# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

# Tools & Skills

## Browser Configuration
- **Primary Profile:** openclaw (Google Chrome)
- **Alternative Profile:** browserless (Browserless.io)
- **IMPORTANT:** Use profile="openclaw" for most browser commands
- **Parameter Reminder:** Always use `targetUrl` when opening a website.
- **Location:** Local Google Chrome at /usr/bin/google-chrome
- **Fallback:** Use browserless if Chrome is unavailable

### Browser Commands Reference (Primary - Chrome)
```bash
# Primary: Use Chrome for best performance
browser --browser-profile openclaw open <url>
browser --browser-profile openclaw snapshot
browser --browser-profile openclaw screenshot
```

### Alternative Commands (Browserless)
```bash
# Fallback: Use browserless if needed
browser --browser-profile browserless open <url>
browser --browser-profile browserless snapshot
browser --browser-profile browserless screenshot
```

### Screenshot Location
Screenshots are saved to: `~/.openclaw/media/browser/`

### Browser Comparison
- **Chrome (openclaw)**: Fast, local, reliable - USE THIS BY DEFAULT
- **Browserless (browserless)**: Remote, slower, uses credits - USE AS FALLBACK

## Task Skill
- **Path:** ./skills/task-skill/SKILL.md
- **Usage:** Use this for all task management via the backend API.
- **API:** `http://localhost:3001/api/v1/tasks`

## Cashflow Skill
- **Path:** ./skills/cashflow-skill/SKILL.md
- **Usage:** Use this for all expense and income tracking via the backend API.
- **API:** `http://localhost:3001/api/v1/cashflow`

---

Add whatever helps you do your job. This is your cheat sheet.

---

Add whatever helps you do your job. This is your cheat sheet.
