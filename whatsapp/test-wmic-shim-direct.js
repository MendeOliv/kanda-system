const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

// Use absolute path to shim
const shimPath = 'C:\\Users\\UTILIZADOR\\AppData\\Local\\Temp\\wmic_shim\\wmic.cmd';
console.log('Shim path:', shimPath);

spawn(shimPath, ['PROCESS', 'GET', 'Name,ProcessId,ParentProcessId,Status'], { windowsHide: true, windowsVerbatimArguments: true }, (err, stdout, stderr) => {
  if (err) {
    console.error('Spawn error:', err);
    return;
  }
  console.log('stdout:', stdout);
  console.log('stderr:', stderr);
});