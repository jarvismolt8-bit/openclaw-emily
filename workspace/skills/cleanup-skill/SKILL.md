---
name: cleanup-skill
description: Monitor and clean server disk space. Check usage, clean logs, archive old files, and free up space automatically.
---

# Server Cleanup Skill

Monitor disk space and perform cleanup operations to keep the server healthy.

## Quick Status Check

**Check current disk space:**
```bash
df -h /
```

**Check space used by major directories:**
```bash
du -sh /root/.openclaw/workspace /root/.local/share/opencode /root/.cache /root/.npm /var/www 2>/dev/null | sort -h
```

## Cleanup Operations

### 1. Check Space & Alert

**When to clean:**
- Disk usage > 80% (⚠️ Warning)
- Disk usage > 90% (🚨 Critical)
- Available space < 5GB (⚠️ Warning)

**Check current status:**
```bash
cd /root/.openclaw/workspace/skills/cleanup-skill && ./cleanup.sh --check
```

### 2. Clean OpenCode Logs

**Remove logs older than 7 days:**
```bash
find /root/.local/share/opencode/log -name "*.log" -type f -mtime +7 -delete
```

**Remove all logs (keep only current):**
```bash
find /root/.local/share/opencode/log -name "*.log" -type f -mtime +1 -delete
```

**Expected savings:** 5-50MB

### 3. Archive Old Workspace Memory Files

**Archive memory files older than 30 days:**
```bash
cd /root/.openclaw/workspace/skills/cleanup-skill && ./cleanup.sh --archive-memory
```

This will:
- Create `/root/.openclaw/workspace/memory/archive/`
- Move files older than 30 days to archive
- Compress archived files

**Expected savings:** 10MB-500MB (depends on activity)

### 4. Clean NPM Cache

**Clear NPM cache:**
```bash
npm cache clean --force
```

**Expected savings:** 100MB-2GB

### 5. Clean System Cache

**Clear system caches:**
```bash
find /root/.cache -type f -atime +7 -delete 2>/dev/null
```

**Clear browser automation caches:**
```bash
rm -rf /root/.cache/puppeteer/* /root/.cache/ms-playwright/* 2>/dev/null
```

**Expected savings:** 500MB-2GB

### 6. Remove Old node_modules (Not in Use)

**⚠️ DANGEROUS - Only remove from known unused projects**

Check for node_modules:
```bash
find /root -type d -name "node_modules" -exec du -sh {} \; 2>/dev/null | sort -h
```

**Current safe locations:**
- `/var/www/cashflow-manager/backend/node_modules` - KEEP (in use)
- `/var/www/cashflow-manager/frontend/node_modules` - KEEP (in use)
- `/root/.openclaw/workspace/openclaw-repo/node_modules` - CHECK before deleting

### 7. Full Cleanup (Safe Mode)

**Run all safe cleanup operations:**
```bash
cd /root/.openclaw/workspace/skills/cleanup-skill && ./cleanup.sh --safe
```

This performs:
1. Clean OpenCode logs (> 7 days)
2. Archive old memory files (> 30 days)
3. Clean NPM cache
4. Clear system cache
5. Report space freed

**Expected total savings:** 1GB-5GB

### 8. Aggressive Cleanup (⚠️ Use with caution)

**Only if space < 3GB and critical:**
```bash
cd /root/.openclaw/workspace/skills/cleanup-skill && ./cleanup.sh --aggressive
```

This performs safe cleanup PLUS:
- Clear ALL OpenCode logs
- Archive ALL memory files (not just old ones)
- Clear ALL caches

**Expected savings:** 5GB-15GB

## Automatic Monitoring

**Setup automatic disk monitoring:**
```bash
# Add to crontab for daily check at 9 AM
echo "0 9 * * * cd /root/.openclaw/workspace/skills/cleanup-skill && ./cleanup.sh --auto" | crontab -
```

**What --auto does:**
- Check disk space
- If usage > 85%, run safe cleanup
- Send notification to Telegram (if configured)
- Log actions to workspace/cleanup.log

## Manual Recovery

**If server is completely full:**

1. **Emergency cleanup:**
```bash
rm -rf /tmp/*
rm -rf /root/.cache/*
npm cache clean --force
```

2. **Check what's using space:**
```bash
du -h / | grep '[0-9]G\t'
```

3. **Restart services if needed:**
```bash
pm2 restart all
```

## Expected Disk Usage

**Normal ranges:**
- `/root/.openclaw/workspace`: 50MB-500MB
- `/root/.local/share/opencode`: 100MB-1GB (logs), 200MB (snapshots)
- `/root/.cache`: 100MB-500MB
- `/root/.npm`: 100MB-1GB
- `/var/www`: 50MB-100MB

**Total expected:** 2GB-5GB for system + applications

**Alert thresholds:**
- 🟢 Healthy: < 70% usage
- 🟡 Warning: 70-85% usage
- 🟠 Critical: 85-95% usage
- 🔴 Emergency: > 95% usage

## Important Notes

- **Always check before deleting** - Use `du -sh` to verify size
- **Keep recent files** - Don't delete files from today/yesterday
- **Archive, don't delete** - For memory files, archive instead of delete
- **Test first** - Run with `--check` before `--safe` or `--aggressive`
- **Monitor after cleanup** - Check `df -h` to verify space freed

## Integration with Task System

**When user asks:**
- "Clean up server" → Run `./cleanup.sh --safe`
- "Check disk space" → Run `df -h /` and `du -sh` summary
- "We're running low on space" → Check usage, then recommend and run cleanup
- "Delete old logs" → Clean OpenCode logs and system cache

**Automatic triggers:**
- Check daily at 9 AM via cron
- Alert if disk usage > 85%
- Auto-clean if disk usage > 90% (with user notification)
