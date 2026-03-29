---
name: cron-skill
description: Manages cron jobs using OpenClaw's cron API, adhering to best practices for reliability and organization.
version: 1.0.0
---

# Cron Skill

This skill provides a structured interface for scheduling and managing tasks using the OpenClaw `cron` tool. It ensures all scheduled jobs follow best practices, such as isolation, automatic cleanup, and clear delivery configurations.

## Core Functions

### add_scheduled_task(task_description: str, schedule_details: dict, target_channel: str = "telegram", target_id: str = "telegram:8369197480", job_name: str = None)

*   **Description:** Schedules a one-time or recurring task.
*   **Parameters:**
    *   `task_description`: The core message or prompt for the task (e.g., "remind me to water plants").
    *   `schedule_details`: A dictionary defining when the task should run. Must include `kind` (e.g., `"at"`, `"every"`, `"cron"`) and the specific time/expression. For example: `{"kind": "at", "at": "2026-02-11T23:00:00Z"}`.
    *   `target_channel` (optional): The messaging channel for the notification (default: `"telegram"`).
    *   `target_id` (optional): The recipient's identifier in the channel (default: `"telegram:8369197480"`).
    *   `job_name` (optional): A custom name for the cron job. If not provided, a name will be generated from `task_description`.
*   **Internal Logic:**
    *   Generates a descriptive `job_name` if one is not provided.
    *   Constructs the `payload` for an `agentTurn` task.
    *   Configures `delivery` for the specified `target_channel` and `target_id`, with `mode: "announce"`.
    *   Sets `sessionTarget: "isolated"` and `deleteAfterRun: True` for one-off tasks.
    *   Calls `default_api.cron(action="add", job={...})` to schedule the task.

### list_scheduled_tasks()

*   **Description:** Retrieves a list of all currently scheduled cron jobs.
*   **Internal Logic:**
    *   Calls `default_api.cron(action="list")`.
    *   Returns the list of jobs.

### remove_scheduled_task(job_id: str)

*   **Description:** Deletes a cron job by its unique ID.
*   **Parameters:**
    *   `job_id`: The ID of the cron job to remove.
*   **Internal Logic:**
    *   Calls `default_api.cron(action="remove", jobId=job_id)`.

### update_scheduled_task(job_id: str, patch_details: dict)

*   **Description:** Modifies an existing cron job.
*   **Parameters:**
    *   `job_id`: The ID of the cron job to update.
    *   `patch_details`: A dictionary containing the fields to update (e.g., new schedule, new task description).
*   **Internal Logic:**
    *   Calls `default_api.cron(action="update", jobId=job_id, patch=patch_details)`.

## Best Practices Integrated

*   **`sessionTarget: "isolated"`:** Jobs run independently.
*   **`payload.kind: "agentTurn"`:** Ensures agent-like execution.
*   **`delivery.announce`:** For direct channel messaging.
*   **`deleteAfterRun: True`:** Automatic cleanup for one-time tasks.
*   **Naming Convention:** Automatically generated or user-specified names.

---