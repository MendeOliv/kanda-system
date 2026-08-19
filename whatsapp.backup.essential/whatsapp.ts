// ============ DEBUG LOGGING FOR IMPORTS ============
console.log('[DEBUG WHATSAPP] Module loading started');

// Set env vars
process.env.PIDUSAGE_NO_WMIC = '1';
process.env.PIDUSAGE_USE_PS = 'true';

// File write for debug
const fs = require('fs');
fs.appendFileSync('debug.log', 'whatsapp.ts: module loading\\n');

// NOW import @open-wa/wa-automate
console.log('[DEBUG WHATSAPP] About to import @open-wa/wa-automate...');
import { Client, create, ev } from '@open-wa/wa-automate';
console.log('[DEBUG WHATSAPP] @open-wa/wa-automate imported successfully');

console.log('[DEBUG WHATSAPP] About to import config...');
import config from '../config';
console.log('[DEBUG WHATSAPP] Config imported successfully');

console.log('[DEBUG WHATSAPP] About to import ensureSessionDir...');
import { ensureSessionDir } from '../session';
console.log('[DEBUG WHATSAPP] ensureSessionDir imported successfully');

console.log('[DEBUG WHATSAPP] About to import logger...');
import logger from '../logger';
console.log('[DEBUG WHATSAPP] logger imported successfully');

console.log('[DEBUG WHATSAPP] All imports complete');

// ============ REST OF FILE ============
let clientInstance: Client | null = null;
let originalCwd: string;
let whatsappStatus: string = 'UNKNOWN';

/**
 * Initializes the WhatsApp client.
 * @returns Promise that resolves with the Client instance.
 */
export const initializeWhatsAppClient = async (): Promise<Client> => {
  if (clientInstance) {
    return clientInstance;
  }

  // We are not calling create here because we don't want to automatically connect.
  // Instead, we will have a separate function to start the client.
  // For now, we throw an error to indicate that the client is not initialized.
  throw new Error('WhatsApp client not started. Use startWhatsAppClient to begin connection.');
};

/**
 * Starts the WhatsApp client connection (will show QR code in terminal or as configured).
 * @returns Promise that resolves with the Client instance.
 */
export const startWhatsAppClient = async (): Promise<Client> => {
  if (clientInstance) {
    return clientInstance;
  }

  // Ensure session directory exists
  const sessionDir = ensureSessionDir();

  // Save current working directory and change to sessionDir so that the session folder is created inside it
  originalCwd = process.cwd();
  try {
    process.chdir(sessionDir);
  } catch (err) {
    logger.error({ msg: 'Failed to change working directory to session dir', err });
    // Continue anyway; the library may still work but session may be elsewhere
  }

  // Log the environment variable again to see if it's still set
  fs.appendFileSync('debug.log', 'In startWhatsAppClient, PIDUSAGE_NO_WMIC: ' + process.env.PIDUSAGE_NO_WMIC + '\\n');

  const createOptions = {
        sessionId: 'kanda-session',
        qrTerminal: config.qrCodeOutput === 'terminal',
        restartOnCrash: true,
        headless: false,                    // ← MUDOU para false (mostra o navegador)
        executablePath: 'C:\\\\\\\\Program Files\\\\\\\\Google\\\\\\\\Chrome\\\\\\\\Application\\\\\\\\chrome.exe',
        useChrome: true,
        // TEST: Disable strict sandbox to see if it's a network issue
        args: [
          '--disable-blink-features=AutomationControlled',
          '--disable-features=IsolateOrigins',
        ],
        multiDevice: false,                 // ← ADD: disable multi-device
        autoRefresh: true,                  // ← ADD: auto-refresh da página
        qrRefreshS: 20,                     // ← ADD: refresh QR a cada 20s
        timeout: 60000,                     // ← ADD: increase timeout to 60s
      };

  logger.debug({ msg: 'WhatsApp createOptions', options: createOptions });

  // We'll create the client
  clientInstance = await create(createOptions);

  // Restore original working directory
  try {
    process.chdir(originalCwd);
  } catch (err) {
    logger.error({ msg: 'Failed to restore original working directory', err });
  }

  // Set up listeners for logging and debugging
  setupClientListeners(clientInstance);

  // We'll return the client
  return clientInstance;
};

/**
 * Sets up useful listeners on the WhatsApp client for logging and debugging.
 * @param client The WhatsApp client instance.
 */
function setupClientListeners(client: Client): void {
  // Connection state via client method
  client.onStateChanged((state) => {
    whatsappStatus = state;
    logger.info({ msg: '[WA State]', state });
  });

  // QR code via global event emitter
  ev.on('qr.**', (qr) => {
    // Optional: log that QR code is available (do not print the whole QR to avoid spam)
    logger.info({ msg: '[WA QR] QR code received, scan to connect' });
  });

  // Authenticated via global event emitter
  ev.on('authenticated.**', (session) => {
    logger.info({ msg: '[WA Authenticated]', session: { ...session } }); // Avoid logging sensitive data
  });

  // Disconnected via global event emitter
  ev.on('disconnected.**', (reason) => {
    logger.warn({ msg: '[WA Disconnected]', reason });
    // Attempt to reconnect? The library handles restartOnCrash, but we can also try to reconnect.
    // We'll just log; the library will try to reconnect based on restartOnCrash.
  });
}

/**
 * Returns the current client instance if initialized.
 */
export const getClient = (): Client | null => {
  return clientInstance;
};

/**
 * Returns the current WhatsApp connection status.
 */
export const getWhatsAppStatus = (): string => {
  return whatsappStatus;
};

/**
 * Gracefully destroys the WhatsApp client session.
 * Should be called before process exit.
 */
export const destroyWhatsAppClient = async (): Promise<void> => {
  if (!clientInstance) {
    return;
  }
  try {
    // The library provides a destroy method? Let's check.
    // We'll try to call clientInstance.destroy() if exists.
    if (typeof (clientInstance as any).destroy === 'function') {
      await (clientInstance as any).destroy();
    } else {
      // If no destroy method, we can try to kill the process? Not needed.
      logger.info({ msg: '[WA Destroy] No destroy method found; client will be garbage collected.' });
    }
  } catch (err) {
    logger.error({ msg: '[WA Destroy] Error destroying client', err });
  } finally {
    clientInstance = null;
    whatsappStatus = 'UNKNOWN';
  }
};

export default {
  initializeWhatsAppClient,
  startWhatsAppClient,
  getClient,
  getWhatsAppStatus,
  destroyWhatsAppClient,
};