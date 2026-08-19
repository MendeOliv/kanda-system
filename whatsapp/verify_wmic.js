// Verification script for WMIC interception
// Load the bundled main.js to apply the interception
require('./dist/main.js');

const { spawn } = require('child_process');
const { EventEmitter } = require('events');

function runSpawnTest(args, expectedContains, description) {
  return new Promise((resolve, reject) => {
    const ps = spawn('wmic', args);
    let stdout = '';
    let stderr = '';
    ps.stdout.on('data', (data) => { stdout += data.toString(); });
    ps.stderr.on('data', (data) => { stderr += data.toString(); });
    ps.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`${description}: non-zero exit ${code}, stderr: ${stderr}`));
        return;
      }
      if (!stdout.includes(expectedContains)) {
        reject(new Error(`${description}: expected output to contain "${expectedContains}", got: "${stdout.trim()}"`));
        return;
      }
      resolve({ stdout, stderr, code });
    });
    // timeout
    setTimeout(() => {
      ps.kill();
      reject(new Error(`${description}: timeout`));
    }, 2000);
  });
}

(async () => {
  try {
    console.log('Testing pidusage query...');
    const r1 = await runSpawnTest(
      ['os', 'get', 'Caption'],
      'CreationDate',
      'pidusage query'
    );
    console.log('✅ pidusage query passed');

    console.log('Testing WhatsApp engine query...');
    const r2 = await runSpawnTest(
      ['PROCESS', 'GET', 'Name,ProcessId,ParentProcessId,Status'],
      'Name ProcessId ParentProcessId Status',
      'WhatsApp engine query'
    );
    console.log('✅ WhatsApp engine query passed');

    console.log('All tests passed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Verification failed:', err.message);
    process.exit(1);
  }
})();
