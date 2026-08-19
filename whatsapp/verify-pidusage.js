// Verification script: test that pidusage does not spawn wmic.exe when shim is present
const path = require('path');
const os = require('os');

// Add shim directory to PATH before requiring pidusage
const shimDir = 'C:\\Users\\UTILIZADOR\\AppData\\Local\\Temp\\wmic_shim';
process.env.PATH = shimDir + path.delimiter + process.env.PATH;

// Optional: set env vars (not strictly needed if shim works)
process.env.PIDUSAGE_USE_PS = 'true';
process.env.PIDUSAGE_NO_WMIC = '1';

// Require pidusage from the local node_modules
const pidusage = require('./node_modules/pidusage');

const pid = process.pid;

console.log(`Testing pidusage with PID ${pid}...`);

pidusage(pid, (err, stats) => {
  if (err) {
    if (err.code === 'ENOENT' && err.syscall === 'spawn wmic.exe') {
      console.error('FAILURE: pidusage still attempting to spawn wmic.exe');
      console.error(err.message);
      process.exit(1);
    } else {
      console.error('FAILURE: pidusage returned unexpected error:');
      console.error(err);
      process.exit(1);
    }
  } else {
    console.log('SUCCESS: pidusage resolved without wmic error');
    console.log('Stats:', JSON.stringify(stats, null, 2));
    process.exit(0);
  }
});