# HEARTBEAT.md - Periodic Tasks

- Periodically review 'in progress' tasks from the cashflow-manager API.
  - Fetch tasks using the API.
  - For each 'in progress' task:
    - Check for existing documentation via API (GET /api/v1/tasks/{id}/documentation).
    - If no documentation exists:
      - Fetch task details (GET /api/v1/tasks/{id}).
      - Use task-doc-skill to create documentation based on task name, description, and objectives.
    - If documentation exists:
      - Read existing documentation.
      - Identify researchable points or objectives from task details.
      - Improve documentation by adding relevant details, data references, or information via API (POST /api/v1/tasks/{id}/documentation).
  - Focus only on documentation and understanding tasks, do NOT execute task objectives.
