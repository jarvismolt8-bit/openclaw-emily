---
name: firecrawl
description: Comprehensive web data extraction using Firecrawl API. Scrape, crawl, map, search, and extract structured data from any website. Supports JavaScript rendering, batch processing, AI-driven extraction, and agent-based workflows.
homepage: https://firecrawl.dev
metadata:
  {
    "openclaw": {
      "emoji": "🔥",
      "requires": {},
      "install": [
        {
          "id": "npm",
          "kind": "npm",
          "package": "firecrawl",
          "bins": ["firecrawl"],
          "label": "Install Firecrawl CLI (npm)"
        },
        {
          "id": "pip",
          "kind": "pip",
          "package": "firecrawl-py",
          "label": "Install Firecrawl Python SDK (pip)"
        }
      ]
    }
  }
---

# Firecrawl

Turn websites into LLM-ready data with Firecrawl's powerful web extraction API.

## When to use (trigger phrases)

Use this skill when you need to:
- "scrape this website" or "extract content from URL"
- "crawl entire site" or "get all pages from"
- "map all URLs on" or "discover pages"
- "search the web and get full content"
- "extract structured data from" (products, articles, etc.)
- "monitor website changes" or "track updates"
- "take screenshot of" or "get page image"
- "let an agent research" or "autonomous data gathering"
- "batch process URLs" or "scrape multiple sites"

## Quick start

### Install & Authenticate

```bash
# Install CLI (if not already)
npm install -g firecrawl-cli

# Login with API key
firecrawl login --api-key fc-YOUR_API_KEY
# or set env: export FIRECRAWL_API_KEY=fc-...
```

### Basic Operations

```bash
# Scrape single URL (markdown)
firecrawl scrape https://example.com

# Crawl entire site (async, up to limit)
firecrawl crawl https://docs.example.com --limit 100

# Map all URLs on a site
firecrawl map https://example.com

# Search + scrape results
firecrawl search "query term" --limit 5

# AI agent extraction (describe what you need)
firecrawl agent "Find pricing plans" --urls https://saas.com/pricing

# Batch scrape from file
firecrawl batch urls.txt --formats markdown
```

## Core commands

### **`firecrawl scrape <url>`**

Convert a single URL to clean data.

```bash
# Get markdown
firecrawl scrape https://example.com

# Get multiple formats
firecrawl scrape https://example.com --formats markdown,html,screenshot

# Extract structured data with schema
firecrawl scrape https://shop.com --json-schema product_schema.json

# Extract with prompt (no schema needed)
firecrawl scrape https://example.com --prompt "Extract product name and price"

# Use specific model
firecrawl scrape https://example.com --model spark-1-pro

# Wait for JavaScript
firecrawl scrape https://spa.com --wait 5000

# Take actions before scraping
firecrawl scrape https://login.com \
  --actions '[{"type":"write","text":"user"},{"type":"click","selector":"#submit"}]'
```

**Options:**
- `--formats`: markdown, html, rawHtml, screenshot, links, json, branding
- `--json-schema`: Path to JSON schema for structured extraction
- `--prompt`: Natural language extraction instruction (no schema)
- `--model`: AI model (spark-1-mini default, spark-1-pro for complex)
- `--wait`: Milliseconds to wait for page load
- `--actions`: JSON array of browser actions (click, scroll, type, etc.)
- `--only-main-content`: Exclude navigation/footer (default: true)
- `--exclude-tags`: Comma-separated tags to exclude (nav, footer, etc.)

---

### **`firecrawl crawl <url>`**

Crawl an entire website (asynchronous job).

```bash
# Start crawl (returns job ID)
firecrawl crawl https://docs.example.com --limit 50

# Check status (polling)
firecrawl crawl <job-id>

# Wait for completion (blocking)
firecrawl crawl https://docs.example.com --wait

# With filters
firecrawl crawl https://example.com \
  --limit 200 \
  --include-external false \
  --include-subdomains false \
  --include-pattern "**/docs/**" \
  --exclude-pattern "**/blog/**"
```

**Options:**
- `--limit`: Max pages to crawl (default 10, max depends on plan)
- `--depth`: Max link depth (default 100000)
- `--source`: all (default), sitemaps, or links
- `--formats`: Output formats (markdown recommended)
- `--render`: true (default) for JS, false for static HTML only
- `--include-external`: Follow external links
- `--include-subdomains`: Include subdomains
- `--include-patterns`, `--exclude-patterns`: Glob patterns for URL filtering
- `--maxAge`: Cache duration in seconds
- `--modifiedSince`: Unix timestamp, only crawl modified pages
- `--wait`: Auto-wait for completion (polls until done)

**Note:** Crawl jobs can take minutes to hours depending on site size. Use `--wait` for CLI blocking, or poll manually.

---

### **`firecrawl map <url>`**

Discover all URLs on a website instantly.

```bash
# List all links
firecrawl map https://example.com

# Search for specific pages
firecrawl map https://example.com --search "pricing"

# Limit results
firecrawl map https://example.com --limit 100

# Include/exclude patterns
firecrawl map https://example.com \
  --include-pattern "**/api/**" \
  --exclude-pattern "**/admin/**"
```

**Options:**
- `--search`: Filter URLs by keyword (returns sorted by relevance)
- `--limit`: Max URLs to return
- `--include-patterns`, `--exclude-patterns`: Glob patterns
- `--source`: all, sitemaps, or links

---

### **`firecrawl search "<query>"`**

Search the web and get full page content from results.

```bash
# Basic search + full content
firecrawl search "best open source LLM 2025" --limit 5

# With filters
firecrawl search "AI frameworks" \
  --country US \
  --lang en \
  --freshness month

# Get more content per result
firecrawl search "Rust web frameworks" \
  --max-tokens 50000 \
  --max-tokens-per-page 4096
```

**Options:**
- `--limit`: Number of results (default 5, max 100)
- `--country`: 2-letter ISO code (US, DE, etc.)
- `--language`: ISO 639-1 (en, de, fr)
- `--freshness`: day, week, month, year
- `--domain-filter`: Include/ exclude domains (prefix `-` to exclude)
- `--max-tokens`, `--max-tokens-per-page`: Content budget (Perplexity only)

---

### **`firecrawl agent "<prompt>"`**

AI agent autonomously gathers data. Describe what you need, it searches/navigates/extracts.

```bash
# Simple prompt
firecrawl agent "What are Stripe's pricing plans?"

# Focus on specific sites
firecrawl agent "Compare Vercel vs Netlify pricing" \
  --urls https://vercel.com/pricing https://netlify.com/pricing

# Use schema for structured output
firecrawl agent "List all founders" \
  --json-schema founders_schema.json

# Use pro model for complex research
firecrawl agent "Analyze enterprise features across Cloudflare, AWS, GCP" \
  --model spark-1-pro
```

**Options:**
- `--urls`: Space-separated list of URLs to focus on (optional)
- `--json-schema`: Path to JSON schema for structured output
- `--model`: spark-1-mini (default) or spark-1-pro
- `--timeout`: Max execution time in seconds

The agent will:
1. Search if URLs not provided
2. Navigate to relevant pages
3. Extract the requested information
4. Return structured result with sources

---

### **`firecrawl batch <file>`**

Process multiple URLs in bulk.

```bash
# urls.txt contains one URL per line
firecrawl batch urls.txt --formats markdown

# With concurrency control
firecrawl batch urls.txt --concurrent 10

# Split large batches
firecrawl batch big_urls.txt --chunk-size 100
```

**Options:**
- `--formats`: Output formats (markdown, html, etc.)
- `--concurrent`: Max parallel requests (default 5)
- `--chunk-size`: URLs per batch (for large lists)

---

## Advanced features

### **Browser actions**

Perform clicks, typing, scrolling before extraction:

```bash
firecrawl scrape https://example.com/login \
  --actions '[
    {"type":"write","text":"user@example.com"},
    {"type":"press","key":"Tab"},
    {"type":"write","text":"password"},
    {"type":"click","selector":"button[type=submit]"},
    {"type":"wait","milliseconds":2000},
    {"type":"screenshot"}
  ]'
```

Action types: `write`, `press`, `click`, `scroll`, `wait`, `screenshot`, `select`.

---

### **Screenshots & branding**

```bash
# Get screenshot as base64
firecrawl scrape https://example.com --formats screenshot

# Extract brand colors, fonts
firecrawl scrape https://example.com --formats branding

# Output to file
firecrawl scrape https://example.com --formats screenshot --output screenshot.png
```

---

### **Structured extraction with schemas**

Define a Pydantic-style schema for consistent data extraction:

```json
{
  "type": "object",
  "properties": {
    "product_name": {"type": "string", "description": "Name of product"},
    "price": {"type": "number", "description": "Price in USD"},
    "in_stock": {"type": "boolean"}
  }
}
```

Then:

```bash
firecrawl scrape https://shop.com/product \
  --json-schema product_schema.json
```

---

### **Change tracking**

Monitor websites over time:

```bash
# First scrape
firecrawl scrape https://example.com --output baseline.json

# Later, check differences
firecrawl scrape https://example.com --output new.json
# Compare baseline.json vs new.json manually or with diff tool
```

Note: Firecrawl keeps job results for 14 days. After that, re-crawl.

---

## Configuration

### API Key

Set via:
```bash
export FIRECRAWL_API_KEY=fc-YOUR_API_KEY
# or
firecrawl login --api-key fc-YOUR_API_KEY
```

CLI stores credentials in `~/.config/firecrawl/credentials.json`.

### Python SDK alternative

If you prefer Python code inside OpenClaw:

```python
from firecrawl import Firecrawl

app = Firecrawl(api_key="fc-...")

# Scrape
doc = app.scrape("https://example.com", formats=["markdown"])
print(doc.markdown)

# Crawl (blocking)
docs = app.crawl("https://docs.example.com", limit=50)
for doc in docs.data:
    print(doc.markdown)

# Agent
result = app.agent(prompt="Find pricing for Notion")
print(result.data)
```

---

## Error handling & best practices

### Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `429 Too Many Requests` | Rate limit exceeded | Wait or upgrade plan |
| `403 Forbidden` | Invalid API key | Check FIRECRAWL_API_KEY |
| `Timeout` | Slow site, low timeout | Increase `--wait` or `timeoutSeconds` config |
| `Blocked by bot protection` | Site uses Cloudflare/Turnstile | Firecrawl respects these; consider direct API if available |

### Best practices

1. **Use appropriate formats**:
   - For LLM context → `markdown` (token-efficient)
   - For data analysis → `json` with schema
   - For visuals → `screenshot`

2. **Respect rate limits**:
   - Free tier: limited browser minutes/day
   - Paid: check your plan limits
   - Add delays between batch requests

3. **Cache results**:
   - Firecrawl caches by URL for 24h by default
   - Use `--maxAge` to control cache TTL
   - Re-crawl only when needed

4. **Choose the right tool**:
   - Single page → `scrape`
   - Entire site → `crawl`
   - Discovery → `map`
   - Research → `agent`
   - Bulk → `batch`

5. **Use schema over prompt** when possible:
   - Schema extraction is 10-100x faster/cheaper
   - Generate schema once, reuse many times

---

## Integration with OpenClaw

This skill integrates seamlessly:
- Call from any agent via `firecrawl <command>`
- Use in workflows with `netlify` or `cloudflare` skills
- Combine with `summarize` or `markdown-fetch` for token optimization

Example inside OpenClaw agent:

```bash
# Research workflow
firecrawl agent "Find all open source projects using Next.js" --urls github.com/trending

# Crawl documentation
firecrawl crawl https://docs.example.com --limit 100 --formats markdown

# Extract products from e-commerce
firecrawl scrape https://store.example.com \
  --json-schema product_schema.json \
  --output products.json
```

---

## Limits & pricing

- **Free tier**: Very limited (10 min browser time/day). Suitable for testing only.
- **Paid**: Pay-as-you-go browser time (~$0.06-0.15/min), no crawl limits
- **Self-hosted**: AGPL-3.0 license, unlimited local usage (no API calls)

For production use, self-host Firecrawl or use cloud paid plan.

---

## Resources

- Docs: https://docs.firecrawl.dev
- API Reference: https://docs.firecrawl.dev/api-reference/introduction
- GitHub: https://github.com/firecrawl/firecrawl
- MCP Server: https://github.com/firecrawl/firecrawl-mcp-server
- Playground: https://firecrawl.dev/playground

---

## Comparison with other tools

| Feature | Firecrawl | crawl4ai | markdown-fetch |
|---------|-----------|----------|---------------|
| **JavaScript rendering** | ✅ | ✅ | ✅ (fallback) |
| **Full site crawl** | ✅ (async job) | ✅ (custom code) | ❌ |
| **URL discovery (map)** | ✅ | ❌ | ❌ |
| **Search + full content** | ✅ | ❌ | ❌ |
| **Structured extraction** | ✅ (schema/prompt) | ✅ (CSS/LLM) | ❌ |
| **Batch processing** | ✅ | ✅ | ❌ |
| **Screenshots** | ✅ | ✅ | ❌ |
| **Agent mode** | ✅ | ❌ | ❌ |
| **Change tracking** | ✅ | ❌ | ❌ |
| **SDKs** | Python, JS, Go, Rust | Python only | Service API |
| **Self-hostable** | ✅ (AGPL) | ✅ (MIT) | ❌ (SaaS) |
| **Token-optimized** | ❌ (full content) | ❌ | ✅ (80% reduction) |

Use **Firecrawl** for comprehensive web data operations.
Use **crawl4ai** for Python-local crawling without API dependencies.
Use **markdown-fetch** for token-efficient single-page markdown.

---

## Version

Skill version: 1.0.0  
Firecrawl API: v2  
Last updated: 2025-03-13
