---
name: github-skill
description: Manage git repositories on the server. Check status, stage, commit, push, and create PRs for all available repositories.
---

# GitHub Skill

Manage git operations for all repositories on the server.

## Available Repositories

| Name | Path | GitHub |
|------|------|--------|
| openclaw | `/root/.openclaw/` | jarvismolt8-bit/openclaw-emily |
| cashflow | `/var/www/cashflow-manager/` | jarvismolt8-bit/emily-web-app |
| find-your-seat | `/var/www/find-your-seat/` | jarvismolt8-bit/venaiassistant |

## Repository Paths

```bash
OPENCLAW="/root/.openclaw"
WORKSPACE="/root/.openclaw/workspace"
CASHFLOW="/var/www/cashflow-manager"
FIND_YOUR_SEAT="/var/www/find-your-seat"
```

## Quick Reference

### Check Status
```bash
# Specific repo
git -C /root/.openclaw/workspace status
git -C /var/www/cashflow-manager status
git -C /var/www/find-your-seat status

# Shortcut (use path from table above)
git -C <repo-path> status
```

### Stage Files
```bash
# Stage all changes
git -C <repo-path> add .

# Stage specific file
git -C <repo-path> add <filename>

# Stage specific directory
git -C <repo-path> add <directory>/
```

### Commit
```bash
git -C <repo-path> commit -m "<conventional-message>"
```

**Conventional Commit Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `chore:` - Maintenance, refactoring
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `style:` - Code style changes
- `test:` - Adding tests

**Examples:**
```bash
git -C /root/.openclaw/workspace commit -m "feat: add new memory file"
git -C /var/www/cashflow-manager commit -m "fix: resolve login issue"
git -C /var/www/find-your-seat commit -m "chore: update dependencies"
```

### Push
```bash
git -C <repo-path> push
git -C <repo-path> push -u origin main
```

### Pull
```bash
git -C <repo-path> pull
```

### View Changes
```bash
# Show unstaged changes
git -C <repo-path> diff

# Show staged changes
git -C <repo-path> diff --cached

# Show recent commits
git -C <repo-path> log --oneline -10
```

### Branch Operations
```bash
# List branches
git -C <repo-path> branch

# Create new branch
git -C <repo-path> checkout -b <branch-name>

# Switch branch
git -C <repo-path> checkout <branch-name>

# Delete branch
git -C <repo-path> branch -d <branch-name>
```

### Merge
```bash
git -C <repo-path> merge <branch-name>
```

## Pull Requests (requires gh CLI)

If gh CLI is installed and authenticated:

### Create PR
```bash
gh pr create --title "PR Title" --body "PR Description"
gh pr create --title "feat: new feature" --body "Description of changes"
```

### List PRs
```bash
gh pr list
```

### View PR
```bash
gh pr view <pr-number>
```

## Usage Examples

### Scenario 1: User wants to check status
**User:** "Check git status"

**Emily:** Run status check for the relevant repository or ask which one.

```bash
git -C /root/.openclaw/workspace status
git -C /var/www/cashflow-manager status
git -C /var/www/find-your-seat status
```

### Scenario 2: User wants to commit changes
**User:** "Commit my changes"

**Emily:** Stage, commit with appropriate message, and push.

```bash
git -C /root/.openclaw add .
git -C /root/.openclaw commit -m "chore: update files"
git -C /root/.openclaw push
```

### Scenario 2b: User wants to commit workspace changes
**User:** "Commit workspace changes"

**Emily:** Stage, commit with appropriate message, and push.

```bash
git -C /root/.openclaw/workspace add .
git -C /root/.openclaw/workspace commit -m "chore: update files"
git -C /root/.openclaw/workspace push
```

### Scenario 3: User asks what's new
**User:** "What changes do we have?"

**Emily:** Check status and summarize the changes for the user.

```bash
git -C /root/.openclaw/workspace status --short
git -C /var/www/cashflow-manager status --short
git -C /var/www/find-your-seat status --short
```

### Scenario 4: User wants to create a feature branch
**User:** "Create a new feature branch"

**Emily:** Create and switch to new branch.

```bash
git -C /root/.openclaw/workspace checkout -b feature/new-feature
```

## Important Rules

1. **Always use conventional commits** - Start with `feat:`, `fix:`, `chore:`, etc.
2. **Check status before committing** - Know what files are changing
3. **Ask for commit message** - Don't assume message content
4. **Push after commit** - Always push to remote after committing
5. **Use full paths** - Always use absolute paths from the repository table

## Error Handling

### Common Errors

**No changes to commit:**
```
nothing to commit, working tree clean
```
→ Tell user there are no changes to commit.

**Not a git repository:**
```
fatal: not a git repository
```
→ Check the path is correct.

**Remote not configured:**
```
fatal: no remote configured
```
→ Add remote: `git remote add origin <url>`

**Push rejected:**
```
! [rejected] main -> main (fetch first)
```
→ Pull first: `git pull origin main`, then push.

## Helper Script

There's a helper script at `~/workspace/skills/github-skill/github.sh` for convenience:

```bash
# Check status
~/workspace/skills/github-skill/github.sh status openclaw
~/workspace/skills/github-skill/github.sh status workspace

# Check all repos
~/workspace/skills/github-skill/github.sh status-all

# Quick commit and push
~/workspace/skills/github-skill/github.sh quick openclaw "chore: update backup"
~/workspace/skills/github-skill/github.sh quick workspace "feat: new feature"

# Push
~/workspace/skills/github-skill/github.sh push openclaw
~/workspace/skills/github-skill/github.sh push workspace
```

## Notes

- gh CLI is optional - only needed for PR features
- All paths are absolute to avoid confusion
- Always confirm before destructive operations
- Keep commit messages concise but descriptive
