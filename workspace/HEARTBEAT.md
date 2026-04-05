# Heartbeat

> ⚠️ Do NOT use `default_api` or write any Python code. Do NOT fabricate data.

## Steps

1. Get yesterday's date in PH time:
```bash
TZ='Asia/Manila' date -d 'yesterday' '+%Y-%m-%d'
```

2. Fetch in-progress tasks:
```bash
curl -s "http://localhost:3001/api/v1/tasks?status=in_progress" -H "X-API-Key: cfm_c3ee7e36753f8f9a77b4032c52af757ddabc5246f88b659ba791e6d7b6aa71c4" -H "X-Source: telegram"
```

3. Fetch yesterday's cashflow (replace YYYY-MM-DD with the date from step 1):
```bash
curl -s "http://localhost:3001/api/v1/cashflow?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD" -H "X-API-Key: cfm_c3ee7e36753f8f9a77b4032c52af757ddabc5246f88b659ba791e6d7b6aa71c4" -H "X-Source: telegram"
```

4. Send a message to `telegram:8369197480` in this format:

```
🔄 In Progress: <count> ticket(s)
<list each task: priority-icon + 🔄 id | name | date | time>

💸 Yesterday's Cashflow (<YYYY-MM-DD>)
<list each entry: category-emoji item | amount currency>
Total income: +<sum> PHP
Total expenses: -<sum> PHP
Net: <net> PHP
```

Priority: 🔴 high · 🔵 medium · 🟢 low  
If no in-progress tasks: `🔄 In Progress: 0 tickets`  
If no cashflow entries yesterday: `💸 No cashflow entries yesterday`
