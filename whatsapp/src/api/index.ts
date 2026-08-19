import express, { Request, Response, NextFunction } from 'express';
import pino from 'pino-http';
import config from '../config';

// Initialize express app
const app = express();

// Set up pino logger
app.use(pino({
  level: config.logLevel,
}));

// Health check endpoint with lazy-loaded WhatsApp status
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Lazy-load the engine only when needed
    const { getWhatsAppStatus } = await import('../engine/whatsapp');
    
    res.status(200).json({
      status: 'ok',
      whatsapp: getWhatsAppStatus(),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // If engine hasn't loaded yet, return UNKNOWN
    res.status(200).json({
      status: 'ok',
      whatsapp: 'UNKNOWN',
      timestamp: new Date().toISOString(),
    });
  }
});

// 404 handler
app.use((req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ error: 'Internal server error' });
});

export default app;