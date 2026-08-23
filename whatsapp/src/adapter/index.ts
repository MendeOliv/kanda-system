// This file will set up the adapter that listens to WhatsApp events and forwards them to the backend.
// For now, we only log messages locally.

import { startWhatsAppClient, getClient, destroyWhatsAppClient } from '../engine/whatsapp';
import { Boom } from '@hapi/boom';
import config from '../config';
import axios from 'axios';
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

// Global state to avoid attaching listeners multiple times
let _listenersAttached = false;

/**
 * Attach listeners to the engine's WhatsApp client.
 */
function attachListeners(): void {
  const client = getClient();
  if (!client) {
    console.log('[ADAPTER] WhatsApp client not available yet');
    return;
  }

  // Handle connection updates
  client.ev.on('connection.update', async (update: any) => {
    const { connection, lastDisconnect, qr, pairingCode } = update;

    // NEW: Handle pairing code (Baileys 7.0+)
    if (pairingCode) {
      console.log('[ADAPTER] Pairing code (enter on WhatsApp):');
      console.log(pairingCode);
      console.log('[ADAPTER] Open WhatsApp → Settings → Linked Devices → Link a Device → type this code');
    } else if (qr) {
      console.log('[ADAPTER QR] QR code received, scan to connect');
      // QR is available - display it
    }

    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assumption
        (require('@whiskeysockets/baileys').DisconnectReason.loggedOut as any); // Avoid importing DisconnectReason here
      console.log('[ADAPTER] Connection closed:', lastDisconnect?.error);

      if (shouldReconnect) {
        console.log('[ADAPTER] Reconnecting...');
        // Reconnection is handled by the engine; we just wait for it.
        // Optionally, we could trigger a restart, but engine already does.
      } else {
        console.log('[ADAPTER] Logged out');
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
  client.ev.on('messages.upsert', async (m: any) => {
    try {
      const botJid = client?.user?.id ?? '';
      for (const msg of m.messages) {
        if (!msg.message) continue;

        // Check if it's a broadcast/status message
        const fromJid = msg.key?.remoteJid ?? '';
        if (fromJid.endsWith('@broadcast')) {
          console.log('[ADAPTER] Ignoring broadcast message');
          continue;
        }

        const normalized = normalizeWhatsAppMessage(msg);
        // Ignore messages sent by ourselves to prevent loops
        if (normalized.fromMe) {
          console.log('[ADAPTER] Ignoring message from self');
          continue;
        }
        // Override the 'to' field with the bot's own JID
        normalized.to = botJid;

        console.log(`[ADAPTER] Received message: ${JSON.stringify(normalized)}`);
        // Forward normalized message to backend via HTTP
        try {
          await axios.post(`${config.backendUrl}/api/whatsapp/message`, normalized);
          logger.info({ msg: '[ADAPTER] Message forwarded to backend', externalMessageId: normalized.externalMessageId });
        } catch (httpError: any) {
          logger.error({ msg: '[ADAPTER] Failed to forward message to backend', error: httpError.message, externalMessageId: normalized.externalMessageId });
          // Don't re-throw - we don't want WhatsApp process to crash if backend is down
        }
      }
    } catch (err) {
      console.error('[ADAPTER] Error processing message:', err);
      logger.error({ msg: '[ADAPTER] Error processing message', err });
    }
  });
}

/**
 * Start the WhatsApp client using Baileys (delegates to engine).
 */
export const startWhatsAppAdapter = async (): Promise<any> => {
  await startWhatsAppClient(); // Ensure the engine client is started
  if (!_listenersAttached) {
    attachListeners();
    _listenersAttached = true;
  }
  return getClient();
};

/**
 * Get the current client
 */
export const getAdapterClient = (): any => {
  return getClient();
};

/**
 * Destroy the WhatsApp client
 */
export const destroyWhatsAppAdapter = async (): Promise<void> => {
  await destroyWhatsAppClient();
};

export default {
  startWhatsAppAdapter,
  getAdapterClient,
  destroyWhatsAppAdapter,
};