const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

// Add shim directory to PATH
const shimDir = 'C:\\Users\\UTILIZADOR\\AppData\\Local\\Temp\\wmic_shim';
const env = { ...process.env, PATH: shimDir + path.delimiter + process.env.PATH };

console.log('ENV PATH:', env.PATH);

const child = spawn('wmic', ['PROCESS', 'where', '"WHERE ProcessId=1234"', 'get', 'CreationDate,KernelModeTime,ParentProcessId,ProcessId,UserModeTime,WorkingSetSize'], { 
  env: env,
  windowsHide: true,
  windowsVerbatimArguments: true
});

let stdout = '';
let stderr = '';

child.stdout.on('data', (data) => {
  stdout += data.toString();
});

child.stderr.on('data', (data) => {
  stderr += data.toString();
});

child.on('close', (code) => {
  console.log(`Child exited with code ${code}`);
  console.log('stdout:', stdout);
  console.log('stderr:', stderr);
});

child.on('error', (err) => {
  console.error('Child process error:', err);
});