import pino from 'pino';
import config from './config';

// Create a logger instance that respects LOG_LEVEL from config
const logger = pino({
  level: config.logLevel,
});

export default logger;