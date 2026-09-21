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

const config: Config = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  host: process.env.HOST ?? '0.0.0.0',
  sessionDir: process.env.SESSION_DIR ?? './session',
  qrCodeOutput: process.env.QR_CODE_OUTPUT ?? 'terminal',
  waWebVersion: parseInt(process.env.WA_WEB_VERSION ?? '2', 10),
  authDir: resolveAuthDir(),
  backendUrl: process.env.BACKEND_URL ?? 'http://localhost:3001',
  backendApiToken: process.env.BACKEND_API_TOKEN ?? 'change-me',
  logLevel: process.env.LOG_LEVEL ?? 'info',
};

export default config;