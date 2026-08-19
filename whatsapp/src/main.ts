// ============================================================================
// CHROME & WMIC SPAWN INTERCEPTION - Must be FIRST
// ============================================================================

const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id: string) {
  const module = originalRequire.apply(this, arguments);
  
  if (id === 'child_process') {
    const originalSpawn = module.spawn;
    
    module.spawn = function(command: string, args: string[], options?: any) {
      console.log(`[SPAWN INTERCEPT] Command: ${command}`);
      
      // === CHROME ARGUMENTS FILTERING ===
      if (command === 'chrome' || command === 'google-chrome' || 
          command.includes('chrome.exe') || command.endsWith('chrome')) {
        console.log('[SPAWN INTERCEPT] Intercepted Chrome spawn');
        
        // Remove --enable-automation flag that WhatsApp detects
        if (Array.isArray(args)) {
          const filteredArgs = args.filter(arg => 
            !arg.includes('--enable-automation')
          );
          
          console.log('[SPAWN INTERCEPT] Removed --enable-automation flag');
          console.log('[SPAWN INTERCEPT] Original args count:', args.length);
          console.log('[SPAWN INTERCEPT] Filtered args count:', filteredArgs.length);
          
          // Pass filtered args to original spawn
          return originalSpawn.call(this, command, filteredArgs, options);
        }
      }
      
      // === WMIC INTERCEPTION (keeps existing logic) =====
      if (command === 'wmic' || command === 'wmic.exe' || command.endsWith('wmic.exe')) {
        console.log('[SPAWN INTERCEPT] Intercepted wmic call');
        
        const { EventEmitter } = require('events');
        const fakeProcess = new EventEmitter();
        
        let response = '';
        
        if (args && args.length > 0) {
          const argsStr = args.join(' ');
          
          if (argsStr.includes('CreationDate') || argsStr.includes('KernelModeTime')) {
            response = `CreationDate KernelModeTime ParentProcessId ProcessId UserModeTime WorkingSetSize\n20250101000000.000000+000 0 0 ${process.pid} 0 1048576\n`;
            console.log('[SPAWN INTERCEPT] Responding with pidusage format');
          }
          else if (argsStr.includes('Name') || argsStr.includes('Status')) {
            response = `Name ProcessId ParentProcessId Status\nchrome.exe ${process.pid} 1234 RUNNING\n`;
            console.log('[SPAWN INTERCEPT] Responding with WhatsApp format');
          }
          else {
            response = `ProcessId ParentProcessId Status\n${process.pid} 1234 RUNNING\n`;
            console.log('[SPAWN INTERCEPT] Responding with generic format');
          }
        }
        
        fakeProcess.stdout = new (require('stream').PassThrough)();
        fakeProcess.stderr = new (require('stream').PassThrough)();
        fakeProcess.pid = process.pid;
        
        setTimeout(() => {
          fakeProcess.stdout.write(response);
          fakeProcess.stdout.end();
          fakeProcess.emit('exit', 0);
          fakeProcess.emit('close', 0);
        }, 10);
        
        return fakeProcess;
      }
      
      // For all other commands, use original spawn
      return originalSpawn.apply(this, arguments);
    };
    
    Object.keys(originalSpawn).forEach(key => {
      if (typeof originalSpawn[key] !== 'function') {
        module.spawn[key] = originalSpawn[key];
      }
    });
  }
  
  return module;
};

// ============================================================================
// END SPAWN INTERCEPTION
// ============================================================================

if (process.platform === 'win32') {
  const shimDir = 'C:\\\\\\\\Users\\\\\\\\UTILIZADOR\\\\\\\\AppData\\\\\\\\Local\\\\\\\\Temp\\\\\\\\wmic_shim';
  process.env.PATH = shimDir + ';' + process.env.PATH;
  console.log('Shim PATH set:', shimDir);
}

process.env.PIDUSAGE_USE_PS = 'true';
process.env.PIDUSAGE_NO_WMIC = '1';

// ============================================================================
// ERROR HANDLERS
// ============================================================================

console.log('[DEBUG] os.platform():', process.platform);
console.log('[DEBUG] process.pid:', process.pid);
console.log('[DEBUG] Node version:', process.version);

process.on('unhandledRejection', (reason: any, promise: any) => {
  console.error('[FATAL] Unhandled Rejection:', reason);
  if (reason instanceof Error) {
    console.error('[FATAL] Stack:', reason.stack);
  }
});

process.on('uncaughtException', (err: any) => {
  console.error('[FATAL] Uncaught Exception:', err);
  console.error('[FATAL] Stack:', err.stack);
  process.exit(1);
});

process.on('exit', (code: number) => {
  console.log('[EXIT] Process exiting with code:', code);
});

// ============================================================================
// REST OF APPLICATION - Imports and initialization
// ============================================================================

console.log('[DEBUG] About to import app...');
import app from './api';
console.log('[DEBUG] App imported.');

console.log('[DEBUG] About to import engine...');
import { startWhatsAppClient, destroyWhatsAppClient } from './engine/whatsapp';
console.log('[DEBUG] Engine imported.');

console.log('[DEBUG] About to import adapter...');
// Import the adapter to ensure it's initialized (if needed)
// We don't use it directly here, but it may have side effects
import { startWhatsAppAdapter } from './adapter';
console.log('[DEBUG] Adapter imported.');

// ============================================================================
// Initialize server and WhatsApp client
// ============================================================================

console.log('[DEBUG] Creating server...');
const port = process.env.PORT || 3000;

console.log('[DEBUG] Starting WhatsApp client...');
startWhatsAppClient()
  .then(() => {
    console.log('[DEBUG] WhatsApp client started.');
    
    console.log('[DEBUG] Starting server on port:', port);
    const server = app.listen(port, () => {
      console.log(`[OK] Server listening on port ${port}`);
      console.log('[OK] WhatsApp Adapter is ready.');
    });

    server.on('error', (err) => {
      console.error('[ERROR] Server error:', err);
    });

    process.on('SIGTERM', () => {
      console.log('[SIGNAL] SIGTERM received.');
      destroyWhatsAppClient();
    });

    process.on('SIGINT', () => {
      console.log('[SIGNAL] SIGINT received.');
      destroyWhatsAppClient();
    });
  })
  .catch((err) => {
    console.error('[FATAL] Failed to start WhatsApp client:', err);
    if (err instanceof Error) {
      console.error('[FATAL] Stack:', err.stack);
    }
    process.exit(1);
  });

console.log('[DEBUG] Main script setup complete.');

// ============================================================================
// Keep-alive signal
// ============================================================================

setInterval(() => {
  console.log('[ALIVE] Process is still running...');
}, 5000);