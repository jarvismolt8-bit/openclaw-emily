---
name: task-doc-skill
description: Auto-update task documentation in cashflow-manager when working on tasks
---

# TASK-DOC-SKILL

This skill automatically updates task documentation files when working on tasks in the cashflow-manager project.

## Triggers

This skill activates when:
1. **When conversation mentions a ticket ID** - User says "check task 035", "work on 046", or any ticket number
2. **On task edit/update** - When you update a task via the task-skill
3. **On command** - When user says "document progress", "update doc", or similar
4. **On planning** - When creating a new plan for a task

## IMPORTANT: Do NOT Move Tickets to Done

- **NEVER mark a task as done automatically**
- Only move tickets to done when the user explicitly requests it
- Example: User says "mark 035 as done" or "task 035 complete"

## API Configuration

**Base URL:** `http://localhost:3001/api/v1/tasks`
**Documentation Folder:** `/var/www/cashflow-manager/documentation/`
**Authentication:** Header `X-API-Key: cfm_c8fca68bf28e3e272670211894d12fa00cef3993a22622a778b5c1523698c7d7`
**Source Header:** `X-Source: telegram`

## Documentation File Naming

Files are named: `{task_id}-{slug}.md`
- Example: `035-improve-task.md`, `038-add-ssd-to-cashflow.md`
- The file name should reflect the task name

## Template Content

When creating a new documentation file:

```markdown
# Task {id}: {task_name}

**Created:** {date}  
**Updated:** {date}

## Plan Notes
<!-- User requirements and planning notes go here -->

## Development Notes
<!-- Implementation details and decisions go here -->

## Progress Notes
<!-- Progress updates during development -->
```

## Creating Documentation Workflow

### Step 1: Detect Ticket ID
When user mentions a ticket number (e.g., "task 035", "check 046", "work on 038"):
1. Extract the ticket ID from the message
2. Call API to get task details: `GET /api/v1/tasks/{id}`
3. Check if documentation exists: `GET /api/v1/tasks/{id}/documentation`

### Step 2: Create Documentation (if not exists)
If documentation doesn't exist, create it:

```bash
# Get task details first
curl -X GET "http://localhost:3001/api/v1/tasks/{id}" \
  -H "X-API-Key: cfm_c8fca68bf28e3e272670211894d12fa00cef3993a22622a778b5c1523698c7d7" \
  -H "X-Source: telegram"

# Create documentation
curl -X POST "http://localhost:3001/api/v1/tasks/{id}/documentation" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: cfm_c8fca68bf28e3e272670211894d12fa00cef3993a22622a778b5c1523698c7d7" \
  -H "X-Source: telegram" \
  -d '{
    "content": "# Task {id}: {task_name}\n\n**Created:** {date}\n**Updated:** {date}\n\n## Plan Notes\n- {task description}\n\n## Development Notes\n<!-- To be filled -->\n\n## Progress Notes\n- {date} {time}: Started working on this task\n"
  }'
```

## Update Documentation

When updating progress, use this API:

```bash
curl -X POST "http://localhost:3001/api/v1/tasks/{id}/documentation" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: cfm_c8fca68bf28e3e272670211894d12fa00cef3993a22622a778b5c1523698c7d7" \
  -H "X-Source: telegram" \
  -d '{
    "content": "# Task {id}: {task_name}\n\n**Created:** {created_date}\n**Updated:** {today}\n\n## Plan Notes\n- Point 1\n\n## Development Notes\n- Added new feature\n\n## Progress Notes\n- {timestamp}: Started working on this task\n- {timestamp}: {progress description}\n"
  }'
```

## Workflow

### 1. When User Mentions a Ticket
- Extract ticket ID from message
- Get task details from API
- Check if documentation exists
- If not, create it with template

### 2. During Development
- When making significant progress, update the documentation
- Add entries to "Progress Notes" with timestamp
- Update "Development Notes" with implementation details

### 3. When Task is Completed
- **DO NOT mark as done automatically**
- Only update documentation with completion notes
- Wait for user to explicitly request moving to done

## Progress Note Format

```
- {date} {time}: {description of progress}
```

Example:
```
- Feb 26 2026 10:30am: Created initial documentation file
- Feb 26 2026 11:15am: Implemented 2-column layout in TaskModal
- Feb 26 2026 12:00pm: Completed and tested the feature
```

## Reading Documentation

To read existing documentation:

```bash
curl -X GET "http://localhost:3001/api/v1/tasks/{id}/documentation" \
  -H "X-API-Key: cfm_c8fca68bf28e3e272670211894d12fa00cef3993a22622a778b5c1523698c7d7" \
  -H "X-Source: telegram"
```

## Important Rules

1. **Always create documentation** when working on a ticket - if it doesn't exist
2. **NEVER move tickets to done** - wait for explicit user request
3. **Always update "Updated" date** when modifying documentation
4. **Keep Progress Notes chronological** - newest at bottom
5. **Use specific timestamps** - include time when possible
6. **Be concise** - focus on key progress points
7. **Link to task** - include task ID in all updates
