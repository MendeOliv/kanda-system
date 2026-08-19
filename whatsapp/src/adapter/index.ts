// This file will set up the adapter that listens to WhatsApp events and forwards them to the backend.
// For now, we only log messages locally.

import { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason, isJidBroadcast } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import config from '../config';
import logger from '../logger';

// Define the DTO for a normalized WhatsApp message
export interface WhatsAppIncomingMessage {
  externalMessageId: string;
  from: string; // format: user@c.us or group@g.us
  to?: string; // format: user@c.us or group@g.us (the recipient, usually our own number)
  body: string; // only for text messages, else empty string
  timestamp: number; // UNIX timestamp in milliseconds (as per OpenWA)
  type:
    | 'text'
    | 'image'
    | 'video'
    | 'audio'
    | 'document'
    | 'sticker'
    | 'location'
    | 'contact'
    | 'unknown';
  mediaUrl?: string; // URL to media if available, else undefined
  caption?: string; // caption for media, else undefined
  forwarded?: boolean; // if the message was forwarded
  fromMe?: boolean; // if the message was sent by the host account (our number)
}

/**
 * Normalizes a raw WhatsApp message object from Baileys into our internal DTO.
 * @param message The raw message object from Baileys
 * @returns Normalized message DTO
 */
export function normalizeWhatsAppMessage(message: any): WhatsAppIncomingMessage {
  // Extract basic fields
  const externalMessageId = message.key?.id ?? '';
  const from = message.key?.remoteJid ?? '';
  const to = message.key?.participant ?? message.key?.remoteJid ?? undefined; // participant is for group messages, but to is usually our own number; we'll approximate
  const timestamp = message.messageTimestamp ?? Date.now();
  const typeRaw = message.message ?? {}; // We'll check which property exists

  // Map Baileys message types to our string union
  let type: WhatsAppIncomingMessage['type'] = 'unknown';
  let mediaUrl: string | undefined;
  let caption: string | undefined;

  if (message.message?.conversation) {
    type = 'text';
  } else if (message.message?.imageMessage) {
    type = 'image';
    mediaUrl = message.message.imageMessage.url ?? undefined;
    caption = message.message.imageMessage.caption ?? undefined;
  } else if (message.message?.videoMessage) {
    type = 'video';
    mediaUrl = message.message.videoMessage.url ?? undefined;
    caption = message.message.videoMessage.caption ?? undefined;
  } else if (message.message?.audioMessage) {
    type = 'audio';
    mediaUrl = message.message.audioMessage.url ?? undefined;
  } else if (message.message?.documentMessage) {
    type = 'document';
    mediaUrl = message.message.documentMessage.url ?? undefined;
    caption = message.message.documentMessage.caption ?? undefined;
  } else if (message.message?.stickerMessage) {
    type = 'sticker';
    mediaUrl = message.message.stickerMessage.url ?? undefined;
  } else if (message.message?.locationMessage) {
    type = 'location';
    mediaUrl = message.message.locationMessage.url ?? undefined;
    caption = message.message.locationMessage?.name ?? undefined;
  } else if (message.message?.contactMessage) {
    type = 'contact';
    // contact message doesn't have mediaUrl
  }

  const forwarded = message.message?.ephemeralMessageTemplate?.forwarded ?? false;
  const fromMe = message.key?.fromMe ?? false;

  return {
    externalMessageId,
    from,
    to,
    body: type === 'text' ? (message.message?.conversation ?? '') : '',
    timestamp,
    type,
    mediaUrl,
    caption,
    forwarded,
    fromMe,
  };
}

// Global state
let sock: any = null;
let isConnecting = false;

/**
 * Start the WhatsApp client using Baileys for the adapter
 */
export const startWhatsAppAdapter = async (): Promise<any> => {
  if (sock) {
    console.log('[ADAPTER] Client already running');
    return sock;
  }

  if (isConnecting) {
    console.log('[ADAPTER] Connection already in progress...');
    // Wait for connection to complete
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (sock) {
          clearInterval(checkInterval);
          resolve(sock);
        }
      }, 500);
      setTimeout(() => clearInterval(checkInterval), 60000);
    });
  }

  isConnecting = true;
  console.log('[ADAPTER] Starting WhatsApp adapter...');

  try {
    const authDir = 'auth_info_baileys_adapter';
    const { state, saveCreds } = await useMultiFileAuthState(authDir);
    const { version } = await fetchLatestBaileysVersion();

    console.log('[ADAPTER] Using Baileys version:', version.join('.'));

    sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: true,
      logger: undefined,
      browser: ['Ubuntu', 'Chrome', '121.0.0.0'],
      syncFullHistory: false,
      markOnlineOnConnect: true,
      generateHighQualityLinkPreview: false,
      shouldSyncHistoryMessage: () => false,
    });

    // Handle credentials update
    sock.ev.on('creds.update', saveCreds);

    // Handle connection updates
    sock.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        console.log('[ADAPTER QR] QR code received, scan to connect');
        // QR is available - display it
      }

      if (connection === 'close') {
        const shouldReconnect =
          (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

        console.log('[ADAPTER] Connection closed:', lastDisconnect?.error);

        if (shouldReconnect) {
          console.log('[ADAPTER] Reconnecting...');
          isConnecting = false;
          sock = null;
          await new Promise((r) => setTimeout(r, 3000));
          return startWhatsAppAdapter();
        } else {
          console.log('[ADAPTER] Logged out');
          sock = null;
          isConnecting = false;
        }
      }

      if (connection === 'connecting') {
        console.log('[ADAPTER] Connecting...');
      }

      if (connection === 'open') {
        console.log('[ADAPTER] Authenticated and connected');
      }
    });

    // Handle incoming messages
    sock.ev.on('messages.upsert', async (m: any) => {
      try {
        for (const msg of m.messages) {
          if (!msg.message) continue;

          const normalized = normalizeWhatsAppMessage(msg);
          console.log(`[ADAPTER] Received message: ${JSON.stringify(normalized)}`);
          // Here you could forward to backend via HTTP or other means
          // For now, just log
        }
      } catch (err) {
        console.error('[ADAPTER] Error processing message:', err);
        logger.error({ msg: '[ADAPTER] Error processing message', err });
      }
    });

    console.log('[ADAPTER] Client initialized, waiting for connection...');
    return sock;
  } catch (err) {
    console.error('[ADAPTER] Error starting client:', err);
    logger.error({ msg: '[ADAPTER] Error starting client', err });
    isConnecting = false;
    sock = null;
    throw err;
  }
};

/**
 * Get the current client
 */
export const getAdapterClient = (): any => {
  return sock;
};

/**
 * Destroy the WhatsApp client
 */
export const destroyWhatsAppAdapter = async (): Promise<void> => {
  if (!sock) {
    return;
  }

  try {
    await sock.end();
    sock = null;
    console.log('[ADAPTER] Client destroyed');
  } catch (err) {
    console.error('[ADAPTER] Error destroying client:', err);
    logger.error({ msg: '[ADAPTER] Error destroying client', err });
  }
};

export default {
  startWhatsAppAdapter,
  getAdapterClient,
  destroyWhatsAppAdapter,
};