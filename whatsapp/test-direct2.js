const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason, isJidBroadcast } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');

// Global state for this test
let sock = null;
let whatsappStatus = 'UNKNOWN';
let isConnecting = false;

// Create a logger that matches Baileys' expectations
const baileysLogger = {
  trace: (...args) => console.trace(...args),
  debug: (...args) => console.debug(...args),
  info: (...args) => console.info(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
  child: () => baileysLogger, // child logger returns itself
};

// Ensure auth directory exists
function ensureAuthDir() {
  const authDir = path.join(process.cwd(), 'auth_info_baileys');
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
    console.log('[BAILEYS] Auth directory created:', authDir);
  }
  return authDir;
}

// Start the WhatsApp client using Baileys
async function startWhatsAppClient() {
  if (sock) {
    console.log('[BAILEYS] Client already running');
    return sock;
  }

  if (isConnecting) {
    console.log('[BAILEYS] Connection already in progress...');
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (sock && whatsappStatus === 'CONNECTED') {
          clearInterval(checkInterval);
          resolve(sock);
        }
      }, 500);
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
      printQRInTerminal: false,
      logger: baileysLogger,
      browser: ['Ubuntu', 'Chrome', '121.0.0.0'],
      syncFullHistory: false,
      markOnlineOnConnect: true,
      generateHighQualityLinkPreview: false,
      shouldSyncHistoryMessage: () => false,
      qrTimeout: 60000,
    });

    // Handle credentials update
    sock.ev.on('creds.update', saveCreds);

    // Handle connection updates
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr, pairingCode } = update;

      if (pairingCode) {
        console.log('[WA PAIRING] Pairing code (enter on WhatsApp):');
        console.log(pairingCode);
        console.log('[WA PAIRING] Open WhatsApp → Settings → Linked Devices → Link a Device → type this code');
      } else if (qr) {
        const qrcode = require('qrcode-terminal');
        qrcode.generate(qr, { small: true });
      }

      if (connection === 'close') {
        let shouldReconnect = true;
        if (lastDisconnect && lastDisconnect.error) {
          // lastDisconnect.error might be a Boom object
          if (lastDisconnect.error.output && lastDisconnect.error.output.statusCode !== undefined) {
            shouldReconnect = lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
          }
        }
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

    // Handle incoming messages (for logging and to detect updates)
    sock.ev.on('messages.upsert', async (m) => {
      try {
        for (const msg of m.messages) {
          if (!msg.message) continue;

          const fromJid = msg.key.remoteJid;
          const isGroup = fromJid && typeof fromJid === 'string' && fromJid.endsWith('@g.us');
          const isStatus = isJidBroadcast(fromJid);

          if (isStatus) continue;

          const text = msg.message.conversation || (msg.message.extendedTextMessage && msg.message.extendedTextMessage.text) || '';

          if (!text) continue;

          console.log(`[WA Message] from: ${fromJid} body: ${text} externalMessageId: ${msg.key.id}`);

          // Check if this is an update for our sent message
          if (sentMessageId && msg.key.id === sentMessageId) {
            console.log(`[DEBUG] Found update for our message:`, msg);
            updateFound = true;
            updateData = msg;
          }
        }
      } catch (err) {
        console.error('[BAILEYS] Error processing message:', err);
      }
    });

    console.log('[BAILEYS] Client initialized, waiting for connection...');
    return sock;
  } catch (err) {
    console.error('[BAILEYS] Error starting client:', err);
    isConnecting = false;
    sock = null;
    throw err;
  }
}

// Function to send a message using the socket
async function sendMessageDirect(jid, text) {
  if (!sock || whatsappStatus !== 'CONNECTED') {
    throw new Error('WhatsApp client not connected');
  }

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
    return result;
  } catch (err) {
    console.error('[BAILEYS] Error sending message:', err);
    throw err;
  }
}

// Main test
(async () => {
  console.log('=== WA-03 BAILEYS DIRECT DELIVERY ISOLATION ===');

  // Phase 1: Baileys version
  const { version } = await fetchLatestBaileysVersion();
  console.log(`BAILEYS VERSION: ${version.join('.')}`);

  // Start the client
  await startWhatsAppClient();

  // Wait a bit for connection to be fully established
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Phase 2: Destination resolution
  const phoneNumber = '244924907220';
  console.log(`\nDESTINATION RESOLUTION:`);
  console.log(`Testing resolution for: ${phoneNumber}`);

  let resolutionResult = 'UNKNOWN';
  let resolvedJid = null;
  let lid = null;

  // Check if onWhatsApp is available (it is in the socket instance)
  if (typeof sock.onWhatsApp === 'function') {
    try {
      const result = await sock.onWhatsApp(phoneNumber);
      console.log(`onWhatsApp result:`, JSON.stringify(result));
      if (Array.isArray(result) && result.length > 0) {
        const first = result[0];
        if (first.jid) {
          resolvedJid = first.jid;
          // Check if it's a LID
          if (typeof resolvedJid === 'string' && resolvedJid.endsWith('@lid')) {
            lid = resolvedJid;
          } else {
            // Assume it's a regular JID
            // Extract phone number from JID if needed
            const phoneMatch = typeof resolvedJid === 'string' && resolvedJid.match(/^(\d+)@/);
            if (phoneMatch) {
              // It's a regular JID
            }
          }
          resolutionResult = 'SUCCESS';
        } else {
          resolutionResult = 'FAIL_NO_JID';
        }
      } else {
        resolutionResult = 'FAIL_EMPTY';
      }
    } catch (err) {
      console.error(`Error during onWhatsApp:`, err);
      resolutionResult = 'FAIL_ERROR';
    }
  } else {
    console.log('onWhatsApp not available, falling back to manual JID construction');
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned) {
      resolvedJid = `${cleaned}@s.whatsapp.net`;
      resolutionResult = 'SUCCESS_MANUAL';
    } else {
      resolutionResult = 'FAIL_INVALID_NUMBER';
    }
  }

  console.log(`RESULT: ${resolutionResult}`);
  const phoneJid = `${phoneNumber.replace(/\D/g, '')}@s.whatsapp.net`;
  console.log(`PHONE JID: ${phoneJid}`);
  console.log(`LID: ${lid || 'null'}`);
  console.log(`RESOLVED JID: ${resolvedJid || 'null'}`);

  // If resolution failed, we cannot proceed
  if (resolutionResult.startsWith('FAIL')) {
    console.log(`\nDESTINATION RESOLUTION = FAIL`);
    // We'll still try to send to the manually constructed JID as a fallback? But user said not to assume.
    // We'll exit.
    process.exit(1);
  } else {
    console.log(`\nDESTINATION RESOLUTION = PASS`);
  }

  // Use the resolved JID for sending, or fallback to manual if resolution didn't give a JID but we have manual
  const targetJid = resolvedJid || `${phoneNumber.replace(/\D/g, '')}@s.whatsapp.net`;

  // Phase 4: Direct Baileys send
  console.log(`\nDIRECT BAILEYS SEND:`);
  const testMessage = 'Kanda WA-03 DIRECT BAILEYS TEST';
  let sendResult = 'UNKNOWN';
  let messageId = null;
  let returnObject = null;
  let error = null;

  // We'll listen for updates to our message
  let updateFound = false;
  let updateData = null;
  // Store the sent message ID globally for the update handler
  sentMessageId = null;

  try {
    const result = await sendMessageDirect(targetJid, testMessage);
    sendResult = 'SUCCESS';
    messageId = result.key.id;
    returnObject = result;
    sentMessageId = messageId; // Set global for update handler
    console.log(`MESSAGE ID: ${messageId}`);
    console.log(`REMOTE JID: ${result.key.remoteJid}`);
    console.log(`RETURN OBJECT:`, JSON.stringify(result));
  } catch (err) {
    sendResult = 'FAIL';
    error = err;
    console.error(`ERROR:`, err);
  }

  // Wait a bit to see if we get any updates
  await new Promise((resolve) => setTimeout(resolve, 10000));

  // Phase 5: Observe ACK/UPDATE
  console.log(`\nMESSAGE UPDATE:`);
  console.log(`FOUND: ${updateFound ? 'YES' : 'NO'}`);
  if (updateFound) {
    console.log(`ACK: ${updateData && updateData.key && updateData.key.fromMe ? 'FROM_ME' : 'OTHER'}`);
    // The update object contains the status? We can look at the updateData
    // But for simplicity, we note that we found an update.
    // In a real scenario, we would look at the status in the update.
    // However, the user only asked to register if we found an update and what the ACK/status was.
    // We'll try to extract the status if available.
    const status = updateData && updateData.message && updateData.message.status; // This might not be the right path, but we try.
    console.log(`STATUS: ${status || 'unknown'}`);
  } else {
    console.log(`ACK: NONE`);
    console.log(`STATUS: NONE`);
  }

  // Phase 6: Physical phone check (we have to ask the user, but we can't automate)
  // We'll leave this as UNKNOWN and rely on the user to check.
  // However, the user said: "O teste só é considerado delivery se o meu telefone realmente receber a mensagem."
  // We cannot automate that, so we will leave it to the user to report.
  // But for the purpose of this script, we will output a placeholder and then the user can update.
  console.log(`\nPHYSICAL PHONE:`);
  console.log(`RECEIVED = UNKNOWN (MANUAL CHECK REQUIRED)`);

  // We'll output the isolation result based on what we know so far.
  // We know from previous logs that the backend path sends but no physical delivery.
  // We will wait for the user to confirm physical receipt.

  // For now, we'll set a flag that we can update later.
  // We'll write the results to a file so the user can see and then we can adjust.

  // Let's output the results in the required format.

  console.log(`\nISOLATION RESULT:`);
  console.log(`BACKEND PATH = FAIL (from previous logs: message sent but not received)`);
  console.log(`DIRECT BAILEYS = ${sendResult}`);

  // Root cause and fix will be determined after we know the physical phone result.
  // We'll leave them as UNCONFIRMED for now.

  console.log(`\nROOT CAUSE: UNCONFIRMED`);
  console.log(`FIX: NONE / REQUIRED (to be determined)`);

  console.log(`\nFINAL VERDICT:`);
  // We cannot determine the final verdict without knowing if the phone received the message.
  // We'll output BLOCKED for now, but note that if the direct send succeeded and the phone received, then it might be PASS.
  // We'll leave it to the user to update based on physical check.
  console.log(`WA-03 = BLOCKED (pending physical phone verification)`);

  // Exit
  process.exit(0);
})();