import { AppError } from './AppError';
import { HttpStatusCode } from '../response/httpStatus';

// ─── 4xx Client Errors ────────────────────────────────────────────────────────

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details?: unknown) {
    super(message, 'BAD_REQUEST', HttpStatusCode.BAD_REQUEST, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', HttpStatusCode.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 'FORBIDDEN', HttpStatusCode.FORBIDDEN);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', HttpStatusCode.NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 'CONFLICT', HttpStatusCode.CONFLICT);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: unknown) {
    super(message, 'VALIDATION_ERROR', HttpStatusCode.UNPROCESSABLE_ENTITY, details);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 'RATE_LIMIT_EXCEEDED', HttpStatusCode.TOO_MANY_REQUESTS);
  }
}

// ─── 5xx Server Errors ────────────────────────────────────────────────────────

export class InternalServerError extends AppError {
  constructor(message = 'An unexpected error occurred') {
    super(message, 'INTERNAL_SERVER_ERROR', HttpStatusCode.INTERNAL_SERVER_ERROR, undefined, false);
  }
}
