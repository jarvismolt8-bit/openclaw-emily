"""
Crawl4AI Pattern Library
Common extraction patterns for structured data from markdown content
"""

import re
from typing import List, Dict, Optional, Tuple

# Common extraction patterns for different website structures
# Patterns are ordered from most specific to most generic
ARTICLE_PATTERNS = {
    # NBC News style: ## [Title](URL) followed by summary
    'nbc_news': {
        'pattern': r'## \[(.+?)\]\((https?://www\.nbcnews\.com/[^)]+)\)\n(.*?)'
                   r'(?=\n## |\n\* \* \* |$)',
        'flags': re.DOTALL | re.MULTILINE,
        'description': 'NBC News article format with title, URL, and multi-line summary',
        'groups': ['title', 'url', 'summary']
    },
    
    # Generic news article pattern
    'generic_article': {
        'pattern': r'## \[(.+?)\]\((https?://[^)]+)\)\n(.*?)'
                   r'(?=\n## |\n\*\*\* |\Z)',
        'flags': re.DOTALL | re.MULTILINE,
        'description': 'Generic markdown article with title link and summary',
        'groups': ['title', 'url', 'summary']
    },
    
    # Pattern for sites with date prefixes
    'dated_article': {
        'pattern': r'\*\*\d{1,2}/\d{1,2}/\d{2,4}\*\*\s*\n## \[(.+?)\]\((https?://[^)]+)\)\n(.*?)'
                   r'(?=\n\*\*\d{1,2}/\d{1,2}/\d{2,4}|\n## |\Z)',
        'flags': re.DOTALL | re.MULTILINE,
        'description': 'Articles with date prefix before title',
        'groups': ['title', 'url', 'summary']
    },
    
    # Pattern for list-based articles
    'list_article': {
        'pattern': r'- \*\*(.+?)\*\*\s*\[(.+?)\]\((https?://[^)]+)\)(.*?)'
                   r'(?=\n- \*\*|\n## |\Z)',
        'flags': re.DOTALL | re.MULTILINE,
        'description': 'Bullet list format with bold title, link, and description',
        'groups': ['title', 'link_text', 'url', 'summary']
    },
    
    # Product listing pattern
    'product_listing': {
        'pattern': r'### (.+?)\n.*?\*\*Price:\*\* (.+?)\n.*?\[(.+?)\]\((https?://[^)]+)\)',
        'flags': re.DOTALL | re.MULTILINE,
        'description': 'Product listings with name, price, and URL',
        'groups': ['name', 'price', 'link_text', 'url']
    }
}

# Common cleanup patterns
CLEANUP_PATTERNS = {
    'read_more': r'\[Read More.*?\]\(.*?\)',
    'image_captions': r'!\[.*?\]\(.*?\)\s*\n?',
    'category_links': r'\[.*?\]\(/[^)]+\)\s*•\s*',
    'extra_whitespace': r'\n{3,}',
    'leading_bullets': r'^\s*[-*]\s*'
}


def get_pattern(pattern_name: str) -> Optional[Dict]:
    """
    Get a predefined pattern by name
    
    Args:
        pattern_name: Name of the pattern (e.g., 'nbc_news', 'generic_article')
        
    Returns:
        Pattern dictionary or None if not found
    """
    return ARTICLE_PATTERNS.get(pattern_name)


def list_patterns() -> Dict[str, str]:
    """
    List all available patterns with descriptions
    
    Returns:
        Dictionary of pattern_name -> description
    """
    return {name: info['description'] for name, info in ARTICLE_PATTERNS.items()}


def clean_summary(text: str, remove_links: bool = True, 
                  remove_images: bool = True) -> str:
    """
    Clean up extracted summary text
    
    Args:
        text: Raw summary text
        remove_links: Remove trailing [Read More] style links
        remove_images: Remove markdown image references
        
    Returns:
        Cleaned summary text
    """
    if not text:
        return ""
    
    # Remove trailing read more links
    if remove_links:
        text = re.sub(CLEANUP_PATTERNS['read_more'], '', text, flags=re.IGNORECASE)
    
    # Remove image captions
    if remove_images:
        text = re.sub(CLEANUP_PATTERNS['image_captions'], '', text)
    
    # Remove category links (like [Category](/link) • )
    text = re.sub(CLEANUP_PATTERNS['category_links'], '', text)
    
    # Remove leading bullets
    text = re.sub(CLEANUP_PATTERNS['leading_bullets'], '', text, flags=re.MULTILINE)
    
    # Collapse multiple newlines to single newline
    text = re.sub(CLEANUP_PATTERNS['extra_whitespace'], '\n\n', text)
    
    # Strip whitespace
    text = text.strip()
    
    return text


def extract_articles(markdown: str, pattern_name: str = 'generic_article',
                     custom_pattern: Optional[str] = None,
                     custom_flags: Optional[int] = None,
                     clean_summaries: bool = True) -> List[Dict]:
    """
    Extract articles from markdown content using predefined or custom patterns
    
    Args:
        markdown: Raw markdown content from crawl4ai
        pattern_name: Name of predefined pattern to use (default: 'generic_article')
        custom_pattern: Optional custom regex pattern string
        custom_flags: Optional regex flags for custom pattern
        clean_summaries: Whether to clean up extracted summaries
        
    Returns:
        List of dictionaries containing extracted article data
        
    Example:
        >>> articles = extract_articles(markdown, 'nbc_news')
        >>> print(articles[0]['title'])
        'Article Title'
    """
    articles = []
    
    # Use custom pattern if provided, otherwise get predefined
    if custom_pattern:
        pattern = custom_pattern
        flags = custom_flags if custom_flags is not None else (re.DOTALL | re.MULTILINE)
        group_names = ['field_' + str(i) for i in range(10)]  # Generic names
    else:
        pattern_info = get_pattern(pattern_name)
        if not pattern_info:
            raise ValueError(f"Unknown pattern: {pattern_name}. "
                           f"Available: {list(ARTICLE_PATTERNS.keys())}")
        
        pattern = pattern_info['pattern']
        flags = pattern_info['flags']
        group_names = pattern_info['groups']
    
    # Compile and execute regex
    try:
        regex = re.compile(pattern, flags)
        matches = regex.findall(markdown)
    except re.error as e:
        raise ValueError(f"Invalid regex pattern: {e}")
    
    # Process matches
    for match in matches:
        # Handle single group vs multiple groups
        if isinstance(match, str):
            match = (match,)
        
        # Build article dict from groups
        article = {}
        for i, value in enumerate(match):
            if i < len(group_names):
                field_name = group_names[i]
                # Clean summary if it's the summary field
                if field_name == 'summary' and clean_summaries:
                    value = clean_summary(value)
                article[field_name] = value.strip() if value else ""
            else:
                article[f'field_{i}'] = value.strip() if value else ""
        
        # Only add if we have at least a title
        if article.get('title') or article.get('name'):
            articles.append(article)
    
    return articles


def discover_pattern(markdown: str, sample_size: int = 1000) -> List[Tuple[str, int]]:
    """
    Analyze markdown and suggest which patterns might work
    
    Args:
        markdown: Sample markdown content to analyze
        sample_size: Number of characters to sample for analysis
        
    Returns:
        List of tuples (pattern_name, match_count) sorted by match count
    """
    sample = markdown[:sample_size]
    results = []
    
    for name, info in ARTICLE_PATTERNS.items():
        try:
            regex = re.compile(info['pattern'], info['flags'])
            matches = len(regex.findall(sample))
            if matches > 0:
                results.append((name, matches))
        except:
            continue
    
    # Sort by match count (most matches first)
    results.sort(key=lambda x: x[1], reverse=True)
    return results


def create_extraction_report(articles: List[Dict], url: str) -> str:
    """
    Create a formatted report of extraction results
    
    Args:
        articles: List of extracted articles
        url: Source URL
        
    Returns:
        Formatted report string
    """
    report = f"Extraction Report for: {url}\n"
    report += f"Articles Found: {len(articles)}\n"
    report += "=" * 50 + "\n\n"
    
    for i, article in enumerate(articles, 1):
        report += f"Article {i}:\n"
        report += f"  Title: {article.get('title', article.get('name', 'N/A'))}\n"
        report += f"  URL: {article.get('url', 'N/A')}\n"
        if 'summary' in article:
            summary = article['summary'][:150] + "..." if len(article['summary']) > 150 else article['summary']
            report += f"  Summary: {summary}\n"
        report += "\n"
    
    return report
