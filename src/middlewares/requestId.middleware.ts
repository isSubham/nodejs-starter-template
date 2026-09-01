import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Attaches a unique correlation/trace ID to every request.
 * Reads from the incoming X-Request-ID header (allows tracing from upstream),
 * otherwise generates a new UUID.
 *
 * The ID is attached to req.requestId and echoed back in the response header.
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = (req.headers['x-request-id'] as string) ?? uuidv4();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
}
