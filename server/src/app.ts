import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import problemRoutes from './routes/problemRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import plannerRoutes from './routes/plannerRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp(): Express {
  const app = express();

  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

  // Middleware
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: false,
  }));
  app.use(express.json({ limit: '100kb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Track My DSA API',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API modules
  app.use('/api/auth', authRoutes);
  app.use('/api/problems', problemRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/planner', plannerRoutes);

  app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
  });

  // Centralized error handling middleware
  app.use(errorHandler);

  return app;
}

export default createApp();
