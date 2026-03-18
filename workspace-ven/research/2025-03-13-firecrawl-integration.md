# Research: Firecrawl Integration for OpenClaw

Date: 2025-03-13

## Context

We were evaluating whether to add Firecrawl as a new skill to OpenClaw, and needed to understand how it compares to the existing web extraction capabilities: `crawl4ai` and `markdown-fetch`.

## What is Firecrawl?

Firecrawl is a comprehensive web data extraction API that turns websites into LLM-ready data. It's available as:
- **Cloud API** (firecrawl.dev) - paid service with free tier
- **Self-hosted server** (AGPL-3.0) - free, unlimited
- **CLI tool** (`firecrawl-cli`)
- **SDKs**: Python, JavaScript, Go, Rust, Java

Key capabilities:
- Scrape single URLs (markdown, HTML, screenshots, structured JSON)
- Crawl entire websites (async jobs, thousands of pages)
- Map/discover all URLs on a site
- Search the web and get full content (not just snippets)
- AI agent mode: describe what you need, it autonomously gathers
- Batch processing of multiple URLs
- JavaScript rendering (headless Chrome)
- Structured extraction via JSON schema or natural language prompts
- Screenshot capture, brand identity extraction
- Change tracking/monitoring
- Built-in proxy rotation, anti-detection

## Existing OpenClaw Web Skills

### 1. `crawl4ai` (Python library)
- **Type**: Local Python SDK you import and use in code
- **Deployment**: Runs on your machine/self-hosted, no API calls
- **Capabilities**:
  - Full JavaScript rendering (Playwright)
  - Structured extraction (CSS selectors, LLM prompts, JSON schemas)
  - Deep crawling (link discovery + follow)
  - Batch processing (`arun_many`)
  - Session management, authentication
  - Proxy support, anti-detection
  - Content filtering (Fit Markdown)
- **Limitations**:
  - Python only
  - Requires coding (not a simple CLI)
  - No built-in URL discovery (you provide URLs)
  - No search integration
  - No change tracking
  - No multi-language SDKs

### 2. `markdown-fetch` (markdown.new service)
- **Type**: SaaS API (markdown.new)
- **Purpose**: Token-efficient markdown conversion (80% reduction vs HTML)
- **Capabilities**:
  - URL → clean markdown (LLM-optimized)
  - Auto fallbacks: native markdown → AI conversion → browser render
  - JavaScript rendering support (via browser fallback)
  - Simple: `fetch_markdown(url)` returns markdown + token count
- **Limitations**:
  - Markdown only (no HTML, JSON, screenshots)
  - No crawling/site-wide operations
  - No structured extraction
  - No search
  - No batch processing beyond manual loops
  - SaaS dependency (can't self-host)

### 3. `web_fetch` (OpenClaw tool)
- **Type**: HTTP GET + readability extraction
- **Capabilities**:
  - Simple URL fetch
  - Main content extraction (Readability algorithm)
  - Optional Firecrawl backend (if `FIRECRAWL_API_KEY` set)
  - Caching (15 min default)
  - No JavaScript (unless Firecrawl fallback)
- **Limitations**:
  - Very basic (no crawling, batch, search)
  - Relies on Firecrawl only for enhanced extraction (single URL)

### 4. `web_search` (OpenClaw tool)
- **Type**: Search API (Brave, Gemini, Grok, Kimi, Perplexity)
- **Capabilities**:
  - Web search with various providers
  - Returns snippets and URLs
- **Limitations**:
  - Does NOT return full page content
  - Only search, not scrape

## Comparison: Firecrawl vs Existing Skills

| Feature | Firecrawl | crawl4ai | markdown-fetch |
|---------|-----------|----------|---------------|
| **JavaScript rendering** | ✅ | ✅ | ✅ (browser fallback) |
| **Single URL scrape** | ✅ | ✅ | ✅ |
| **Full site crawl** | ✅ (async job) | ✅ (custom code) | ❌ |
| **URL discovery (map)** | ✅ | ❌ | ❌ |
| **Search + full content** | ✅ | ❌ | ❌ |
| **Structured extraction** | ✅ (schema/prompt) | ✅ (CSS/LLM/schema) | ❌ |
| **Batch processing** | ✅ | ✅ | ❌ |
| **Screenshots** | ✅ | ✅ | ❌ |
| **AI agent mode** | ✅ | ❌ | ❌ |
| **Change tracking** | ✅ | ❌ | ❌ |
| **Multi-language SDKs** | ✅ (5 languages) | ❌ (Python only) | ❌ (service API) |
| **Self-hostable** | ✅ (AGPL) | ✅ (MIT) | ❌ (SaaS) |
| **Token-optimized output** | ❌ | ❌ | ✅ (80% reduction) |
| **Ease of use** | CLI + API (very easy) | Python library (requires code) | Single function call |
| **Cost (self-host)** | Free | Free | Unknown (likely freemium) |
| **Cost (cloud)** | Pay-as-you-go | N/A | Unknown |

## Key Differentiators

### What Firecrawl Does That Others Don't:
- **Search + scrape in one**: `firecrawl search "query"` returns full content, not just snippets
- **Map**: Instant URL discovery for a site
- **Agent mode**: Autonomous research without manual URL provision
- **Change tracking**: Monitor diffs over time
- **Multi-language SDKs**: Use from Go, Rust, JS, Java, not just Python
- **Enterprise features**: Built-in proxy rotation, rate limit handling, scaling

### What crawl4ai Does That Firecrawl Might Not:
- **100% free, no API limits**: Self-hosted, you control rate limits
- **No external dependencies**: Runs locally, no third-party service
- **MIT license**: More permissive than AGPL
- **Fit Markdown**: Advanced content filtering for token efficiency
- **Deep customization**: Full Python control, custom strategies, hooks

### What markdown-fetch Does That Firecrawl Doesn't:
- **Token-optimized output**: 80% smaller markdown vs raw HTML
- **Simplicity**: One function call, no API keys if using included service
- **Cost-effective for LLMs**: Less tokens = cheaper context

## When to Use Which?

### Use **Firecrawl** when:
- You need to crawl entire sites (using `crawl` or `map`)
- You want search results with full page content
- You prefer API/CLI over writing Python code
- You need multi-language support (Go, Rust, etc.)
- You want AI agent mode for autonomous research
- You need enterprise features (scaling, proxies, change tracking)
- You're already paying for cloud or willing to self-host

### Use **crawl4ai** when:
- You're building a Python application and want local control
- You need advanced content filtering (Fit Markdown)
- You want zero API costs/rate limits
- You need deep customization (custom extraction strategies, hooks)
- You prefer MIT license over AGPL
- You already have Python infrastructure

### Use **markdown-fetch** when:
- Your primary goal is LLM context optimization
- You're processing many pages and want to minimize token costs
- You need simple one-liner markdown extraction
- You don't need structured data or crawling

## Decision: Add Firecrawl Skill to OpenClaw?

**Yes, justified** because:

1. **Complementary features**: Firecrawl adds `search+scrape`, `map`, `agent`, `change tracking` that none of the existing skills have
2. **Multi-language**: OpenClaw agents could use Firecrail from any language via CLI, not just Python
3. **Ease of use**: CLI is very agent-friendly (`firecrawl crawl ...`, `firecrawl agent "..."`)
4. **Self-hostable**: Can run Firecrawl server locally for free, no API limits
5. **MCP server available**: Could integrate with Claude Code/OpenCode via MCP

The three skills together cover:
- **Simple, token-efficient single-page fetch** → `markdown-fetch`
- **Complex Python crawling pipelines** → `crawl4ai`
- **Enterprise-scale web operations** → `firecrawl`

## Implementation

We created the Firecrawl skill at `/root/.openclaw/skills/firecrawl/SKILL.md`.

### Installation steps (for users):

```bash
# 1. Install CLI
npm install -g firecrawl-cli

# 2. Authenticate
firecrawl login --api-key fc-YOUR_API_KEY
# OR set FIRECRAWL_API_KEY env var

# 3. Use in OpenClaw
firecrawl scrape https://example.com
firecrawl crawl https://docs.example.com --limit 100
firecrawl map https://example.com
firecrawl search "AI news" --limit 5
firecrawl agent "Extract product prices" --urls shop.com
```

### Self-host option:

```bash
# Run Firecrawl server locally
docker run -p 3000:3000 -e FIRECRAWL_API_KEY=your_key firecrawl/firecrawl

# Then point CLI to local server
firecrawl --base-url http://localhost:3000 scrape https://example.com
```

## Conclusion

Firecrawl is a worthy addition to OpenClaw's web extraction toolkit. It doesn't replace `crawl4ai` or `markdown-fetch`; it complements them by providing:
- Unified CLI for all web data operations
- Advanced features (search+scrape, map, agent, change tracking)
- Multi-language SDKs
- Self-hostable or cloud

Users can choose based on their specific needs:
- Quick LLM-optimized markdown → `markdown-fetch`
- Custom Python pipelines → `crawl4ai`
- Comprehensive web data platform → `firecrawl`

The skill has been created and is ready for use.
