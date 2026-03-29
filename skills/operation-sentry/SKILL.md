---
name: operation-sentry
description: Performs security and malware checks on the Linux gateway using rkhunter and basic system commands.
version: 1.0.0
---

# Operation Sentry Skill

This skill is designed to enhance the security posture of the Linux gateway by performing regular checks for potential threats and anomalies. It integrates `rkhunter` for rootkit and malware detection, alongside basic system checks for suspicious processes, network activity, and unauthorized configurations.

## Core Functions

### perform_security_scan(report_warnings_only: bool = True)

*   **Description**: Executes a suite of security checks on the Linux gateway.
*   **Parameters**:
    *   `report_warnings_only` (optional, default: `True`): If `True`, `rkhunter` will only report warnings. If `False`, it will report all findings.
*   **Internal Logic**:
    1.  **Check for `rkhunter`**: Verifies if `rkhunter` is installed. If not, reports its absence.
    2.  **Run `rkhunter`**: If installed, executes `rkhunter --check --report-warnings-only` (or `--check` if `report_warnings_only` is `False`). Captures its output.
    3.  **Basic System Checks**: Executes the following commands and captures their output:
        *   **Suspicious Processes**: `ps aux --sort=-%cpu | head -n 10` and `ps aux --sort=-%mem | head -n 10`.
        *   **Open Network Ports**: `ss -tuln`.
        *   **Login History**: `last | head -n 10`.
        *   **Cron Jobs**: `crontab -l` (user jobs), and checks contents of `/etc/cron.d/`, `/etc/cron.hourly/`, `/etc/cron.daily/`, `/etc/cron.weekly/`, `/etc/cron.monthly/`, and `/etc/crontab`.
    4.  **Report Generation**: Compiles all captured outputs from `rkhunter` and basic system checks into a structured report string.
    5.  **Output**: Returns the consolidated report.

*   **Example Usage**:
    ```python
    # In an OpenClaw agent script or tool call
    # skill.perform_security_scan(report_warnings_only=True)
    ```

---

## Prerequisites

*   **`rkhunter`**: Must be installed on the Linux gateway. If not found, the skill will note its absence.
*   **Basic Commands**: Standard Linux utilities (`ps`, `ss`, `last`, `crontab`, `head`, `command`, `grep`, `ls`, `cat`) are assumed to be available.

---

## Future Enhancements

*   Automatic installation of `rkhunter` if not found.
*   Deeper integration with `clamav`.
*   File integrity monitoring.
*   Scheduled execution via OpenClaw's cron/heartbeat system.
