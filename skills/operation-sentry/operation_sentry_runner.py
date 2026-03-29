import subprocess
import sys
import os

def run_command(command, check_output=True, shell=False):
    """Executes a shell command and returns its output or an error message."""
    try:
        # Note: Commands requiring sudo will likely fail if the environment lacks elevated permissions.
        # The script attempts to run them, but expect failures if permissions are not granted.
        
        process = subprocess.run(
            command,
            capture_output=True,
            text=True,
            check=check_output,
            shell=shell # Use shell=True for commands involving pipes or complex shell features
        )
        return process.stdout.strip()
    except FileNotFoundError:
        return f"Error: Command not found: {command.split()[0]}"
    except subprocess.CalledProcessError as e:
        # Capture stderr and stdout for CalledProcessError
        return f"Error executing command '{command}':\nStderr: {e.stderr.strip()}\nStdout: {e.stdout.strip()}"
    except Exception as e:
        return f"An unexpected error occurred: {e}"

def perform_security_scan():
    """Performs rkhunter and basic system checks."""
    report = []
    report.append("--- Security Scan Report ---")
    
    # 1. Check for rkhunter and run scan
    report.append("\n--- Checking for rkhunter and running scan ---")
    import shutil
    rkhunter_path = shutil.which("rkhunter")

    if rkhunter_path:
        report.append("rkhunter is installed. Running scan...")
        import subprocess
        try:
            rkhunter_result = subprocess.run(
                "timeout 20 sudo rkhunter --cronjob --report-warnings-only 2>&1",
                shell=True, capture_output=True, text=True, timeout=25
            )
            output = rkhunter_result.stdout + rkhunter_result.stderr
            if output.strip() and "timed out" not in output.lower():
                report.append(f"rkhunter scan results:\n{output[-2000:]}")
            else:
                report.append("rkhunter scan timed out, reading last log entry...")
        except subprocess.TimeoutExpired:
            report.append("rkhunter scan timed out, reading log...")
        except Exception as e:
            report.append(f"rkhunter scan error: {e}")
        
        log_result = subprocess.run(
            "sudo tail -30 /var/log/rkhunter.log 2>/dev/null | grep -E 'Warning|Error|failed|None found' | tail -10",
            shell=True, capture_output=True, text=True
        )
        if log_result.stdout.strip():
            report.append(f"Recent rkhunter log warnings:\n{log_result.stdout}")
        else:
            report.append("No warnings found in recent log")
    else:
        report.append("rkhunter is not installed. Please install it (`sudo apt-get install rkhunter`).")

    report.append("\n--- Performing basic system checks ---")

    # 2. Suspicious Processes (Top CPU & Memory)
    report.append("\nChecking for suspicious processes (Top CPU/Memory)...")
    ps_cpu_command = "ps aux --sort=-%cpu | head -n 10"
    ps_cpu_result = run_command(ps_cpu_command, check_output=False, shell=True)
    report.append(f"Top CPU processes:\n{ps_cpu_result}")

    ps_mem_command = "ps aux --sort=-%mem | head -n 10"
    ps_mem_result = run_command(ps_mem_command, check_output=False, shell=True)
    report.append(f"Top Memory processes:\n{ps_mem_result}")

    # 3. Open Network Ports
    report.append("\nChecking for open network ports...")
    ss_command = "ss -tuln"
    ss_result = run_command(ss_command, check_output=False, shell=True)
    report.append(f"Open network ports:\n{ss_result}")

    # 4. Login History
    report.append("\nChecking recent login history...")
    last_command = "last | head -n 10"
    last_result = run_command(last_command, check_output=False, shell=True)
    report.append(f"Recent logins:\n{last_result}")

    # 5. Cron Jobs
    report.append("\nChecking cron jobs...")
    cron_jobs_report_lines = []
    
    # User cron jobs
    crontab_l_command = "crontab -l"
    crontab_l_result = run_command(crontab_l_command, check_output=False, shell=True)
    if "rkhunter" in crontab_l_result.lower() or "operation-sentry" in crontab_l_result.lower():
         report.append(f"User crontabs contain security scans: {crontab_l_result}")
    elif "no crontab" not in crontab_l_result.lower() and "errors" not in crontab_l_result.lower() and crontab_l_result:
        cron_jobs_report_lines.append("User crontabs:")
        cron_jobs_report_lines.append(crontab_l_result)
    else:
        cron_jobs_report_lines.append("User crontabs: Not found or empty.")

    # System cron directories
    system_cron_dirs = ["/etc/cron.d/", "/etc/cron.hourly/", "/etc/cron.daily/", "/etc/cron.weekly/", "/etc/cron.monthly/"]
    system_cron_found = False
    for cron_dir in system_cron_dirs:
        # Check if directory exists
        dir_check_command = f"if [ -d '{cron_dir}' ]; then echo 'exists'; fi"
        dir_exists = run_command(dir_check_command, check_output=False, shell=True)
        
        if "exists" in dir_exists:
            list_command = f"ls -lA {cron_dir}" # ls -lA to show hidden files too
            list_result = run_command(list_command, check_output=False, shell=True)
            
            if "total 0" not in list_result and list_result.strip():
                system_cron_found = True
                cron_jobs_report_lines.append(f"\n--- Contents of {cron_dir} ---")
                cron_jobs_report_lines.append(list_result)
            else:
                 cron_jobs_report_lines.append(f"\n--- {cron_dir} is empty or no files found ---")

    if not system_cron_found:
        cron_jobs_report_lines.append("\nSystem cron directories: No custom jobs found or directories are empty.")
    
    report.append("\n".join(cron_jobs_report_lines))

    report.append("\n--- Basic system checks completed ---")

    return "\n".join(report)

if __name__ == "__main__":
    # This block executes when the script is run directly.
    # It will attempt to perform the security scan.
    # The output will be captured by OpenClaw's subagent runner.
    
    scan_report = perform_security_scan()
    print(scan_report)
    
    # Explicitly exit with 0 on success, though Python does this by default.
    sys.exit(0)
