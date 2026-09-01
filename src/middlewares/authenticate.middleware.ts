import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, extractBearerToken } from '../utils/token.util';
import { ForbiddenError } from '../lib/errors/errors';
import { Role } from '@prisma/client';

/**
 * Protects routes by verifying the JWT access token.
 * Attaches the decoded user to req.user on success.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const token = extractBearerToken(req.headers.authorization);
    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name,
    };

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Authorization middleware factory.
 * Usage: router.get('/admin', authenticate, authorize(Role.ADMIN), handler)
 */
export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
}
