import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors/AppError';

type AsyncRouteHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Wraps an async route handler to automatically catch errors
 * and forward them to Express's global error handler.
 */
export const asyncHandler =
  (fn: AsyncRouteHandler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

/**
 * Type guard to check if an error is an operational AppError
 * (i.e., expected and safe to expose to the client).
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
