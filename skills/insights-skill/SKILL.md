---
name: insights-skill
description: Generate visual insights from cashflow and task data. Use this skill whenever the user asks to visualize their spending, see charts of their expenses, graph their cashflow, or get insights about their financial patterns.
---

# Insights Skill

Generate beautiful charts and visualizations from the user's cashflow and task data.

## API Configuration

| Setting | Value |
|---|---|
| Insights Base URL | `http://localhost:3001/api/v1/insights` |
| Cashflow Base URL | `http://localhost:3001/api/v1/cashflow` |
| Tasks Base URL | `http://localhost:3001/api/v1/tasks` |
| X-API-Key | `cfm_9ebe271c5559514a3c33068bd470eb0b8cad214069beeff13a3df8342d48b57a` |
| X-Source | `telegram` |
| Content-Type | `application/json` |

---

## Trigger Phrases

- "graph my expenses"
- "chart my cashflow"
- "show me insights"
- "visualize my data"
- "analyze my spending"
- "plot my expenses"
- "draw a chart"
- "make a graph"
- Any request involving charts, graphs, visualizations, or insights

---

## Workflow

### Step 1 — Parse the Request

Extract:
- **Time range**: When does the user want data for? Default: current month
- **Data subject**: What data to visualize?
  - `expenses` — cashflow expenses
  - `income` — cashflow income  
  - `tasks` — task data
  - `all` — everything

Examples:
- "Graph my March 2026 expenses" → time: March 2026, subject: expenses
- "Show me insights" → time: current month, subject: all
- "Chart my cashflow" → time: current month, subject: all

### Step 2 — Query the Data

**Cashflow data:**
```bash
curl -s "http://localhost:3001/api/v1/cashflow" \
  -H "X-API-Key: cfm_9ebe271c5559514a3c33068bd470eb0b8cad214069beeff13a3df8342d48b57a" \
  -H "X-Source: telegram"
```

**Tasks data:**
```bash
curl -s "http://localhost:3001/api/v1/tasks" \
  -H "X-API-Key: cfm_9ebe271c5559514a3c33068bd470eb0b8cad214069beeff13a3df8342d48b57a" \
  -H "X-Source: telegram"
```

Filter by date range if specified (add query params: `startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`).

### Step 3 — Analyze + Select Chart Type

Based on the data shape:

| Data Pattern | Chart Type |
|---|---|
| Proportions / category breakdown | `donut` |
| Comparison across categories | `bar` |
| Trend over time (daily/weekly amounts) | `line` |
| Cumulative trend over time | `area` |

**For expenses:** Typically use `donut` for category breakdown or `bar` for comparison.

**For income:** Use `bar` or `line` depending on frequency.

**For tasks:** Use `bar` for status/priority breakdown or `line` for creation trend.

### Step 4 — Build JSON Payload

Generate a unique session ID:
```bash
uuidgen
```

Build the payload structure:
```json
{
  "session_id": "UUID-FROM-uuidgen",
  "requested_by": "USER_TELEGRAM_ID",
  "generated_at": "ISO8601_TIMESTAMP",
  "prompt": "User's original request",
  "charts": [
    {
      "chart_id": "UUID-FROM-uuidgen",
      "type": "donut|bar|line|area",
      "title": "Descriptive title",
      "explanation": "Brief insight (1-2 sentences)",
      "x_axis_label": "X-axis label if applicable",
      "y_axis_label": "Y-axis label if applicable",
      "data": [
        { "label": "Category Name", "value": NUMBER }
      ]
    }
  ]
}
```

### Step 5 — POST to Insights Endpoint

```bash
curl -s -X POST "http://localhost:3001/api/v1/insights" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: cfm_9ebe271c5559514a3c33068bd470eb0b8cad214069beeff13a3df8342d48b57a" \
  -H "X-Source: telegram" \
  -d '{
    "session_id": "UUID",
    "requested_by": "USER_ID",
    "generated_at": "2026-03-17T10:00:00Z",
    "prompt": "Graph my expenses",
    "charts": [...]
  }'
```

**On success:** Response will be `{"success":true,"data":{"session_id":"UUID"}}`

**On validation error (400):** Fix the payload and retry

**On duplicate (409):** Generate new session_id and retry

### Step 6 — Confirm with User

On success, reply:
> "Done! 📊 Your insights are ready. Check the Insights tab in the web app!"

---

## Error Handling

| Scenario | Response |
|---|---|
| No cashflow data for period | "I couldn't find any cashflow data for that time period. Try a different date range or add some transactions first!" |
| No tasks data | "No tasks found to visualize. Add some tasks first!" |
| Ambiguous request | Ask one clarifying question before proceeding |
| API 400 (validation) | "Something went wrong with the data format. Let me fix that..." (retry) |
| API 409 (duplicate) | "Almost done! Just need to regenerate..." (new session_id, retry) |
| API 500 | "Oops, something went wrong on the server. Let me try again in a moment." |

---

## Constraints

- **Max 10 charts** per session
- **Max 200 data points** per chart
- **Valid chart types only:** `donut`, `bar`, `line`, `area`
- **Labels and values required** for each data point
- **No external data** — only query the cashflow and tasks APIs
- **No user input needed** for the web app — Emily handles everything

---

## Example Flows

### Example 1: Monthly Expenses
**User:** "Graph my expenses for March 2026"

1. Query cashflow for March 2026
2. Aggregate by category
3. Create donut chart: "March 2026 Expenses by Category"
4. Explanation: "Your top spending category was X at Y%"
5. POST to insights endpoint
6. Reply: "Done! 📊 Your March expenses are ready in the web app!"

### Example 2: Weekly Cashflow
**User:** "Show me my cashflow this week"

1. Query cashflow for current week
2. Group by day
3. Create line chart: "Weekly Cashflow Trend"
4. Explanation: "Your balance peaked on X"
5. POST and confirm
