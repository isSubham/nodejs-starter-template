import { Response } from 'express';
import { AppError } from '../errors/AppError';
import { HttpStatusCode } from './httpStatus';
import { isDev } from '../../config/env';

// ─── Response Types ───────────────────────────────────────────────────────────

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    stack?: string;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: HttpStatusCode = HttpStatusCode.OK,
  meta?: PaginationMeta,
): Response {
  const body: ApiSuccessResponse<T> = { success: true, data, ...(meta && { meta }) };
  return res.status(statusCode).json(body);
}

export function sendCreated<T>(res: Response, data: T): Response {
  return sendSuccess(res, data, HttpStatusCode.CREATED);
}

export function sendNoContent(res: Response): Response {
  return res.status(HttpStatusCode.NO_CONTENT).send();
}

export function sendError(res: Response, error: unknown): Response {
  if (error instanceof AppError) {
    const body: ApiErrorResponse = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details !== undefined && { details: error.details }),
        ...(isDev && { stack: error.stack }),
      },
    };
    return res.status(error.statusCode).json(body);
  }

  // Unknown/unhandled errors — sanitize in production
  const body: ApiErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: isDev && error instanceof Error ? error.message : 'An unexpected error occurred',
      ...(isDev && error instanceof Error && { stack: error.stack }),
    },
  };
  return res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json(body);
}
