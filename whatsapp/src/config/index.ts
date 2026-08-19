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
  backendUrl: string;
  backendApiToken: string;
  logLevel: string;
}

const config: Config = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  host: process.env.HOST ?? '0.0.0.0',
  sessionDir: process.env.SESSION_DIR ?? './session',
  qrCodeOutput: process.env.QR_CODE_OUTPUT ?? 'terminal',
  waWebVersion: parseInt(process.env.WA_WEB_VERSION ?? '2', 10),
  backendUrl: process.env.BACKEND_URL ?? 'http://localhost:3001',
  backendApiToken: process.env.BACKEND_API_TOKEN ?? 'change-me',
  logLevel: process.env.LOG_LEVEL ?? 'info',
};

export default config;