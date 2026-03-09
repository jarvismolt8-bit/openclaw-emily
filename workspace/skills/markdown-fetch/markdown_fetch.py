import requests

def fetch_markdown(url: str, method: str = "auto", retain_images: bool = False) -> dict:
    """
    Convert any URL to clean Markdown using markdown.new service.
    
    Args:
        url (str): The URL to convert.
        method (str): Conversion method - "auto", "ai", or "browser". Defaults to "auto".
        retain_images (bool): Whether to keep image references. Defaults to False.
    
    Returns:
        dict: A dictionary containing the conversion result.
            Keys: 'success', 'markdown', 'tokens', 'title', 'url', 'method_used', 'error'
    """
    base_url = "https://markdown.new/"
    headers = {
        "Accept": "text/markdown",
        "Content-Type": "application/json"
    }
    
    payload = {
        "url": url,
        "method": method,
        "retain_images": retain_images
    }
    
    try:
        # Try markdown.new API first
        response = requests.post(base_url, json=payload, headers=headers, timeout=30) # Added timeout
        response.raise_for_status() # Raise an exception for bad status codes

        # Check for specific successful content type, though markdown.new should handle it.
        # If the content is actually HTML and not markdown, markdown.new should ideally return a 200 with markdown.
        # However, let's assume if it's not an error, it's the desired output.
        
        # markdown.new returns JSON with markdown content in 'markdown' key
        data = response.json()

        if data.get("success") == True:
            return {
                "success": True,
                "markdown": data.get("markdown", ""),
                "tokens": data.get("tokens", 0),
                "title": data.get("title", ""),
                "url": data.get("url", url), # Use returned URL if available, else original
                "method_used": data.get("method_used", method),
                "error": None
            }
        else:
            # If markdown.new returns success: false but 200 OK
            return {
                "success": False,
                "markdown": "",
                "tokens": 0,
                "title": "",
                "url": url,
                "method_used": method,
                "error": data.get("error", "Unknown error from markdown.new")
            }
            
    except requests.exceptions.RequestException as e:
        # Fallback logic should be handled by the caller or another layer, 
        # but for this skill, we'll report the error.
        # In a real scenario, we might try web_fetch here as a direct fallback.
        print(f"Error fetching {url} via markdown.new: {e}")
        return {
            "success": False,
            "markdown": "",
            "tokens": 0,
            "title": "",
            "url": url,
            "method_used": method,
            "error": str(e)
        }

# Note: In a real OpenClaw skill, you'd likely use default_api.web_fetch 
# with specific headers or a custom request function if not using requests directly.
# For demonstration, using 'requests' assuming it's available or wrapped.
# For OpenClaw, direct API calls would be preferred if available.
# This is a conceptual Python implementation.
