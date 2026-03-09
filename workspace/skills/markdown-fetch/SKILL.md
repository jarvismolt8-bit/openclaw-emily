---
name: markdown-fetch
description: Convert any URL to clean, token-efficient Markdown using markdown.new service. Optimized for AI agents with 80% token reduction vs HTML.
metadata: {"openclaw":{"emoji":"📝","requires":[],"primaryEnv":""}}
---

# Markdown Fetch Skill

Convert any URL to clean Markdown format using [markdown.new](https://markdown.new) service. This skill provides a simple, efficient way to extract structured content from web pages with **80% fewer tokens** than raw HTML.

## When to Use

- Fetching articles, blogs, documentation, or text-heavy web pages
- Need to minimize token usage when processing web content
- Want structured Markdown instead of messy HTML
- Processing JavaScript-heavy sites that need browser rendering

## When NOT to Use

- Interactive sites requiring clicks, form submissions, or navigation
- Sites requiring authentication or session management
- Need visual screenshots or PDFs
- Real-time dynamic content that changes frequently

## Installation

No additional dependencies required. The skill uses the markdown.new API service.

## Usage

### Basic URL Conversion

```python
from markdown_fetch import fetch_markdown

# Convert any URL to Markdown
result = fetch_markdown("https://example.com")
print(result["markdown"])
print(f"Token count: {result['tokens']}")
```

### With Options

```python
# Use specific method
result = fetch_markdown(
    url="https://example.com",
    method="browser",  # "auto", "ai", or "browser"
    retain_images=True
)
```

### Direct URL Prepending

For quick conversion, prepend `https://markdown.new/` to any URL:

```
https://markdown.new/https://example.com
```

## API Reference

### fetch_markdown(url, method="auto", retain_images=False)

**Parameters:**
- `url` (str): The URL to convert
- `method` (str): Conversion method - "auto" (default), "ai", or "browser"
  - "auto": Try fastest method first, fallback automatically
  - "ai": Use Cloudflare Workers AI for conversion
  - "browser": Use headless browser for JavaScript-heavy sites
- `retain_images` (bool): Whether to keep image references in Markdown

**Returns:**
```json
{
    "success": true,
    "markdown": "# Page Title\n\nContent here...",
    "tokens": 725,
    "title": "Page Title",
    "url": "https://example.com",
    "method_used": "auto"
}
```

## Three-Tier Pipeline

markdown.new uses intelligent fallbacks:

1. **Cloudflare Native** (fastest): Sites with `Accept: text/markdown` support return clean Markdown directly
2. **Workers AI**: HTML passed through AI toMarkdown() function
3. **Browser Rendering**: Headless browser for JavaScript-heavy pages

## Comparison: HTML vs Markdown

| Format | Tokens (blog post) | Efficiency |
|--------|-------------------|------------|
| Raw HTML | ~16,180 | Baseline |
| Markdown | ~3,150 | **80% reduction** |

## Error Handling

The skill includes automatic fallbacks:

1. If markdown.new fails, falls back to traditional web_fetch
2. If method="auto" fails, retries with method="browser"
3. Returns error details if all methods fail

## Examples

### Fetch Blog Post

```python
result = fetch_markdown("https://blog.example.com/article")
if result["success"]:
    summary = summarize(result["markdown"])
```

### Process Multiple URLs

```python
urls = ["https://site1.com", "https://site2.com"]
for url in urls:
    result = fetch_markdown(url)
    if result["success"]:
        process(result["markdown"])
```

### Extract Documentation

```python
# Use browser method for docs sites that need JS
result = fetch_markdown(
    "https://docs.example.com",
    method="browser",
    retain_images=True
)
```

## Integration with Other Skills

This skill can be called by other skills for content extraction:

```python
# Inside another skill
from markdown_fetch import fetch_markdown

def research_topic(query):
    search_results = search_web(query)
    for url in search_results:
        content = fetch_markdown(url)
        analyze(content["markdown"])
```

## Best Practices

1. **Use "auto" method by default**: Let the service choose the best approach
2. **Add buffer for JS sites**: Use method="browser" for React/Vue/Angular sites
3. **Check token counts**: Use returned token count to manage context windows
4. **Handle failures gracefully**: Always check `result["success"]`
5. **Cache results**: For repeated URLs, cache the Markdown to save API calls

## Troubleshooting

**Issue:** markdown.new returns error
- **Solution:** Falls back to web_fetch automatically

**Issue:** JavaScript content not rendered
- **Solution:** Use `method="browser"` parameter

**Issue:** Missing images in output
- **Solution:** Set `retain_images=True`

## Links

- Service: https://markdown.new
- Documentation: https://markdown.new/docs
- Token Savings: ~80% vs raw HTML

## Version History

- v1.0.0: Initial release with basic fetch and fallback support
