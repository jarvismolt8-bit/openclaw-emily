#!/usr/bin/env python3
"""
Enhanced Crawl4AI Extraction Script
Extracts structured data (articles, products, etc.) from websites
Uses pattern library for intelligent content extraction

Usage:
    python extract_structured.py <url> [--pattern nbc_news|generic_article|...]
    python extract_structured.py <url> [--discover]  # Auto-discover best pattern
    python extract_structured.py <url> [--output json|markdown|report]

Examples:
    python extract_structured.py https://www.nbcnews.com/business --pattern nbc_news
    python extract_structured.py https://example.com/news --discover --output json
"""

import asyncio
import json
import sys
import argparse
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode
from patterns import (
    extract_articles, 
    discover_pattern, 
    create_extraction_report,
    list_patterns,
    clean_summary
)


async def extract_from_url(url: str, pattern_name: str = None, 
                           discover: bool = False) -> dict:
    """
    Extract structured data from a URL
    
    Args:
        url: Website URL to crawl
        pattern_name: Specific pattern to use (optional)
        discover: Whether to auto-discover best pattern
        
    Returns:
        Dictionary with extraction results
    """
    print(f"🚀 Fetching content from: {url}")
    
    # Configure browser
    browser_config = BrowserConfig(
        headless=True,
        viewport_width=1920,
        viewport_height=1080
    )
    
    # Configure crawler
    crawler_config = CrawlerRunConfig(
        cache_mode=CacheMode.BYPASS,
        remove_overlay_elements=True,
        wait_for="css:body",
        page_timeout=30000
    )
    
    async with AsyncWebCrawler(config=browser_config) as crawler:
        result = await crawler.arun(url=url, config=crawler_config)
        
        if not result.success:
            return {
                'success': False,
                'error': result.error_message,
                'articles': []
            }
        
        markdown = str(result.markdown)
        
        # Auto-discover pattern if requested
        if discover or not pattern_name:
            print("🔍 Analyzing content structure...")
            suggestions = discover_pattern(markdown)
            
            if suggestions:
                pattern_name = suggestions[0][0]
                print(f"✅ Discovered pattern: {pattern_name} ({suggestions[0][1]} matches)")
                if len(suggestions) > 1:
                    print("   Other options:", ", ".join([f"{p} ({c})" for p, c in suggestions[1:3]]))
            else:
                print("⚠️  No known patterns matched, using generic_article")
                pattern_name = 'generic_article'
        else:
            print(f"📋 Using pattern: {pattern_name}")
        
        # Extract articles
        try:
            articles = extract_articles(markdown, pattern_name=pattern_name)
            
            return {
                'success': True,
                'url': url,
                'pattern_used': pattern_name,
                'total_articles': len(articles),
                'articles': articles,
                'markdown_length': len(markdown)
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'articles': []
            }


def output_results(results: dict, format_type: str = 'json', 
                   output_file: str = None):
    """
    Output extraction results in various formats
    
    Args:
        results: Extraction results dictionary
        format_type: Output format (json, markdown, report)
        output_file: Optional file to save output
    """
    if format_type == 'json':
        output = json.dumps(results, indent=2, ensure_ascii=False)
        
    elif format_type == 'markdown':
        # Create markdown list of articles
        lines = [f"# Extracted Articles from {results['url']}\n"]
        lines.append(f"**Pattern Used:** {results['pattern_used']}\n")
        lines.append(f"**Total Articles:** {results['total_articles']}\n\n")
        
        for i, article in enumerate(results['articles'], 1):
            title = article.get('title', article.get('name', 'Untitled'))
            url = article.get('url', '')
            summary = article.get('summary', '')
            
            lines.append(f"## {i}. {title}\n")
            if url:
                lines.append(f"**URL:** [{url}]({url})\n")
            if summary:
                lines.append(f"{summary}\n")
            lines.append("\n---\n\n")
        
        output = '\n'.join(lines)
        
    elif format_type == 'report':
        output = create_extraction_report(results['articles'], results['url'])
        
    else:
        output = json.dumps(results, indent=2, ensure_ascii=False)
    
    # Save to file or print
    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(output)
        print(f"💾 Output saved to: {output_file}")
    else:
        print(output)


def main():
    parser = argparse.ArgumentParser(
        description='Extract structured data from websites using Crawl4AI'
    )
    parser.add_argument('url', help='URL to crawl')
    parser.add_argument('--pattern', '-p', 
                       help='Pattern to use for extraction',
                       choices=list_patterns().keys())
    parser.add_argument('--discover', '-d', action='store_true',
                       help='Auto-discover best pattern')
    parser.add_argument('--output', '-o', default='json',
                       choices=['json', 'markdown', 'report'],
                       help='Output format')
    parser.add_argument('--file', '-f',
                       help='Save output to file')
    parser.add_argument('--list-patterns', action='store_true',
                       help='List available patterns and exit')
    
    args = parser.parse_args()
    
    # List patterns if requested
    if args.list_patterns:
        print("Available Extraction Patterns:\n")
        for name, description in list_patterns().items():
            print(f"  {name:20} - {description}")
        return
    
    # Validate URL
    if not args.url.startswith(('http://', 'https://')):
        print("❌ Error: URL must start with http:// or https://")
        sys.exit(1)
    
    # Run extraction
    try:
        results = asyncio.run(extract_from_url(
            args.url, 
            pattern_name=args.pattern,
            discover=args.discover
        ))
        
        if results['success']:
            print(f"✅ Extracted {results['total_articles']} articles\n")
            output_results(results, args.output, args.file)
        else:
            print(f"❌ Extraction failed: {results.get('error', 'Unknown error')}")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n⚠️  Extraction cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
