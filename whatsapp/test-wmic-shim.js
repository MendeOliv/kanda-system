const { spawnSync } = require('child_process');
const path = require('path');
const os = require('os');

// Add shim directory to PATH
const shimDir = 'C:\\Users\\UTILIZADOR\\AppData\\Local\\Temp\\wmic_shim';
const env = { ...process.env, PATH: shimDir + path.delimiter + process.env.PATH };

console.log('Testing wmic with shim in PATH...');
console.log('SHIM DIR:', shimDir);
console.log('PATH (first 300 chars):', env.PATH.substring(0, 300));

// Try to run wmic with the same arguments that pidusage uses
const result = spawnSync('wmic', ['PROCESS', 'GET', 'Name,ProcessId,ParentProcessId,Status'], { 
  env: env,
  windowsHide: true,
  windowsVerbatimArguments: true,
  encoding: 'buffer' // to avoid encoding issues
});

if (result.error) {
  console.error('Failed to spawn wmic:', result.error);
  process.exit(1);
}

console.log('Exit code:', result.status);
console.log('stdout:', result.stdout.toString());
console.log('stderr:', result.stderr.toString());

// Check if we got the expected output (at least two lines and the second line has 6 tokens)
const lines = result.stdout.toString().trim().split(/\r?\n/);
if (lines.length < 2) {
  console.error('ERROR: Expected at least two lines (header and data), got:', lines.length);
  process.exit(1);
}

const header = lines[0].trim().split(/\s+/);
const dataLine = lines[1].trim().split(/\s+/);

if (header.length !== 6) {
  console.error('ERROR: Header does not have 6 tokens. Header:', header);
  process.exit(1);
}

if (dataLine.length !== 6) {
  console.error('ERROR: Data line does not have 6 tokens. Data line:', dataLine);
  process.exit(1);
}

console.log('SUCCESS: wmic shim returned expected format.');
console.log('Header:', header);
console.log('Data:', dataLine);
process.exit(0);