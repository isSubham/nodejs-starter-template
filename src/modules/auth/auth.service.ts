import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { prisma } from '../../config/database';
import { ConflictError, UnauthorizedError } from '../../lib/errors/errors';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/token.util';
import { RegisterInput, LoginInput } from './auth.schema';

const SALT_ROUNDS = 12;
const REFRESH_TOKEN_DAYS = 7;

export class AuthService {
  /**
   * Registers a new user. Throws ConflictError if email is already taken.
   */
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashedPassword,
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    return user;
  }

  /**
   * Validates credentials and returns access + refresh tokens.
   */
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const { accessToken, refreshToken } = await this.generateTokenPair(user);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }

  /**
   * Rotates a refresh token — invalidates the old one and issues a new pair.
   */
  async refreshTokens(token: string) {
    const payload = verifyRefreshToken(token);

    const storedToken = await prisma.refreshToken.findUnique({ where: { token } });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      // Delete if expired, prevents stale token accumulation
      if (storedToken) await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new UnauthorizedError('Refresh token is invalid or expired');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive');
    }

    // Invalidate old token (token rotation)
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    const { accessToken, refreshToken } = await this.generateTokenPair(user);

    return { accessToken, refreshToken };
  }

  /**
   * Revokes a specific refresh token (logout).
   */
  async logout(token: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }

  /**
   * Revokes all refresh tokens for a user (logout all devices).
   */
  async logoutAll(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  }

  // ─── Private ───────────────────────────────────────────────────────────────

  private async generateTokenPair(user: {
    id: string;
    email: string;
    role: import('@prisma/client').Role;
    name: string;
  }) {
    const tokenId = randomUUID();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

    const accessToken = signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const refreshToken = signRefreshToken(user.id, tokenId);

    await prisma.refreshToken.create({
      data: { id: tokenId, token: refreshToken, userId: user.id, expiresAt },
    });

    return { accessToken, refreshToken, expiresAt };
  }
}

export const authService = new AuthService();
