import 'dotenv/config';
import http from 'http';
import { createApp } from './app';
import { env } from './config/env';
import { connectDB, disconnectDB } from './config/database';
import { logger } from './lib/logger/logger';

let server: http.Server;

async function start() {
  // Validate env and connect DB before accepting traffic
  await connectDB();
  logger.info('✅ Database connected');

  const app = createApp();
  server = http.createServer(app);

  server.listen(env.PORT, () => {
    logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    logger.info(`📖 API docs: http://localhost:${env.PORT}/docs`);
    logger.info(`❤️  Health: http://localhost:${env.PORT}${env.API_PREFIX}/health`);
  });

  server.on('error', (err) => {
    logger.error('Server error', { error: err });
    process.exit(1);
  });
}

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

function shutdown(signal: string): void {
  logger.info(`${signal} received — starting graceful shutdown`);

  // Stop accepting new connections
  server?.close(() => {
    logger.info('HTTP server closed');

    disconnectDB()
      .then(() => {
        logger.info('Database connection closed');
        process.exit(0);
      })
      .catch((err: unknown) => {
        logger.error('Error during shutdown', { error: err });
        process.exit(1);
      });
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled promise rejection', { reason });
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught exception', { error });
  process.exit(1);
});

// Start
void start().catch((err: unknown) => {
  logger.error('Failed to start server', { error: err });
  process.exit(1);
});
