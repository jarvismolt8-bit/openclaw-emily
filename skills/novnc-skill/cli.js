#!/usr/bin/env node

const BrowserController = require('./lib/browser');

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log(JSON.stringify({
      error: 'No command specified',
      usage: 'node cli.js <command> [args...]',
      commands: [
        'open <url>',
        'click <selector>',
        'click-robust <text>',
        'type <selector> <text>',
        'fill <selector> <text>',
        'fill-robust <selector> <text>',
        'press <key>',
        'content',
        'title',
        'url',
        'text [selector]',
        'screenshot [base64|raw]',
        'capture',
        'wait <ms>',
        'wait-for <type> <condition> [timeout]',
        'wait-modal [timeout]',
        'reload',
        'back',
        'forward',
        'new <url>',
        'post <text>',
        'execute <js-code> [args...]'
      ]
    }));
    process.exit(1);
  }

  const command = args[0];
  const controller = new BrowserController();

  try {
    let result;

    switch (command) {
      case 'open':
        if (args.length < 2) throw new Error('Missing URL');
        result = await controller.goto(args[1]);
        break;
      case 'click':
        if (args.length < 2) throw new Error('Missing selector');
        result = await controller.click(args[1]);
        break;
      case 'click-robust':
        if (args.length < 2) throw new Error('Missing target text');
        result = await controller.robustClick(args[1]);
        break;
      case 'type':
        if (args.length < 3) throw new Error('Missing selector or text');
        result = await controller.type(args[1], args[2]);
        break;
      case 'fill':
        if (args.length < 3) throw new Error('Missing selector or text');
        result = await controller.fill(args[1], args[2]);
        break;
      case 'fill-robust':
        if (args.length < 3) throw new Error('Missing selector and text');
        result = await controller.robustFill(args[1], args[2]);
        break;
      case 'press':
        if (args.length < 2) throw new Error('Missing key');
        await controller.press(args[1]);
        result = { success: true };
        break;
      case 'content':
        result = { content: await controller.content() };
        break;
      case 'title':
        result = { title: await controller.title() };
        break;
      case 'url':
        result = { url: await controller.url() };
        break;
      case 'text':
        const selector = args[1] || 'body';
        result = { text: await controller.textContent(selector) };
        break;
      case 'screenshot':
        const encoding = args[1] === 'raw' ? 'buffer' : 'base64';
        const data = await controller.screenshot(encoding === 'buffer' ? 'buffer' : 'base64');
        result = encoding === 'buffer' ? { screenshot: data } : { screenshot: `data:image/png;base64,${data}` };
        break;
      case 'capture':
        result = await controller.captureWithText();
        break;
      case 'wait':
        const ms = parseInt(args[1], 10);
        if (isNaN(ms) || ms <= 0) throw new Error('Invalid wait time');
        await new Promise(resolve => setTimeout(resolve, ms));
        result = { success: true };
        break;
      case 'wait-for':
        if (args.length < 3) throw new Error('Usage: wait-for <type> <condition> [timeout]');
        const cond = { type: args[1] };
        if (args[1] === 'selector') {
          cond.selector = args[2];
        } else if (args[1] === 'text') {
          cond.text = args[2];
        } else if (args[1] === 'visible') {
          cond.selector = args[2];
        } else if (args[1] === 'function') {
          cond.fn = new Function('return ' + args.slice(2).join(' '));
        } else {
          throw new Error('Unknown condition type. Use: selector, text, visible, function');
        }
        let waitTimeout = undefined;
        if (args.length > 3) {
          waitTimeout = parseInt(args[3], 10);
          if (isNaN(waitTimeout)) throw new Error('Timeout must be a number');
        }
        try {
          result = await controller.waitFor(cond, waitTimeout);
        } catch (e) {
          // Re-throw with more context
          throw new Error(`wait-for failed: ${e.message}`);
        }
        break;
      case 'wait-modal':
        const modalTimeout = parseInt(args[1], 10) || 10000;
        result = await controller.waitForModal(modalTimeout);
        break;
      case 'reload':
        result = await controller.reload();
        break;
      case 'back':
        result = await controller.back();
        break;
      case 'forward':
        result = await controller.forward();
        break;
      case 'new':
        const url = args[1] || 'about:blank';
        result = await controller.newPage(url);
        break;
      case 'post':
        if (args.length < 2) throw new Error('Missing tweet text');
        result = await postTweet(controller, args[1]);
        break;
      case 'execute':
        if (args.length < 2) throw new Error('Missing script');
        const scriptArgs = args.slice(2);
        result = await controller.execute(args[1], scriptArgs);
        break;
      default:
        throw new Error(`Unknown command: ${command}`);
    }

    console.log(JSON.stringify({ success: true, command, data: result }));
    process.exit(0);

  } catch (error) {
    console.log(JSON.stringify({
      success: false,
      command,
      error: error.message,
      stack: error.stack
    }));
    process.exit(1);
  } finally {
    try {
      await controller.closeDisconnect();
    } catch (e) {}
  }
}

// Specialized action: Post a tweet on X.com
async function postTweet(controller, text) {
  const currentUrl = await controller.url();
  if (!currentUrl.includes('x.com')) {
    await controller.goto('https://x.com/home');
    await controller.waitForSelector('[aria-label*="What\'s happening?"], [data-testid="tweetButton"]', { timeout: 10000 });
  }

  const selectors = [
    '[aria-label*="What\'s happening?"]',
    '[data-testid="tweetTextarea_0"]',
    '[data-testid="tweetButton"]',
    'div[role="textbox"]',
    'textarea[placeholder*="What\'s happening"]'
  ];

  let textareaSelector = null;
  for (const sel of selectors) {
    try {
      await controller.waitForSelector(sel, { timeout: 2000 });
      textareaSelector = sel;
      break;
    } catch (e) {}
  }

  if (!textareaSelector) {
    throw new Error('Could not locate tweet input area');
  }

  await controller.click(textareaSelector);
  await controller.fill(textareaSelector, text);

  const postSelectors = [
    '[data-testid="tweetButtonInline"]',
    '[data-testid="tweetButton"]',
    'div[role="button"]:has-text("Post")',
    'div[role="button"]:has-text("Tweet")'
  ];

  let postSelector = null;
  for (const sel of postSelectors) {
    try {
      await controller.waitForSelector(sel, { timeout: 3000 });
      postSelector = sel;
      break;
    } catch (e) {}
  }

  if (!postSelector) {
    throw new Error('Could not locate Post button');
  }

  await controller.click(postSelector);
  await controller.waitMs(2000);

  return { success: true, message: 'Tweet posted' };
}

main();