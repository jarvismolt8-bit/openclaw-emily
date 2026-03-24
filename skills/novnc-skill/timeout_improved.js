#!/usr/bin/env node
// Improved timeout flow using enhanced novnc commands

const { spawn } = require('child_process');

function runCommand(cmd, args = [], timeout = 15000) {
  return new Promise((resolve, reject) => {
    const cmdArgs = ['/root/.openclaw/skills/novnc-skill/cli.js', cmd, ...(Array.isArray(args) ? args : [String(args)])];
    const proc = spawn('node', cmdArgs, {
      timeout,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });

    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) {
        try {
          const output = JSON.parse(stdout.trim());
          if (output.success) {
            resolve(output);
          } else {
            reject(new Error(output.error || 'Command failed'));
          }
        } catch (e) {
          resolve({ success: true, raw: stdout });
        }
      } else {
        reject(new Error(`Exit ${code}: ${stderr}`));
      }
    });
  });
}

async function performTimeout() {
  try {
    console.log('=== Improved Timeout Flow ===\n');

    // Reload page to start fresh
    console.log('Reloading page...');
    await runCommand('reload');
    await runCommand('wait', ['2000']);

    // Close announcement popup if present
    console.log('Closing popup...');
    try {
      await runCommand('click-robust', ['Close']);
      await runCommand('wait', ['1000']);
    } catch (e) {
      console.log('  No popup close button, continuing');
    }

    // Click TIME OUT using robust click (handles visibility/selection)
    console.log('Clicking TIME OUT...');
    await runCommand('click-robust', ['TIME OUT']);
    await runCommand('wait', ['2000']);

    // Wait for modal with Confirm button
    console.log('Waiting for Confirm modal...');
    await runCommand('wait-for', ['selector', 'button:has-text("Confirm")'], '10000');

    // Click Confirm
    console.log('Clicking Confirm...');
    await runCommand('click-robust', ['Confirm']);
    await runCommand('wait', ['2000']);

    // Verify
    const title = await runCommand('title');
    console.log('\n✅ Timeout completed!');
    console.log('Title:', title.data?.title || 'N/A');

  } catch (error) {
    console.error('\n❌ Flow failed:', error.message);
    process.exit(1);
  }
}

performTimeout();