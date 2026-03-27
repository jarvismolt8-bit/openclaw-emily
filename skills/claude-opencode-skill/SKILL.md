---
name: claude-opencode-skill
description: Forwards messages to the Claude CLI via the cashflow-manager backend bridge. Triggered by "claude-cli:" prefix. Calls the API and replies with Claude's response.
---

# CLAUDE-OPENCODE-SKILL

When Kevin sends a message prefixed with `claude-cli:`, extract the prompt and forward it to the Claude CLI bridge via the backend API. Wait for the response, then relay it to Kevin.

## Config
- **Endpoint:** `http://localhost:3001/api/v1/claude-bridge`
- **Method:** POST
- **Headers:**
  - `Content-Type: application/json`
  - `X-API-Key: $CFM_API_KEY`

## Trigger Phrase

- `claude-cli:` (e.g., "claude-cli: what is 1+1")

## Steps

1. Detect the `claude-cli:` prefix (case-insensitive).
2. Extract everything after `claude-cli:` as the prompt (trim whitespace).
3. Acknowledge briefly: *"On it! Asking Claude now..."*
4. Execute:

```bash
curl -s -X POST "http://localhost:3001/api/v1/claude-bridge" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $CFM_API_KEY" \
  -d "{\"prompt\":\"PROMPT_HERE\"}"
```

5. On `"success": true` — reply to Kevin with the value of `data.response`.
6. On error (non-success or curl failure) — reply: *"Claude bridge error: [error message]"*

## Rules

- Always execute the real curl — never simulate or guess a response
- Wait for curl to complete before replying
- If `data.response` is empty, reply: *"Claude returned an empty response."*
- If the session is unavailable (`503` or error mentioning "not available"), reply: *"Claude session is not running. Kevin may need to start the tmux session."*

## What NOT to do

- Do NOT start a sub-agent session
- Do NOT ask Kevin which Claude model to use
- Do NOT explain technical details about the bridge
