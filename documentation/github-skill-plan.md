# GitHub Skill Implementation Plan

**Date:** 2026-02-25
**Status:** Planned
**Skill Name:** github-skill

---

## Objective

Create a `github-skill` that allows Emily to manage git operations for all repositories on the server.

---

## Repositories to Manage

| Name | Local Path | GitHub URL | Remote Name |
|------|------------|------------|-------------|
| Emily Workspace | `/root/.openclaw/workspace/` | `jarvismolt8-bit/openclaw-emily` | origin |
| Cashflow Webapp | `/var/www/cashflow-manager/` | `jarvismolt8-bit/emily-web-app` | origin |
| Find Your Seat | `/var/www/find-your-seat/` | `jarvismolt8-bit/venaiassistant` | origin |

---

## File Structure

```
/root/.openclaw/workspace/skills/github-skill/
├── SKILL.md       # Main skill documentation
└── github.sh      # Helper script for operations
```

---

## SKILL.md Features

### 1. Repository Management
- List all available repositories
- Show repository details (path, remote, branch)
- Quick reference table

### 2. Git Operations
| Command | Description |
|---------|-------------|
| status | Check git status |
| add | Stage files |
| commit | Commit with message |
| push | Push to remote |
| pull | Pull from remote |
| diff | Show changes |
| log | View commit history |
| branch | List/create/switch branches |

### 3. Pull Requests (Optional - requires gh CLI)
- Create PR
- List PRs
- View PR details

### 4. Commit Message Format
Use conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `chore:` - Maintenance, refactoring
- `docs:` - Documentation
- `refactor:` - Code refactoring

---

## Helper Script Features

### Functions
```bash
# Check status for specific repo
github.sh status <repo-name>

# Check all repos at once
github.sh status-all

# Commit and push
github.sh commit <repo-name> "<message>"

# Push changes
github.sh push <repo-name>

# Quick commit (stage all + commit + push)
github.sh quick <repo-name> "<message>"
```

---

## Implementation Steps

1. **Create skill directory**
   ```bash
   mkdir -p /root/.openclaw/workspace/skills/github-skill
   ```

2. **Create SKILL.md**
   - Document all available commands
   - Include usage examples
   - Reference repository paths

3. **Create github.sh helper script**
   - Implement convenience functions
   - Add colored output
   - Make executable

4. **Update MEMORY.md**
   - Add github-skill to skills list
   - Document when to use

5. **Commit and push**
   - Add to workspace git
   - Push to GitHub

---

## Emily's Usage

### When User Says:
- "Check git status" → Show status for relevant repo(s)
- "Commit and push" → Stage all, commit with conventional format, push
- "What's changed?" → Check status and summarize

### Proactive Behavior (Future):
- During heartbeats, optionally check for uncommitted changes
- Notify user of pending changes

---

## Dependencies

### Required:
- git (already installed)

### Optional (for PR features):
- gh CLI (`apt-get install gh`)
- gh auth configured

---

## CPU Impact

**None.** Git operations are:
- Lightweight (milliseconds)
- On-demand only (triggered by user request)
- No background processes
- No cron jobs

---

## Testing

After implementation, test:
1. `git -C /root/.openclaw/workspace status` - Should work
2. `git -C /var/www/cashflow-manager status` - Should work
3. `git -C /var/www/find-your-seat status` - Should work

---

## Success Criteria

- [ ] Skill created at correct path
- [ ] All 3 repos accessible via skill
- [ ] Conventional commits working
- [ ] Emily can use skill when prompted
- [ ] MEMORY.md updated
- [ ] Committed and pushed to GitHub

---

## Notes

- gh CLI installation deferred (can be added later)
- Auto-checking during heartbeats deferred (user requested)
- Skill follows existing skill pattern (like cleanup-skill, task-skill)
