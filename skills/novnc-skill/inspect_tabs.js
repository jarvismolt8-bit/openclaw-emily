const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const pages = context.pages();

  console.log(`Inspecting ${pages.length} tabs:\n`);

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const title = await page.title();
    const url = page.url();

    console.log(`=== Tab ${i} ===`);
    console.log(`Title: ${title}`);
    console.log(`URL: ${url}`);

    // Get visible text (first 20 lines)
    try {
      const text = await page.textContent('body');
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      console.log(`Content lines: ${lines.length}`);
      console.log('Preview (first 10 lines):');
      lines.slice(0, 10).forEach((line, idx) => {
        console.log(`  ${idx + 1}. ${line.trim().substring(0, 100)}`);
      });

      // Look for key indicators
      if (url.includes('9gag.com')) {
        // Count posts
        const posts = text.match(/(upVoteCount|downVoteCount)/g);
        if (posts) console.log(`  - Found ${posts.length / 2} GAG posts`);
      }
      if (url.includes('reddit.com')) {
        if (text.includes('Log in') || text.includes('Sign up')) {
          console.log('  - Reddit appears to be on login/register page');
        } else {
          const posts = text.match(/comments?\s+\d+:\s+/g);
          if (posts) console.log(`  - Found ${posts.length} reddit post indicators`);
        }
      }
      if (url.includes('airbnb.com')) {
        if (text.includes('Experiences')) {
          console.log('  - Airbnb Experiences page loaded');
        }
        if (text.includes('Search') || text.includes('Search for')) {
          console.log('  - Search functionality visible');
        }
      }
    } catch (error) {
      console.log(`  Error reading content: ${error.message}`);
    }

    console.log('');
  }

  await browser.close();
})();