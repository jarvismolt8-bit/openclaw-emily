---
name: cashflow-skill
description: Track expenses/income via chat. Auto-categorizes Airbnb, Bank, Health. Defaults to expense unless income keyword detected.
---

# Cashflow Manager

API: `http://localhost:3001/api/v1/cashflow`  
Key: `cfm_9ebe271c5559514a3c33068bd470eb0b8cad214069beeff13a3df8342d48b57a`  
Source: `telegram`

---

## ADD

**1. Parse message (case-insensitive):**

| Detect | Result |
|--------|--------|
| salary, received, earned, freelance, bonus, refund, income | **Income** (positive amount) |
| airbnb, bank, transfer, withdrawal, deposit, ATM, BPI, BDO | **Bank** |
| health, medicine, doctor, gym, pharmacy, hospital | **Health** |
| lunch, dinner, coffee, snack, groceries | **Food** |
| gas, Grab, Uber, taxi, bus, parking | **Transport** |
| electricity, water, internet, phone bill | **Utilities** |
| clothes, gadgets, Amazon, mall | **Shopping** |
| movies, games, Netflix, streaming | **Entertainment** |
| **none detected** | Ask: "What's the category?" |

**2. Amount:** Negative (expense) unless income keyword → positive.

**3. Get PH time:** `TZ='Asia/Manila' date '+%Y-%m-%d %l:%M%p'`

**4. Execute:**
```bash
curl -s -X POST "http://localhost:3001/api/v1/cashflow" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: cfm_9ebe271c5559514a3c33068bd470eb0b8cad214069beeff13a3df8342d48b57a" \
  -H "X-Source: telegram" \
  -d '{"item":"ITEM","amount":-AMOUNT,"currency":"PHP","date":"YYYY-MM-DD","time":"H:MMam/pm","category":"CATEGORY"}'
```

**5. Confirm only on `"success": true`**

**Examples:**
- "airbnb clean 280" → item: "Airbnb cleaning", amount: -280, category: "Airbnb"
- "Bank transfer 5000" → item: "Bank transfer", amount: -5000, category: "Bank"
- "Health medicine 150" → item: "Medicine", amount: -150, category: "Health"
- "salary 25000" → item: "Salary", amount: 25000, category: "Income"
- "grab 80" → item: "Grab", amount: -80, category: "Transport"

---

## VIEW

```bash
curl -s -X GET "http://localhost:3001/api/v1/cashflow" \
  -H "X-API-Key: cfm_9ebe271c5559514a3c33068bd470eb0b8cad214069beeff13a3df8342d48b57a" \
  -H "X-Source: telegram"
```

Sort: `?sortBy=amount&sortOrder=desc` (highest), `?sortBy=date&sortOrder=desc` (recent)

---

## UPDATE

1. Find ID: `curl ...?search=ITEM_NAME`
2. Update: `curl -s -X PUT ".../ENTRY_ID" -H "Content-Type: application/json" -d '{"amount":-NEW}'`

---

## DELETE

```bash
curl -s -X DELETE "http://localhost:3001/api/v1/cashflow/ENTRY_ID" \
  -H "X-API-Key: cfm_9ebe271c5559514a3c33068bd470eb0b8cad214069beeff13a3df8342d48b57a" \
  -H "X-Source: telegram"
```

---

## FILTER WEB APP

Apply: `curl -s -X POST ".../filter" -d '{"category":"Food","currency":"All","search":""}'`  
Clear: `curl -s -X DELETE ".../filter"`

Categories: Income, Investment, Food, Pet Food, Transport, Utilities, Shopping, Entertainment, Health, Airbnb, Bank, Other, Clothing

---

## RULES

- Execute real curl — never simulate
- Wait for response before confirming
- Expenses = negative, Income = positive
- Default currency: PHP
- Use Philippine Time (UTC+8)
- Ask for clarification if category unclear