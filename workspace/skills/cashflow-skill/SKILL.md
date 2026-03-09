---
name: cashflow-skill
description: Track expenses and income by chatting naturally. Use this skill whenever the user mentions spending money, buying something, receiving income, salary, or wants to view, filter, update, or delete cashflow transactions. Triggers on any financial tracking request — even casual phrasing like "I bought X" or "show my expenses".
---

# Cashflow Manager

Track expenses and income via a local backend API. All operations require executing real curl commands — never simulate or skip them.

## API Configuration

| Setting | Value |
|---|---|
| Base URL | `http://localhost:3001/api/v1/cashflow` |
| X-API-Key | `cfm_c8fca68bf28e3e272670211894d12fa00cef3993a22622a778b5c1523698c7d7` |
| X-Source | `telegram` |
| Content-Type | `application/json` |

All responses follow this envelope:
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "code": "...", "message": "..." } }
```

---

## Operations

### ADD a Transaction

**Step 1 — Parse the user's message:**

| Field | Rule |
|---|---|
| `item` | Name of the purchase or income source |
| `amount` | **Negative** for expenses, **positive** for income |
| `currency` | PHP (default), USD, EUR |
| `category` | See category list below |
| `date` / `time` | Get current Philippine time (UTC+8) |

**Step 2 — Get current PH date/time:**
```bash
TZ='Asia/Manila' date '+%Y-%m-%d %l:%M%p'
```

**Step 3 — Execute the POST:**
```bash
curl -s -X POST "http://localhost:3001/api/v1/cashflow" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: cfm_c8fca68bf28e3e272670211894d12fa00cef3993a22622a778b5c1523698c7d7" \
  -H "X-Source: telegram" \
  -d '{
    "item": "ITEM_NAME",
    "amount": -AMOUNT,
    "currency": "PHP",
    "date": "YYYY-MM-DD",
    "time": "H:MMam/pm",
    "category": "CATEGORY"
  }'
```

**Step 4 — Confirm only after seeing `"success": true` in the response.**

**Examples:**
- "Bought ice cream 450php" → `item: "Ice cream", amount: -450, category: "Food"`
- "Received salary 25000php" → `item: "Salary", amount: 25000, category: "Income"`
- "Grab ride 150" → `item: "Grab", amount: -150, category: "Transport"`

---

### VIEW Transactions

```bash
curl -s -X GET "http://localhost:3001/api/v1/cashflow" \
  -H "X-API-Key: cfm_c8fca68bf28e3e272670211894d12fa00cef3993a22622a778b5c1523698c7d7" \
  -H "X-Source: telegram"
```

**Sort options** (append as query params):

| User says | Query params |
|---|---|
| "highest first" | `?sortBy=amount&sortOrder=desc` |
| "oldest first" | `?sortBy=date&sortOrder=asc` |
| "most recent" | `?sortBy=date&sortOrder=desc` |
| "by category" | `?sortBy=category&sortOrder=asc` |

---

### UPDATE a Transaction

**Step 1 — Find the entry ID:**
```bash
curl -s -X GET "http://localhost:3001/api/v1/cashflow?search=ITEM_NAME" \
  -H "X-API-Key: cfm_c8fca68bf28e3e272670211894d12fa00cef3993a22622a778b5c1523698c7d7" \
  -H "X-Source: telegram"
```

**Step 2 — Update with PUT:**
```bash
curl -s -X PUT "http://localhost:3001/api/v1/cashflow/ENTRY_ID" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: cfm_c8fca68bf28e3e272670211894d12fa00cef3993a22622a778b5c1523698c7d7" \
  -H "X-Source: telegram" \
  -d '{"amount": -NEW_AMOUNT}'
```

---

### DELETE a Transaction

```bash
curl -s -X DELETE "http://localhost:3001/api/v1/cashflow/ENTRY_ID" \
  -H "X-API-Key: cfm_c8fca68bf28e3e272670211894d12fa00cef3993a22622a778b5c1523698c7d7" \
  -H "X-Source: telegram"
```

---

### FILTER the Web App Table

Use this when the user says "filter the web app" or "update the web app table". This persists until cleared.

**Apply a filter:**
```bash
curl -s -X POST "http://localhost:3001/api/v1/cashflow/filter" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: cfm_c8fca68bf28e3e272670211894d12fa00cef3993a22622a778b5c1523698c7d7" \
  -H "X-Source: telegram" \
  -d '{"category": "Food", "currency": "All", "search": ""}'
```

**Clear the filter:**
```bash
curl -s -X DELETE "http://localhost:3001/api/v1/cashflow/filter" \
  -H "X-API-Key: cfm_c8fca68bf28e3e272670211894d12fa00cef3993a22622a778b5c1523698c7d7" \
  -H "X-Source: telegram"
```

**Filter field values:**
- `category`: `"All"` | `"Income"` | `"Investment"` | `"Food"` | `"Transport"` | `"Utilities"` | `"Shopping"` | `"Entertainment"` | `"Health"` | `"Airbnb"` | `"Other"`
- `currency`: `"All"` | `"PHP"` | `"USD"` | `"EUR"`
- `search`: `""` or a search term

> If the user says "filter the web app by Food" → POST filter. Confirm: "Done! Web app table updated."
> If the user just wants to see filtered results in chat → use GET with query params instead.

---

## Category Reference

| Category | Keywords |
|---|---|
| Income | salary, freelance, bonus, gift, refund, earned, received |
| Food | lunch, dinner, coffee, snack, groceries, restaurant |
| Transport | gas, taxi, Grab, Uber, bus, parking |
| Utilities | electricity, water, internet, phone bill |
| Shopping | clothes, gadgets, Amazon, mall |
| Entertainment | movies, games, Netflix, streaming |
| Health | medicine, doctor, gym, pharmacy |
| Airbnb | Airbnb hosting expenses |
| Other | anything that doesn't fit above |

---

## Rules

- Always **execute** the curl command — never pretend you did
- Always **wait for the API response** before confirming to the user
- Only confirm success after seeing `"success": true`
- Expenses → **negative** amount; Income → **positive** amount
- Default currency is **PHP**
- Always use **Philippine Time (UTC+8)** for date and time