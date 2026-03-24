const controller = require('./lib/browser');

(async () => {
  const ctrl = new controller();
  try {
    console.log('Testing wait-for visible...');
    const result = await ctrl.waitFor({ type: 'visible', selector: 'button:has-text("TIME OUT")' }, 5000);
    console.log('Result:', result);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await ctrl.closeDisconnect();
  }
})();