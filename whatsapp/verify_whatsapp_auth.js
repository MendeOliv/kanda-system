const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'engine', 'whatsapp.ts');
let content;
try {
  content = fs.readFileSync(filePath, 'utf8');
} catch (err) {
  console.error('ERROR: Cannot read file:', err.message);
  process.exit(1);
}

// Check for QR code generation
const hasQrRequire = content.includes('const qrcode = require(\'qrcode-terminal\');');
const hasQrGenerate = content.includes('qrcode.generate(qr, { small: true });');
const hasElseIfQr = content.includes('else if (qr) {');

// Check that test message block is removed
const hasTestMessage = content.includes('[TEST] Attempting to send test message');
const hasTestJid = content.includes('const testJid = \'5521999999999@s.us\'');

// Determine success
let passed = true;
let messages = [];

if (!hasQrRequire) {
  passed = false;
  messages.push('Missing QR code require statement');
}
if (!hasQrGenerate) {
  passed = false;
  messages.push('Missing QR code generation call');
}
if (!hasElseIfQr) {
  passed = false;
  messages.push('Missing else if (qr) block');
}
if (hasTestMessage) {
  passed = false;
  messages.push('Test message block still present');
}
if (hasTestJid) {
  passed = false;
  messages.push('Test JID still present');
}

if (passed) {
  console.log('SUCCESS: WhatsApp auth fix verified');
  console.log('- QR code rendering is present');
  console.log('- Test message block removed');
} else {
  console.error('FAILURE:');
  messages.forEach(m => console.error(' - ' + m));
  process.exit(1);
}
