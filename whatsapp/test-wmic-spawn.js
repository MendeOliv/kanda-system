const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

// Add shim directory to PATH before spawning
const shimDir = 'C:\\Users\\UTILIZADOR\\AppData\\Local\\Temp\\wmic_shim';
process.env.PATH = shimDir + path.delimiter + process.env.PATH;

console.log('PATH:', process.env.PATH);

spawn('wmic', ['PROCESS', 'GET', 'Name,ProcessId,ParentProcessId,Status'], { windowsHide: true, windowsVerbatimArguments: true }, (err, stdout, stderr) => {
  if (err) {
    console.error('Spawn error:', err);
    return;
  }
  console.log('stdout:', stdout);
  console.log('stderr:', stderr);
});