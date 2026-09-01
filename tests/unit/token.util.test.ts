import { describe, it, expect } from 'vitest';
import {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  extractBearerToken,
} from '../../src/utils/token.util';
import { UnauthorizedError } from '../../src/lib/errors/errors';
import { Role } from '@prisma/client';

// Set required env vars for tests
process.env.JWT_ACCESS_SECRET = 'test-access-secret-min-16-chars';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-min-16-chars';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

const testPayload = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  role: Role.USER,
  name: 'Test User',
};

describe('token.util', () => {
  describe('signAccessToken / verifyAccessToken', () => {
    it('should sign and verify a valid token', () => {
      const token = signAccessToken(testPayload);
      const decoded = verifyAccessToken(token);

      expect(decoded.sub).toBe(testPayload.id);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.role).toBe(testPayload.role);
    });

    it('should throw UnauthorizedError for tampered token', () => {
      const token = signAccessToken(testPayload);
      const tampered = token.slice(0, -5) + 'XXXXX';

      expect(() => verifyAccessToken(tampered)).toThrow(UnauthorizedError);
    });
  });

  describe('signRefreshToken / verifyRefreshToken', () => {
    it('should sign and verify refresh token', () => {
      const tokenId = 'some-uuid';
      const token = signRefreshToken(testPayload.id, tokenId);
      const decoded = verifyRefreshToken(token);

      expect(decoded.sub).toBe(testPayload.id);
      expect(decoded.tokenId).toBe(tokenId);
    });
  });

  describe('extractBearerToken', () => {
    it('should extract token from valid Bearer header', () => {
      const token = extractBearerToken('Bearer mytoken123');
      expect(token).toBe('mytoken123');
    });

    it('should throw for missing header', () => {
      expect(() => extractBearerToken(undefined)).toThrow(UnauthorizedError);
    });

    it('should throw for non-Bearer scheme', () => {
      expect(() => extractBearerToken('Basic sometoken')).toThrow(UnauthorizedError);
    });
  });
});
