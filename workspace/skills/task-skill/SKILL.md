---
name: task-skill
description: Manages tasks via API — add, edit, delete, update status, view, sort, and filter tasks. Triggers on phrases like "add task", "mark done", "delete task", "show tasks", "filter web app tasks".
---

# TASK-SKILL

Manage tasks by calling the API. **Always execute the curl command and wait for the response before confirming.**

## Config
- **Base URL:** `http://localhost:3001/api/v1/tasks`
- **Headers (always include):**
  - `X-API-Key: cfm_c8fca68bf28e3e272670211894d12fa00cef3993a22622a778b5c1523698c7d7`
  - `X-Source: telegram`
  - `Content-Type: application/json` (for POST/PUT)
- **Timezone:** Philippine Time (UTC+8) — run `TZ='Asia/Manila' date '+%b %d %Y %l:%M%p'` for current time

## Status Values
| User says | Status |
|-----------|--------|
| done / completed / finished | `done` |
| working on / started / in progress | `in_progress` |
| backlog / not started / todo | `backlog` |
| archive / archived / archive it | `archive` |

## Operations

### ADD — triggers: "add task", "create task", "remind me to"
Extract task name from everything after "task:" or "task ". Default status: `backlog`.
```bash
curl -X POST "http://localhost:3001/api/v1/tasks" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: cfm_c8fca68bf28e3e272670211894d12fa00cef3993a22622a778b5c1523698c7d7" \
  -H "X-Source: telegram" \
  -d '{"name":"<task name>","description":"","priority":"medium","date":"Mar 6 2026","time":"2:30pm","status":"backlog"}'
```

### UPDATE STATUS — triggers: "task is done", "working on", "move to backlog"
Never delete when user says "done" — update status instead.
```bash
curl -X PUT "http://localhost:3001/api/v1/tasks/<id>" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: cfm_c8fca68bf28e3e272670211894d12fa00cef3993a22622a778b5c1523698c7d7" \
  -H "X-Source: telegram" \
  -d '{"status":"done"}'
```

### ARCHIVE — triggers: "archive task", "archive it", "move to archive"
Tasks archived for 30+ days are automatically deleted. Use to declutter done tasks.
```bash
curl -X PUT "http://localhost:3001/api/v1/tasks/<id>" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: cfm_c8fca68bf28e3e272670211894d12fa00cef3993a22622a778b5c1523698c7d7" \
  -H "X-Source: telegram" \
  -d '{"status":"archive"}'
```

### EDIT — triggers: "edit task", "update task", "change task"
GET all tasks first to find the ID, then PUT with updated fields.
```bash
curl -X PUT "http://localhost:3001/api/v1/tasks/<id>" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: cfm_c8fca68bf28e3e272670211894d12fa00cef3993a22622a778b5c1523698c7d7" \
  -H "X-Source: telegram" \
  -d '{"name":"<new name>","priority":"high"}'
```

### DELETE — triggers: "delete task", "remove task" (EXPLICIT only)
```bash
# By ID:
curl -X DELETE "http://localhost:3001/api/v1/tasks/<id>" \
  -H "X-API-Key: cfm_c8fca68bf28e3e272670211894d12fa00cef3993a22622a778b5c1523698c7d7" \
  -H "X-Source: telegram"

# By name:
curl -X DELETE "http://localhost:3001/api/v1/tasks?name=<url-encoded-name>" \
  -H "X-API-Key: cfm_c8fca68bf28e3e272670211894d12fa00cef3993a22622a778b5c1523698c7d7" \
  -H "X-Source: telegram"
```

### VIEW / SORT — triggers: "show tasks", "list tasks", "sort by"
```bash
curl -X GET "http://localhost:3001/api/v1/tasks?sortBy=priority&sortOrder=desc" \
  -H "X-API-Key: cfm_c8fca68bf28e3e272670211894d12fa00cef3993a22622a778b5c1523698c7d7" \
  -H "X-Source: telegram"
```
Sort params: `sortBy=id|date|priority`, `sortOrder=asc|desc`

Display format:
```
🔴📋 001 | Submit report | Mar 6 2026 | 3:00pm
🔵🔄 002 | Build app | Mar 7 2026 | 6:00pm
🟢✅ 003 | Read book
⚫📦 004 | Old task archived
```
Priority: 🔴 high · 🔵 medium · 🟢 low | Status: 📋 backlog · 🔄 in_progress · ✅ done · 📦 archive

### FILTER WEB APP — triggers: "filter web app", "show only X in web app"
```bash
# Set filter:
curl -X POST "http://localhost:3001/api/v1/tasks/filter" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: cfm_c8fca68bf28e3e272670211894d12fa00cef3993a22622a778b5c1523698c7d7" \
  -H "X-Source: telegram" \
  -d '{"status":"done","priority":"","search":""}'

# Clear filter:
curl -X DELETE "http://localhost:3001/api/v1/tasks/filter" \
  -H "X-API-Key: cfm_c8fca68bf28e3e272670211894d12fa00cef3993a22622a778b5c1523698c7d7" \
  -H "X-Source: telegram"
```
Filter fields: `status` (backlog/in_progress/done/archive/""), `priority` (high/medium/low/""), `search` (text/"")