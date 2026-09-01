import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Role } from '@prisma/client';
import { UnauthorizedError } from '../lib/errors/errors';

// JWT payload types
interface JwtAccessPayload extends jwt.JwtPayload {
  sub: string;
  email: string;
  role: Role;
  name: string;
}

interface JwtRefreshPayload extends jwt.JwtPayload {
  sub: string;
  tokenId: string;
}

// ─── Access Token ─────────────────────────────────────────────────────────────

export function signAccessToken(payload: {
  id: string;
  email: string;
  role: Role;
  name: string;
}): string {
  return jwt.sign(
    { sub: payload.id, email: payload.email, role: payload.role, name: payload.name },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
  );
}

export function verifyAccessToken(token: string): JwtAccessPayload {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAccessPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Access token expired');
    }
    throw new UnauthorizedError('Invalid access token');
  }
}

// ─── Refresh Token ────────────────────────────────────────────────────────────

export function signRefreshToken(userId: string, tokenId: string): string {
  return jwt.sign({ sub: userId, tokenId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyRefreshToken(token: string): JwtRefreshPayload {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtRefreshPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Refresh token expired');
    }
    throw new UnauthorizedError('Invalid refresh token');
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extract Bearer token from Authorization header.
 */
export function extractBearerToken(authHeader: string | undefined): string {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or malformed Authorization header');
  }
  return authHeader.slice(7);
}
