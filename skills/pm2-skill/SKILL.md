---
name: pm2-skill
description: Manage server services (PM2 processes) - start, stop, restart, and check status of services like OpenCode, Cashflow, and Find Your Seat.
---

# PM2 Service Manager

Manage server services running on PM2. You can start, stop, restart, and check the status of services.

## Available Services

| Service Name | Description |
|--------------|-------------|
| opencode-serve | OpenCode API server (port 4096) |
| cashflow-backend | Cashflow Manager API (port 3001) |
| find-your-seat | Find Your Seat app |

## Check Service Status

Get list of all running services:

```bash
pm2 list
```

Or check a specific service:

```bash
pm2 list | grep SERVICE_NAME
```

## Start a Service

```bash
pm2 start PATH_TO_SCRIPT --name SERVICE_NAME
```

**Examples:**

Start OpenCode:
```bash
pm2 start /root/.openclaw/opencode-repo/packages/opencode/dist/index.js --name opencode-serve
```

Start Cashflow Backend:
```bash
pm2 start /var/www/cashflow-manager/backend/server.js --name cashflow-backend
```

## Stop a Service

```bash
pm2 stop SERVICE_NAME
```

**Examples:**
```bash
pm2 stop opencode-serve
pm2 stop cashflow-backend
pm2 stop find-your-seat
```

## Restart a Service

```bash
pm2 restart SERVICE_NAME
```

**Examples:**
```bash
pm2 restart opencode-serve
pm2 restart cashflow-backend
```

## View Service Logs

```bash
pm2 logs SERVICE_NAME --lines 20
```

**Examples:**
```bash
pm2 logs opencode-serve --lines 20
pm2 logs cashflow-backend --lines 20
```

## Delete a Service

Remove a service from PM2 (stops it first):

```bash
pm2 delete SERVICE_NAME
```

## Common Operations

### Stop OpenCode completely
```bash
pm2 stop opencode-serve
```

### Restart OpenCode (after config changes)
```bash
pm2 restart opencode-serve
```

### Restart Cashflow Backend
```bash
pm2 restart cashflow-backend
```

### Check if OpenCode is running
```bash
pm2 list | grep opencode
```

## IMPORTANT RULES

- **ALWAYS execute the pm2 command** - do not just say you did it
- **WAIT for the command output** before confirming to user
- **Check for success** in the output (process should show "online" status)
- Use `pm2 list` to verify the service is running after start/stop/restart
