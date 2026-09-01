import morgan from 'morgan';
import { Request, Response } from 'express';
import { httpLogger } from './logger';

// Stream morgan output into Winston
const stream = {
  write: (message: string) => {
    httpLogger.http(message.trim());
  },
};

// Custom morgan token: request ID for correlation
morgan.token('request-id', (req: Request) => (req.headers['x-request-id'] as string) ?? '-');
morgan.token('user-id', (req: Request) => (req.user as { id?: string } | undefined)?.id ?? '-');

export const requestLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms [req-id::request-id] [user::user-id]',
  {
    stream,
    // Skip logging for successful health check polls to reduce noise
    skip: (req: Request, res: Response) => req.url.includes('/health') && res.statusCode === 200,
  },
);
