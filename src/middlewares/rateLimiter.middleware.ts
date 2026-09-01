import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { TooManyRequestsError } from '../lib/errors/errors';

/**
 * General API rate limiter.
 */
export const rateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
  handler: (_req, _res, next) => {
    next(new TooManyRequestsError('Too many requests — please try again later'));
  },
});

/**
 * Stricter limiter for auth endpoints (brute-force protection).
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
  handler: (_req, _res, next) => {
    next(new TooManyRequestsError('Too many login attempts — please try again in 15 minutes'));
  },
});
