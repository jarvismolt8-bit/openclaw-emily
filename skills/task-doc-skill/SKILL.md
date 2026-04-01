---
name: task-doc-skill
description: Auto-update task documentation in cashflow-manager when working on tasks
---

# TASK-DOC-SKILL

This skill automatically updates task documentation when working on tasks in the cashflow-manager project, primarily interacting with the task API.

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
**Authentication:** Header `X-API-Key: cfm_9ebe271c5559514a3c33068bd470eb0b8cad214069beeff13a3df8342d48b57a`
**Source Header:** `X-Source: telegram`

## Documentation Management

Documentation is managed directly via the `cashflow-manager` API.

## Workflow

### 1. When User Mentions a Ticket
- Extract ticket ID from message.
- Call API to get task details: `GET /api/v1/tasks/{id}`.
- Check if documentation exists via API: `GET /api/v1/tasks/{id}/documentation`.
- If documentation doesn't exist, create it using the API with the following template content:

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

### 2. During Development
- When making significant progress, update the documentation via the API.
- Add entries to "Progress Notes" with timestamp.
- Update "Development Notes" with implementation details.

### 3. When Task is Completed
- **DO NOT mark as done automatically**.
- Only update documentation with completion notes.
- Wait for user to explicitly request moving to done.

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

To read existing documentation via API:

```bash
curl -X GET "http://localhost:3001/api/v1/tasks/{id}/documentation" \
  -H "X-API-Key: cfm_9ebe271c5559514a3c33068bd470eb0b8cad214069beeff13a3df8342d48b57a" \
  -H "X-Source: telegram"
```

## Creating / Updating Documentation

To create or update documentation via API (POST replaces existing content):

```bash
curl -X POST "http://localhost:3001/api/v1/tasks/{id}/documentation" \
  -H "X-API-Key: cfm_9ebe271c5559514a3c33068bd470eb0b8cad214069beeff13a3df8342d48b57a" \
  -H "X-Source: telegram" \
  -H "Content-Type: application/json" \
  -d '{"content": "# Task {id}: {task_name}\n\n..."}'
```

**Important:** `Content-Type: application/json` is required and `content` must be a non-empty string or the server returns a 400 error.

## Important Rules

1. **Always manage documentation via API** when working on a ticket (create/update if not present or needed).
2. **NEVER move tickets to done** - wait for explicit user request.
3. **Always ensure "Updated" date is current** when modifying documentation.
4. **Keep Progress Notes chronological** - newest at bottom.
5. **Use specific timestamps** - include time when possible.
6. **Be concise** - focus on key progress points.
7. **Link to task** - include task ID in all updates.
