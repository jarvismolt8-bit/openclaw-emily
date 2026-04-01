---
name: cron-skill
description: Schedules cron jobs via OpenClaw cron API
---

# Cron Skill

## IMPORTANT: Execution

When asked to add a cron job, you MUST actually EXECUTE the command, not just show what it would look like.

**Always verify after adding:** Run `openclaw cron list` to confirm the job was created.

## Functions

### add_scheduled_task(task_description, schedule_details, target_channel, target_id, job_name)

Schedule a task. Returns job_id.

### list_scheduled_tasks()
List all jobs. Use this to verify jobs were created.

### remove_scheduled_task(job_id)
Delete a job when no longer needed.

## Available Agents

Use `--agent` to target a specific agent's workspace:

| Agent ID | Workspace | Default Model |
|----------|-----------|---------------|
| main | /root/.openclaw/workspace | gemini-2.5-flash |
| rick | /root/.openclaw/workspaces/rick | minimax-m2.5-free |
| alfred | /root/.openclaw/workspaces/alfred | (default) |
| ultron | /root/.openclaw/workspaces/ultron | (default) |

## Schedule Examples

One-time (runs once):
```python
{"kind": "at", "at": "2026-04-01T10:00:00Z"}
```

Every 3 minutes (recurring):
```python
{"kind": "every", "everyMs": 180000}
```

Every 10 minutes:
```python
{"kind": "every", "everyMs": 600000}
```

Daily at 7am:
```python
{"kind": "cron", "expr": "0 7 * * *", "tz": "America/Los_Angeles"}
```

## CLI Command Format

**Basic (default agent):**
```bash
openclaw cron add \
  --name "Job Name" \
  --every 3m \
  --session isolated \
  --wake next-heartbeat \
  --message "Your task" \
  --announce \
  --channel telegram \
  --to telegram:8369197480
```

**With agent (rick's workspace):**
```bash
openclaw cron add \
  --name "Rick Heartbeat" \
  --every 5m \
  --session isolated \
  --wake next-heartbeat \
  --message "Read /root/.openclaw/workspaces/rick/HEARTBEAT.md. Follow it strictly." \
  --announce \
  --channel telegram \
  --to telegram:8369197480 \
  --agent rick
```

**Common flags:**
- `--every Xm` - interval (e.g., 3m, 5m, 10m)
- `--at "YYYY-MM-DDTHH:MM:SSZ"` - one-shot
- `--cron "0 7 * * *"` - cron expression
- `--tz "America/Los_Angeles"` - timezone
- `--agent rick` - target specific agent's workspace
- `--message` - task description
- `--announce --channel telegram --to telegram:8369197480` - delivery

## Rules

- Use `--agent rick` (etc.) to target a specific agent's workspace
- `deleteAfterRun: false` for recurring jobs (every/cron)
- `deleteAfterRun: true` for one-off jobs (at)
- Use `sessionTarget: "isolated"` for independent runs
- After adding, always verify with `openclaw cron list`
- Delete manually when done: `openclaw cron remove <job-id>
