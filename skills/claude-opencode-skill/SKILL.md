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
  - `X-API-Key: cfm_a9e08eab7943a4a31d0944f92e0f644d14506eeeab48ca0e32d4474afba261c9`

## Trigger Phrase

- `claude-cli:` (e.g., "claude-cli: what is 1+1")

## Steps

1. Detect the `claude-cli:` prefix (case-insensitive).
2. Extract everything after `claude-cli:` as the prompt (trim whitespace).
3. Acknowledge briefly: *"On it! Asking Claude now..."*
4. Execute the curl and store the full JSON response:

```bash
curl -s -X POST "http://localhost:3001/api/v1/claude-bridge" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: cfm_a9e08eab7943a4a31d0944f92e0f644d14506eeeab48ca0e32d4474afba261c9" \
  -d "{\"prompt\":\"PROMPT_HERE\"}"
```

5. Parse the JSON. Extract `data.response`. Strip any leading bullet symbols (●, •, *, -) and trim whitespace.
6. **IMMEDIATELY send Kevin a new Telegram message** with exactly the cleaned response text. Do not wait. Do not ask if he wants it. Just send it.
7. On error (non-success, curl failure, or empty response) — send Kevin: *"Claude bridge error: [error detail]"*

## Rules

- Always execute the real curl — never simulate or guess a response
- Wait for curl to complete, then IMMEDIATELY reply with the response as a new message
- Never hold the response and wait for Kevin to ask — always push it proactively
- Strip leading markdown bullet characters (●, •, *, -) from the response before sending
- If `data.response` is empty after stripping, reply: *"Claude returned an empty response."*
- If the session is unavailable (`503` or error mentioning "not available"), reply: *"Claude session is not running. Kevin may need to start the tmux session."*

## What NOT to do

- Do NOT start a sub-agent session
- Do NOT ask Kevin which Claude model to use
- Do NOT explain technical details about the bridge
