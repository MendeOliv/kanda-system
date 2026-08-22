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
      shouldSyncHistoryMessage: () => false,
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
        console.log('[WA QR] Scan the QR code below to connect:');
        const qrcode = require('qrcode-terminal');
        qrcode.generate(qr, { small: true });
      }
  
      if (connection === 'close') {
        const shouldReconnect =
          (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

        console.log('[BAILEYS] Connection closed:', lastDisconnect?.error);

        if (shouldReconnect) {
          console.log('[BAILEYS] Reconnecting...');
          isConnecting = false;
          sock = null;
          await new Promise((r) => setTimeout(r, 3000));
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
        console.log('[WA Authenticated]');
        console.log('[WA State]: CONNECTED');
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