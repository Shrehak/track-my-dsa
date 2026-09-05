import express, { Express } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import problemRoutes from './routes/problemRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import plannerRoutes from './routes/plannerRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(cors({
    origin: '*',
    credentials: true,
  }));
  app.use(express.json());

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

  // Centralized error handling middleware
  app.use(errorHandler);

  return app;
}

export default createApp();
