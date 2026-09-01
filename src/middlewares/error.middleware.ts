import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors/AppError';
import { sendError } from '../lib/response/response';
import { logger } from '../lib/logger/logger';

/**
 * Global error handling middleware.
 * Must have 4 parameters for Express to treat it as an error handler.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const requestId = req.requestId;

  if (error instanceof AppError && error.isOperational) {
    // Operational errors — expected, log at warn level
    logger.warn({
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      requestId,
      path: req.path,
      method: req.method,
    });
  } else {
    // Programming errors or unknown — log at error level with full stack
    logger.error({
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      requestId,
      path: req.path,
      method: req.method,
    });
  }

  sendError(res, error);
}

/**
 * 404 handler for unmatched routes.
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 'NOT_FOUND', 404));
}
