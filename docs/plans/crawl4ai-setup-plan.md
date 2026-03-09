# Crawl4AI Setup Plan for OpenClaw Environment

This document outlines the strategy for installing and using the Crawl4AI skill within the current OpenClaw environment.

**Model Context:** The current model is `opencode/kimi-k2.5-free`, which is suitable for code-related tasks and detailed explanations.

## 1. Environment Analysis & Challenges

*   **Global Pip Availability:** `pip` and `pip3` are not found. This is the primary blocker for direct installation of `crawl4ai` and its Python dependencies.
*   **Python Interpreter:** `python3` is available.
*   **Existing Browser:** Google Chrome is installed and accessible (`/usr/bin/google-chrome`).
*   **OpenClaw Tools:** `browser` (for screenshots/snapshots) and `web_fetch` are available.
*   **Crawl4AI Dependencies:** `crawl4ai` requires Python, `pip`, Playwright, and browser binaries (e.g., Chromium).

## 2. Proposed Solution: Python Virtual Environment (venv)

Since global `pip` is unavailable, we will create an isolated Python virtual environment (venv). This environment will have its own `pip` and allow us to install `crawl4ai` and its dependencies.

### Step 1: Create and Activate the Virtual Environment

1.  **Navigate to Workspace:** We'll create the venv within the OpenClaw workspace for easy management.
    ```bash
    # cd to workspace
    cd /root/.openclaw/workspace
    ```

2.  **Create the venv:** This command creates a directory (`crawl4ai_env`) containing a Python interpreter and `pip` specific to this environment.
    ```bash
    # Create the virtual environment
    python3 -m venv crawl4ai_env
    ```

3.  **Activate the venv:** This command modifies the shell's environment so that `python` and `pip` commands refer to those within the venv.
    ```bash
    # Activate the virtual environment (Linux/macOS)
    source crawl4ai_env/bin/activate
    ```
    *   **Important Note for OpenClaw `exec`:** When using `default_api.exec`, commands that need to run within the venv will need to explicitly use the venv's Python executable. For example: `/root/.openclaw/workspace/crawl4ai_env/bin/python your_script.py`.

### Step 2: Install Crawl4AI and Dependencies within the venv

Once the venv is active (or its executables are referenced directly), we can proceed with installation.

1.  **Install Crawl4AI:**
    ```bash
    # Run this command INSIDE the activated venv, or use:
    # /root/.openclaw/workspace/crawl4ai_env/bin/pip install -U crawl4ai
    pip install -U crawl4ai
    ```

2.  **Run Crawl4AI Setup:** This command handles downloading Playwright's browser binaries (like Chromium).
    ```bash
    # Run this command INSIDE the activated venv, or use:
    # /root/.openclaw/workspace/crawl4ai_env/bin/crawl4ai-setup
    crawl4ai-setup
    ```
    *   This step is crucial as it downloads the browser automation dependencies.

3.  **(Optional) Configure for Existing Chrome:**
    *   While `crawl4ai-setup` installs Chromium, Crawl4AI's `BrowserConfig` can be directed to use your system's Chrome if preferred.
    *   **Example in Python:**
        ```python
        from crawl4ai import AsyncWebCrawler, BrowserConfig

        # Path to your system's Chrome (adjust if needed)
        chrome_path = "/usr/bin/google-chrome"  

        browser_config = BrowserConfig(
            browser_type="chrome",  # Specify Chrome
            headless=True,          # Run without GUI
            executable_path=chrome_path # Point to your Chrome installation
        )

        # Then pass this config to AsyncWebCrawler:
        # async with AsyncWebCrawler(config=browser_config) as crawler: ...
        ```
    *   **Note:** This requires `crawl4ai` to be installed and the `browser_type` and `executable_path` to be correctly set.

### Step 3: Usage and Verification

1.  **Verification:** After installation, run `crawl4ai-doctor` within the activated venv to check setup.
    ```bash
    # Run INSIDE activated venv:
    crawl4ai-doctor
    ```

2.  **Example Usage:** Use the Python API as demonstrated previously, ensuring commands run within the venv context.
    ```bash
    # Example script to run within the activated venv:
    # /root/.openclaw/workspace/crawl4ai_env/bin/python your_crawl_script.py
    ```

## 3. Considerations and Fallbacks

*   **Venv Activation in `exec`:** Commands executed via `default_api.exec` must either be run within an explicitly activated venv context or use the direct path to the venv's Python interpreter (`/root/.openclaw/workspace/crawl4ai_env/bin/python`).
*   **Complexity:** Setting up and consistently using a venv can add complexity.
*   **Alternative Tools:** If the venv setup proves too challenging or if only basic scraping is needed, OpenClaw's built-in `browser` (for screenshots/snapshots) and `web_fetch` (for static content) tools remain viable alternatives.

---
*This plan provides a robust method for installing Crawl4AI by overcoming the lack of global pip. It prioritizes an isolated and manageable setup.*
