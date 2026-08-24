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
      
      // === CHROME ARGUMENTS FILTERING =====
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
  const shimDir = 'C:\\\\\\\\\\\\\\\\Users\\\\\\\\\\\\\\\\UTILIZADOR\\\\\\\\\\\\\\\\AppData\\\\\\\\\\\\\\\\Local\\\\\\\\\\\\\\\\Temp\\\\\\\\\\\\\\\\wmic_shim';
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
// ENGINE CODE - WhatsApp client implementation
// ============================================================================

import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  isJidBroadcast,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import logger from '../logger';
import config from '../config';
import fs from 'fs';
import path from 'path';

// Global state
let sock: any = null;
let whatsappStatus: string = 'UNKNOWN';
let isConnecting = false;

/**
 * Ensure auth directory exists
 */
function ensureAuthDir(): string {
  const authDir = path.join(process.cwd(), 'auth_info_baileys');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
    console.log('[BAILEYS] Auth directory created:', authDir);
  }
  return authDir;
}

/**
 * Clear the auth state directory (used when session is invalidated)
 */
function clearAuthState(authDir: string) {
  try {
    const files = fs.readdirSync(authDir);
    for (const file of files) {
      const filePath = path.join(authDir, file);
      fs.unlinkSync(filePath);
      console.log('[BAILEYS] Deleted auth file:', file);
    }
    console.log('[BAILEYS] Auth state cleared');
  } catch (err) {
    console.error('[BAILEYS] Error clearing auth state:', err);
  }
}

/**
 * Start the WhatsApp client using Baileys
 */
export const startWhatsAppClient = async (): Promise<any> => {
  if (sock) {
    console.log('[BAILEYS] Client already running');
    return sock;
  }

  if (isConnecting) {
    console.log('[BAILEYS] Connection already in progress...');
    // Wait for connection to complete
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (sock && whatsappStatus === 'CONNECTED') {
          clearInterval(checkInterval);
          resolve(sock);
        }
      }, 500);
      // Timeout after 60 seconds
      setTimeout(() => clearInterval(checkInterval), 60000);
    });
  }

  isConnecting = true;
  console.log('[BAILEYS] Starting WhatsApp client...');

  try {
    const authDir = ensureAuthDir();
    const { state, saveCreds } = await useMultiFileAuthState(authDir);
    console.log('[BAILEYS] Auth registered:', state.creds.registered);
    const { version } = await fetchLatestBaileysVersion();

    console.log('[BAILEYS] Using Baileys version:', version.join('.'));

    sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,  // Disable QR (use pairing code instead)
      logger,
      browser: ['Ubuntu', 'Chrome', '121.0.0.0'],
      syncFullHistory: false,
      markOnlineOnConnect: true,
      generateHighQualityLinkPreview: false,
      shouldSyncHistoryMessage: (notification) => {
        // Return true only for LID-related notifications to avoid LID mapping warning
        // while preventing full history sync
        return notification && typeof notification === 'object' && 'jid' in notification && typeof notification.jid === 'string' && notification.jid.endsWith('@lid');
      },
      qrTimeout: 60000,  // 60 second timeout
    });

    // Handle credentials update
    sock.ev.on('creds.update', saveCreds);

    // Handle connection updates
    sock.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect, qr, pairingCode } = update;

      // NEW: Handle pairing code (Baileys 7.0+)
      if (pairingCode) {
        console.log('[WA PAIRING] Pairing code (enter on WhatsApp):');
        console.log(pairingCode);
        console.log('[WA PAIRING] Open WhatsApp → Settings → Linked Devices → Link a Device → type this code');
      }
      else if (qr) {
        console.log('[WA AUTH] New authentication required');
        console.log('[WA AUTH] QR code received, rendering...');
        const qrcode = require('qrcode-terminal');
        qrcode.generate(qr, { small: true });
      }

      if (connection === 'close') {
        const isLoggedOutOrUnauthorized =
          (lastDisconnect?.error as Boom)?.output?.statusCode === DisconnectReason.loggedOut ||
          (lastDisconnect?.error as Boom)?.output?.statusCode === 401;

        if (isLoggedOutOrUnauthorized) {
          console.log('[BAILEYS] Session invalidated (401/loggedOut), clearing auth state');
          clearAuthState(ensureAuthDir());
        }

        const shouldReconnect =
          !isLoggedOutOrUnauthorized && (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

        console.log('[BAILEYS] Connection closed:', lastDisconnect?.error);

        if (shouldReconnect) {
          console.log('[BAILEYS] Reconnecting...');
          isConnecting = false;
          sock = null;
          await new Promise((r) => setTimeout(r, 1000));
          return startWhatsAppClient();
        } else {
          console.log('[BAILEYS] Logged out');
          whatsappStatus = 'DISCONNECTED';
          sock = null;
          isConnecting = false;
        }
      }

      if (connection === 'connecting') {
        console.log('[BAILEYS] Connecting...');
        whatsappStatus = 'CONNECTING';
      }

      if (connection === 'open') {
        console.log('[WA STATE] OPEN');
        console.log('[WA AUTH] Authenticated as:', sock?.user?.id ?? 'unknown');
        whatsappStatus = 'CONNECTED';
        isConnecting = false;
      }
    });

    // Handle incoming messages (optional, for logging)
    sock.ev.on('messages.upsert', async (m: any) => {
      try {
        for (const msg of m.messages) {
          if (!msg.message) continue;

          const fromJid = msg.key.remoteJid;
          const isGroup = fromJid?.endsWith('@g.us');
          const isStatus = isJidBroadcast(fromJid);

          if (isStatus) continue; // Ignore status messages

          const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

          if (!text) continue; // Ignore non-text messages for now

          console.log(`[WA Message] from: ${fromJid} body: ${text} externalMessageId: ${msg.key.id}`);

          // Log for debugging
          logger.info({
            msg: '[WA Incoming Message]',
            from: fromJid,
            text,
            timestamp: msg.messageTimestamp,
          });

          // Here you can add logic to process the message with Gemini
          // For now, just log it
        }
      } catch (err) {
        console.error('[BAILEYS] Error processing message:', err);
        logger.error({ msg: '[BAILEYS] Error processing message', err });
      }
    });

    console.log('[BAILEYS] Client initialized, waiting for connection...');
    return sock;
  } catch (err) {
    console.error('[BAILEYS] Error starting client:', err);
    logger.error({ msg: '[BAILEYS] Error starting client', err });
    isConnecting = false;
    sock = null;
    throw err;
  }
};

/**
 * Get the current client
 */
export const getClient = (): any => {
  return sock;
};

/**
 * Get WhatsApp connection status
 */
export const getWhatsAppStatus = (): string => {
  return whatsappStatus;
};

/**
 * Send a message via WhatsApp
 */
export const sendMessage = async (jid: string, text: string): Promise<void> => {
  if (!sock || whatsappStatus !== 'CONNECTED') {
    throw new Error('WhatsApp client not connected');
  }

  // Log socket state and identity for debugging
  console.log(`[DEBUG] sendMessage called: jid=${jid}, text=${text.substring(0, 50)}...`);
  console.log(`[DEBUG] sock exists: ${!!sock}`);
  if (sock) {
    console.log(`[DEBUG] sock.user: ${JSON.stringify(sock.user)}`);
    console.log(`[DEBUG] sock.connectionState: ${sock?.connection?.connection ?? 'unknown'}`);
  }

  try {
    const result = await sock.sendMessage(jid, { text });
    console.log(`[BAILEYS] Message sent to ${jid}`);
    console.log(`[DEBUG] sendMessage result: ${JSON.stringify(result)}`);
  } catch (err) {
    console.error('[BAILEYS] Error sending message:', err);
    logger.error({ msg: '[BAILEYS] Error sending message', err, jid });
    throw err;
  }
};

/**
 * Destroy the WhatsApp client
 */
export const destroyWhatsAppClient = async (): Promise<void> => {
  if (!sock) {
    return;
  }

  try {
    await sock.end();
    sock = null;
    whatsappStatus = 'UNKNOWN';
    console.log('[BAILEYS] Client destroyed');
  } catch (err) {
    console.error('[BAILEYS] Error destroying client:', err);
    logger.error({ msg: '[BAILEYS] Error destroying client', err });
  }
};

export default {
  startWhatsAppClient,
  getClient,
  getWhatsAppStatus,
  sendMessage,
  destroyWhatsAppClient,
};