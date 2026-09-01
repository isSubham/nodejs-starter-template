import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import { env } from './config/env';
import { setupSwagger } from './config/swagger';
import { corsMiddleware } from './middlewares/cors.middleware';
import { rateLimiter } from './middlewares/rateLimiter.middleware';
import { requestIdMiddleware } from './middlewares/requestId.middleware';
import { requestLogger } from './lib/logger/requestLogger';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import apiRoutes from './routes';

/**
 * Creates and configures the Express application.
 * Exported separately so tests can import without starting the server.
 */
export function createApp() {
  const app = express();

  // ─── Security Headers ─────────────────────────────────────────────────────
  app.use(helmet());
  app.use(corsMiddleware);
  app.options('*', corsMiddleware); // pre-flight

  // ─── Request Utilities ────────────────────────────────────────────────────
  app.use(requestIdMiddleware);
  app.use(requestLogger);
  app.use(rateLimiter);

  // ─── Body Parsing ─────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  app.use(compression());

  // ─── API Routes ───────────────────────────────────────────────────────────
  app.use(env.API_PREFIX, apiRoutes);

  // ─── Swagger Docs ─────────────────────────────────────────────────────────
  if (env.NODE_ENV !== 'production') {
    setupSwagger(app);
  }

  // ─── Error Handling ───────────────────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
