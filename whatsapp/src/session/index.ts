import fs from 'fs';
import path from 'path';
import config from '../config';

/**
 * Ensures the session directory exists.
 * @returns The absolute path to the session directory.
 */
export const ensureSessionDir = (): string => {
  const sessionDir = path.resolve(process.cwd(), config.sessionDir);
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }
  return sessionDir;
};