# skills/cron_skill/cron_skill.py

import asyncio
import re
import json
from typing import Dict, Any, List, Optional

# Assume default_api is available in the execution environment
# For local testing or understanding, you might mock it, but in OpenClaw, it's provided.
# from ...default_api import default_api # This import path might vary based on OpenClaw's structure.
# For simulation purposes here, we'll assume default_api is globally accessible or imported implicitly.

# Mock default_api for demonstration if running outside OpenClaw context
# In a real OpenClaw environment, this mock would not be needed.
try:
    default_api
except NameError:
    class MockDefaultApi:
        def cron(self, action: str, job: Optional[Dict[str, Any]] = None, jobId: Optional[str] = None, patch: Optional[Dict[str, Any]] = None, list: Optional[bool] = None):
            print(f"Mock default_api.cron called with action='{action}', jobId='{jobId}', job={json.dumps(job, indent=2) if job else 'None'}, patch={json.dumps(patch, indent=2) if patch else 'None'}")
            if action == "list":
                return {"cron_response": {"output": '{"jobs": []}'}} # Simulate empty list
            elif action == "add":
                return {"cron_response": {"output": json.dumps({"id": "mock-job-id-123", "name": job.get("name", "mock_job"), "enabled": True, "schedule": job.get("schedule"), "sessionTarget": job.get("sessionTarget"), "payload": job.get("payload"), "delivery": job.get("delivery"), "deleteAfterRun": job.get("deleteAfterRun")}, indent=2)}}
            elif action == "remove":
                return {"cron_response": {"output": json.dumps({"status": "success", "message": f"Job {jobId} removed"})}}
            elif action == "update":
                return {"cron_response": {"output": json.dumps({"status": "success", "message": f"Job {jobId} updated"})}}
            return {"error": "Unknown action"}
    default_api = MockDefaultApi()


class CronSkill:
    def __init__(self):
        # Defaults for target channel and ID, can be overridden
        self.default_target_channel = "telegram"
        self.default_target_id = "telegram:8369197480" # Assuming this is the user's primary chat

    def _generate_job_name(self, task_description: str) -> str:
        """Generates a simple, descriptive name for a cron job from its description."""
        # Take the first few words, sanitize them, and append a short prefix
        words = task_description.split()
        name_base = "_".join(words[:4]).lower()
        # Sanitize: remove non-alphanumeric characters except underscore
        sanitized_name = re.sub(r'[^\w_]+', '', name_base)
        if not sanitized_name:
            sanitized_name = "unnamed_task"
        return f"auto_task_{sanitized_name}"

    async def add_scheduled_task(self, 
                                 task_description: str, 
                                 schedule_details: Dict[str, Any], 
                                 target_channel: Optional[str] = None, 
                                 target_id: Optional[str] = None, 
                                 job_name: Optional[str] = None):
        """
        Schedules a task using OpenClaw's cron API, adhering to best practices.
        """
        if not task_description or not schedule_details:
            return {"error": "Task description and schedule details are required."}

        # Use defaults if not provided
        target_channel = target_channel if target_channel else self.default_target_channel
        target_id = target_id if target_id else self.default_target_id

        # Generate a job name if none is provided
        if not job_name:
            job_name = self._generate_job_name(task_description)

        # Construct the job payload
        payload = {
            "kind": "agentTurn",
            "message": task_description
        }

        # Construct the delivery configuration
        delivery = {
            "mode": "announce",
            "channel": target_channel,
            "to": target_id
        }

        # Base job configuration with best practices
        is_recurring = schedule_details.get("kind") in ("every", "cron")
        job_config = {
            "name": job_name,
            "enabled": True,
            "schedule": schedule_details,
            "sessionTarget": "isolated",
            "wakeMode": "next-heartbeat",
            "payload": payload,
            "delivery": delivery,
            "deleteAfterRun": not is_recurring,
        }

        print(f"Scheduling job: {job_name} with schedule: {schedule_details}")

        try:
            response = default_api.cron(action="add", job=job_config)
            print(f"Cron API response: {response}")
            return response
        except Exception as e:
            print(f"Error scheduling cron job: {e}")
            return {"error": f"Failed to schedule cron job: {e}"}

    async def list_scheduled_tasks(self) -> Dict[str, Any]:
        """
        Lists all currently scheduled cron jobs.
        """
        print("Listing scheduled cron jobs...")
        try:
            response = default_api.cron(action="list")
            print(f"Cron API response: {response}")
            return response
        except Exception as e:
            print(f"Error listing cron jobs: {e}")
            return {"error": f"Failed to list cron jobs: {e}"}

    async def remove_scheduled_task(self, job_id: str) -> Dict[str, Any]:
        """
        Removes a scheduled cron job by its ID.
        """
        if not job_id:
            return {"error": "Job ID is required to remove a task."}

        print(f"Removing cron job with ID: {job_id}...")
        try:
            response = default_api.cron(action="remove", jobId=job_id)
            print(f"Cron API response: {response}")
            return response
        except Exception as e:
            print(f"Error removing cron job {job_id}: {e}")
            return {"error": f"Failed to remove cron job {job_id}: {e}"}

    async def update_scheduled_task(self, job_id: str, patch_details: Dict[str, Any]) -> Dict[str, Any]:
        """
        Updates an existing cron job.
        """
        if not job_id or not patch_details:
            return {"error": "Job ID and patch details are required to update a task."}

        print(f"Updating cron job {job_id} with: {patch_details}...")
        try:
            response = default_api.cron(action="update", jobId=job_id, patch=patch_details)
            print(f"Cron API response: {response}")
            return response
        except Exception as e:
            print(f"Error updating cron job {job_id}: {e}")
            return {"error": f"Failed to update cron job {job_id}: {e}"}

# --- Example Usage (for testing or demonstration outside OpenClaw) ---
# async def demo():
#     skill = CronSkill()
#     print("\n--- Demonstrating add_scheduled_task ---")
#     # Example: Schedule a UX tip for tomorrow
#     tomorrow_schedule = {"kind": "at", "at": "2026-02-12T10:00:00Z"}
#     await skill.add_scheduled_task(
#         task_description="Call Mom",
#         schedule_details=tomorrow_schedule,
#         job_name="call-mom-reminder"
#     )

#     print("\n--- Demonstrating list_scheduled_tasks ---")
#     await skill.list_scheduled_tasks()

#     print("\n--- Demonstrating remove_scheduled_task (mock ID) ---")
#     await skill.remove_scheduled_task(job_id="mock-job-id-123")

#     print("\n--- Demonstrating update_scheduled_task (mock ID) ---")
#     await skill.update_scheduled_task(job_id="mock-job-id-123", patch_details={"schedule": {"kind": "at", "at": "2026-02-12T11:00:00Z"}})

# if __name__ == "__main__":
#     asyncio.run(demo())
