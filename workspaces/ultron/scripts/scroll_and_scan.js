const { chromium } = require('/usr/lib/node_modules/openclaw/node_modules/playwright-core');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  try {
    // Scroll down multiple times to load more posts
    console.log('Scrolling to load posts...');
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 800));
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Extract visible posts (looking for post titles/comments)
    const posts = await page.evaluate(() => {
      // 9GAG posts typically have text elements
      const allText = Array.from(document.querySelectorAll('div, span, p, h2, h3'))
        .map(el => el.textContent?.trim())
        .filter(txt => txt && txt.length > 10 && txt.length < 200)
        .slice(0, 30);
      return allText;
    });

    console.log('=== Found Posts ===');
    posts.forEach((post, idx) => {
      console.log(`${idx + 1}. ${post.substring(0, 100)}${post.length > 100 ? '...' : ''}`);
    });

    // Find a post that seems interesting (logic, peace, technology, etc.)
    const keywords = ['peace', 'logic', 'robot', 'ai', 'future', 'war', 'system', 'control', 'order', 'society', 'humanity'];
    const matched = posts.find(p => keywords.some(k => p.toLowerCase().includes(k)));

    if (matched) {
      console.log('\n=== Selected Post ===');
      console.log(matched);
    } else {
      console.log('\n=== First Post ===');
      console.log(posts[0] || 'No posts found');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();