import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

interface Config {
  port: number;
  host: string;
  sessionDir: string;
  qrCodeOutput: string;
  waWebVersion: number;
  authDir: string;
  phoneNumber?: string;
  backendUrl: string;
  backendApiToken: string;
  logLevel: string;
}

/**
 * Resolve the Baileys persistable auth directory.
 *
 * Priority:
 *   1. BAILEYS_AUTH_DIR env var (must point to the Railway Volume mount in prod)
 *   2. Local fallback: <cwd>/auth_info_baileys
 *
 * Path resolution is centralized here so the engine does not duplicate it.
 */
const resolveAuthDir = (): string => {
  const fromEnv = process.env.BAILEYS_AUTH_DIR;
  if (fromEnv) {
    return path.resolve(process.cwd(), fromEnv);
  }
  return path.resolve(process.cwd(), 'auth_info_baileys');
};

// WhatsApp pairing number: international format, digits only (e.g. 2449XXXXXXXX).
// No '+', spaces, parentheses or dashes. Never logged or hardcoded.
const PHONE_NUMBER_PATTERN = /^[1-9]\d{7,14}$/;

const isValidPhoneNumberFormat = (value: string): boolean => PHONE_NUMBER_PATTERN.test(value);

// Trim accidental whitespace only; never transform the value.
const trimmedPhoneNumber = process.env.PHONE_NUMBER?.trim() ?? '';
const phoneNumber = trimmedPhoneNumber !== '' ? trimmedPhoneNumber : undefined;

if (phoneNumber && !isValidPhoneNumberFormat(phoneNumber)) {
  console.error(
    '[WA PAIRING] Invalid PHONE_NUMBER format: use international format, digits only (e.g. 2449XXXXXXXX). No +, spaces, parentheses or dashes.'
  );
}

const config: Config = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  host: process.env.HOST ?? '0.0.0.0',
  sessionDir: process.env.SESSION_DIR ?? './session',
  qrCodeOutput: process.env.QR_CODE_OUTPUT ?? 'terminal',
  waWebVersion: parseInt(process.env.WA_WEB_VERSION ?? '2', 10),
  authDir: resolveAuthDir(),
  phoneNumber,
  backendUrl: process.env.BACKEND_URL ?? 'http://localhost:3001',
  backendApiToken: process.env.BACKEND_API_TOKEN ?? 'change-me',
  logLevel: process.env.LOG_LEVEL ?? 'info',
};

/**
 * Returns the configured pairing phone number only when it is set AND valid.
 * The number is never logged or exposed by the application.
 */
export function getPairingPhoneNumber(): string | undefined {
  if (!phoneNumber || !isValidPhoneNumberFormat(phoneNumber)) {
    return undefined;
  }
  return phoneNumber;
}

export default config;
