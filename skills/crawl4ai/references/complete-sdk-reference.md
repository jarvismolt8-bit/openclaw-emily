# Crawl4AI SDK Reference

**Version:** 0.7.4  
**Format:** Condensed parameter reference for quick lookup

---

## Navigation

- [Core API](#core-api)
- [Configuration](#configuration)
- [Content Processing](#content-processing)
- [Link & Media](#link--media)
- [Extraction Strategies](#extraction-strategies)
- [Quick Reference](#quick-reference)

---

# Core API

## AsyncWebCrawler

Main crawler class. Use as context manager or with explicit start/close.

```python
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig

# Recommended: context manager
async with AsyncWebCrawler() as crawler:
    result = await crawler.arun(url="https://example.com")
```

### `arun()` Parameters

```python
await crawler.arun(
    url="https://example.com",
    config=CrawlerRunConfig(...)  # All crawl settings go here
)
```

### `arun_many()` Parameters

```python
# Batch crawling with concurrency
results = await crawler.arun_many(
    urls=["https://a.com", "https://b.com"],
    config=CrawlerRunConfig(...),
    dispatcher=None  # Optional: MemoryAdaptiveDispatcher for resource control
)
# Streaming mode
async for result in await crawler.arun_many(urls, config=CrawlerRunConfig(stream=True)):
    process(result)
```

### CrawlResult

| Attribute | Type | Description |
|-----------|------|-------------|
| `success` | `bool` | Whether crawl succeeded |
| `html` | `str` | Raw HTML |
| `cleaned_html` | `str` | Cleaned HTML |
| `markdown` | `str` | Generated markdown |
| `fit_markdown` | `str` | Content-filtered markdown |
| `links` | `dict` | `{"internal": [...], "external": [...]}` |
| `media` | `dict` | `{"images": [...], "videos": [...]}` |
| `metadata` | `dict` | Page metadata (title, description, etc.) |
| `screenshot` | `str` | Base64 screenshot |
| `pdf` | `bytes` | PDF bytes |
| `extracted_content` | `str` | Structured extraction output (JSON) |
| `error_message` | `str` | Error if failed |
| `status_code` | `int` | HTTP status code |
| `cookies` | `list` | Page cookies |

---

# Configuration

## BrowserConfig

Controls browser environment (headless, proxy, user agent, etc.)

```python
from crawl4ai import BrowserConfig

browser_cfg = BrowserConfig(
    browser_type="chromium",     # "chromium", "firefox", "webkit"
    headless=True,
    viewport_width=1280,
    viewport_height=720,
    proxy_config={"server": "...", "username": "...", "password": "..."},
    user_agent="...",
    ignore_https_errors=True,
    use_persistent_context=True,  # Keep cookies/sessions
    user_data_dir="/path/to/dir",
)
```

### BrowserConfig Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `browser_type` | `"chromium"` | Browser engine: `"chromium"`, `"firefox"`, `"webkit"` |
| `headless` | `True` | Run without GUI |
| `viewport_width` | `1080` | Page width in px |
| `viewport_height` | `600` | Page height in px |
| `proxy_config` | `None` | `{"server": "http://...", "username": "...", "password": "..."}` |
| `user_agent` | Chrome UA | Custom user agent string |
| `user_agent_mode` | `None` | Set `"random"` to rotate UAs |
| `ignore_https_errors` | `True` | Continue despite invalid certs |
| `java_script_enabled` | `True` | Enable/disable JavaScript |
| `use_persistent_context` | `False` | Keep sessions across runs |
| `user_data_dir` | `None` | Directory for persistent browser data |
| `cookies` | `[]` | Pre-set cookies: `[{"name": "...", "value": "...", "url": "..."}]` |
| `headers` | `{}` | Extra HTTP headers |
| `light_mode` | `False` | Disable background features |
| `text_mode` | `False` | Disable images for speed |
| `extra_args` | `[]` | Additional browser flags |

---

## CrawlerRunConfig

Controls per-crawl behavior (caching, content filtering, JS, extraction, etc.)

```python
from crawl4ai import CrawlerRunConfig, CacheMode

run_cfg = CrawlerRunConfig(
    cache_mode=CacheMode.BYPASS,
    css_selector=".main-content",
    wait_for="css:.content",
    js_code="document.querySelector('.more')?.click();",
    screenshot=True,
)
```

### A) Core & Caching

| Parameter | Default | Description |
|-----------|---------|-------------|
| `cache_mode` | `ENABLED` | `ENABLED`, `BYPASS`, `DISABLED`, `READ_ONLY`, `WRITE_ONLY` |
| `bypass_cache` | `False` | Alias for `CacheMode.BYPASS` |
| `disable_cache` | `False` | Alias for `CacheMode.DISABLED` |
| `check_robots_txt` | `False` | Respect robots.txt rules |
| `verbose` | `True` | Detailed logging |

### B) Content Processing

| Parameter | Default | Description |
|-----------|---------|-------------|
| `word_count_threshold` | `~200` | Skip text blocks below X words |
| `css_selector` | `None` | Focus on specific element (e.g., `".main"`) |
| `target_elements` | `None` | List of CSS selectors to focus on |
| `excluded_tags` | `None` | Remove entire tags (e.g., `["nav", "footer"]`) |
| `excluded_selector` | `None` | CSS selector to exclude (e.g., `"#ads"`) |
| `only_text` | `False` | Extract text only |
| `remove_forms` | `False` | Remove `<form>` elements |
| `remove_overlay_elements` | `False` | Remove modals/popups |
| `keep_data_attributes` | `False` | Preserve `data-*` attributes |
| `markdown_generator` | `None` | `DefaultMarkdownGenerator` with options |
| `extraction_strategy` | `None` | Schema-based or LLM extraction strategy |

### C) Page Navigation & Timing

| Parameter | Default | Description |
|-----------|---------|-------------|
| `wait_until` | `domcontentloaded` | Navigation condition: `"networkidle"`, `"load"`, `"domcontentloaded"` |
| `page_timeout` | `60000` | Page load timeout (ms) |
| `wait_for` | `None` | Wait for CSS (`"css:selector"`) or JS (`"js:() => bool"`) |
| `wait_for_images` | `False` | Wait for images to load |
| `delay_before_return_html` | `0.1` | Pause before capture (seconds) |
| `mean_delay` | `0.1` | Delay between requests in batch mode |
| `semaphore_count` | `5` | Max concurrent requests |

### D) Page Interaction

| Parameter | Default | Description |
|-----------|---------|-------------|
| `js_code` | `None` | JavaScript to run after load (string or list) |
| `js_only` | `False` | Reuse session without full reload |
| `scan_full_page` | `False` | Auto-scroll to load infinite scroll |
| `scroll_delay` | `0.2` | Delay between scroll steps |
| `process_iframes` | `False` | Inline iframe content |
| `simulate_user` | `False` | Simulate mouse movements |
| `override_navigator` | `False` | Override navigator properties |
| `magic` | `False` | Auto-handle popups/consent banners |
| `virtual_scroll_config` | `None` | Config for virtualized scrolling (Twitter/Instagram) |

**VirtualScrollConfig:**
```python
from crawl4ai import VirtualScrollConfig
VirtualScrollConfig(
    container_selector="#timeline",
    scroll_count=30,
    scroll_by="container_height",  # or "page_height", or pixels
    wait_after_scroll=0.5
)
```

### E) Media Handling

| Parameter | Default | Description |
|-----------|---------|-------------|
| `screenshot` | `False` | Capture screenshot (base64 in `result.screenshot`) |
| `screenshot_wait_for` | `None` | Extra wait before screenshot |
| `pdf` | `False` | Generate PDF |
| `capture_mhtml` | `False` | Capture MHTML snapshot |
| `exclude_external_images` | `False` | Exclude images from other domains |
| `image_score_threshold` | `3` | Filter low-relevance images |

### F) Link/Domain Handling

| Parameter | Default | Description |
|-----------|---------|-------------|
| `exclude_external_links` | `False` | Remove off-domain links |
| `exclude_social_media_links` | `False` | Remove social media links |
| `exclude_domains` | `[]` | List of domains to exclude |
| `exclude_social_media_domains` | `["facebook.com", ...]` | Extendable default list |
| `preserve_https_for_internal_links` | `False` | Keep HTTPS for internal links |

### G) Session Management

| Parameter | Default | Description |
|-----------|---------|-------------|
| `session_id` | `None` | Reuse browser session across calls |

### H) URL Matching (for arun_many)

```python
from crawl4ai import CrawlerRunConfig, MatchMode

pdf_config = CrawlerRunConfig(url_matcher="*.pdf")
blog_config = CrawlerRunConfig(
    url_matcher=["*/blog/*", "*/article/*"],
    match_mode=MatchMode.OR
)
api_config = CrawlerRunConfig(url_matcher=lambda url: 'api' in url)
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `url_matcher` | `None` | String (glob), function, or list |
| `match_mode` | `OR` | `MatchMode.OR` (any) or `MatchMode.AND` (all) |

---

# Content Processing

## Markdown Generation

```python
from crawl4ai import CrawlerRunConfig
from crawl4ai.markdown_generation_strategy import DefaultMarkdownGenerator
from crawl4ai.content_filter_strategy import PruningContentFilter, BM25ContentFilter

# Remove low-quality content
pruning_filter = PruningContentFilter(threshold=0.4, threshold_type="fixed")

# Relevance-based filtering
bm25_filter = BM25ContentFilter(user_query="your search query", bm25_threshold=1.0)

config = CrawlerRunConfig(
    markdown_generator=DefaultMarkdownGenerator(content_filter=bm25_filter)
)
result = await crawler.arun(url, config=config)
print(result.markdown.fit_markdown)  # Filtered version
print(result.markdown.raw_markdown)  # Full version
```

### Generator Options

```python
DefaultMarkdownGenerator(
    options={
        "ignore_links": False,
        "ignore_images": False,
        "image_alt_text": True
    }
)
```

---

# Link & Media

Access from `result.links` and `result.media`:

```python
result = await crawler.arun(url)
images = result.media["images"]
videos = result.media["videos"]
internal = result.links["internal"]
external = result.links["external"]
```

---

# Extraction Strategies

## Schema-Based (No LLM) — Fastest

```python
from crawl4ai import JsonCssExtractionStrategy

schema = {
    "name": "Products",
    "baseSelector": "div.product",
    "fields": [
        {"name": "title", "selector": "h3", "type": "text"},
        {"name": "price", "selector": ".price", "type": "text"},
        {"name": "url", "selector": "a", "type": "attribute", "attribute": "href"}
    ]
}
strategy = JsonCssExtractionStrategy(schema)
config = CrawlerRunConfig(extraction_strategy=strategy)
result = await crawler.arun(url, config=config)
data = json.loads(result.extracted_content)
```

## Regex-Based — Fast Pattern Matching

```python
from crawl4ai import RegexExtractionStrategy

pattern = r'## \[(.+?)\]\((.+?)\)\n(.+?)(?=\n## |$)'
strategy = RegexExtractionStrategy(pattern, "news_articles", flags=re.DOTALL | re.MULTILINE)
config = CrawlerRunConfig(extraction_strategy=strategy)
```

## LLM-Based — Complex Extraction

```python
from crawl4ai import LLMExtractionStrategy

strategy = LLMExtractionStrategy(
    provider="openai/gpt-4o-mini",
    instruction="Extract product name, price, and availability"
)
config = CrawlerRunConfig(extraction_strategy=strategy)
```

---

# Quick Reference

## Basic

```python
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode

async with AsyncWebCrawler() as crawler:
    result = await crawler.arun("https://example.com")
    print(result.markdown)
```

## Advanced

```python
browser_cfg = BrowserConfig(headless=True)
crawler_cfg = CrawlerRunConfig(
    cache_mode=CacheMode.BYPASS,
    wait_for="css:.content",
    screenshot=True,
    js_code="window.scrollTo(0, document.body.scrollHeight);"
)
async with AsyncWebCrawler(config=browser_cfg) as crawler:
    result = await crawler.arun("https://example.com", config=crawler_cfg)
```

## Batch

```python
urls = ["https://a.com", "https://b.com"]
results = await crawler.arun_many(urls, config=crawler_cfg, max_concurrent=5)
```
