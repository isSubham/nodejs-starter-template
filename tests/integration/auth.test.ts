import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();
const BASE = '/api/v1/auth';

describe('Auth API', () => {
  const validUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Secret@123',
  };

  // ─── Register ──────────────────────────────────────────────────────────────

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app).post(`${BASE}/register`).send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toMatchObject({
        id: expect.any(String),
        email: validUser.email.toLowerCase(),
        name: validUser.name,
        role: 'USER',
      });
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('should reject duplicate email', async () => {
      await request(app).post(`${BASE}/register`).send(validUser);
      const res = await request(app).post(`${BASE}/register`).send(validUser);

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('should reject weak passwords', async () => {
      const res = await request(app)
        .post(`${BASE}/register`)
        .send({ ...validUser, password: 'weak' });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post(`${BASE}/register`)
        .send({ ...validUser, email: 'not-an-email' });

      expect(res.status).toBe(422);
    });
  });

  // ─── Login ────────────────────────────────────────────────────────────────

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app).post(`${BASE}/register`).send(validUser);
    });

    it('should login and return tokens', async () => {
      const res = await request(app)
        .post(`${BASE}/login`)
        .send({ email: validUser.email, password: validUser.password });

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        user: expect.objectContaining({ email: validUser.email }),
      });
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post(`${BASE}/login`)
        .send({ email: validUser.email, password: 'WrongPass@1' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject non-existent user', async () => {
      const res = await request(app)
        .post(`${BASE}/login`)
        .send({ email: 'nobody@example.com', password: validUser.password });

      expect(res.status).toBe(401);
    });
  });

  // ─── Refresh Token ────────────────────────────────────────────────────────

  describe('POST /auth/refresh', () => {
    it('should issue new token pair', async () => {
      await request(app).post(`${BASE}/register`).send(validUser);
      const loginRes = await request(app)
        .post(`${BASE}/login`)
        .send({ email: validUser.email, password: validUser.password });

      const { refreshToken } = loginRes.body.data as { refreshToken: string };

      const res = await request(app).post(`${BASE}/refresh`).send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      // Token rotation — old token should not equal new token
      expect(res.body.data.refreshToken).not.toBe(refreshToken);
    });

    it('should reject invalid refresh token', async () => {
      const res = await request(app)
        .post(`${BASE}/refresh`)
        .send({ refreshToken: 'invalid.token.here' });

      expect(res.status).toBe(401);
    });
  });

  // ─── Protected Route ──────────────────────────────────────────────────────

  describe('GET /users/me (protected)', () => {
    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/v1/users/me');
      expect(res.status).toBe(401);
    });

    it('should return user profile with valid token', async () => {
      await request(app).post(`${BASE}/register`).send(validUser);
      const loginRes = await request(app)
        .post(`${BASE}/login`)
        .send({ email: validUser.email, password: validUser.password });

      const { accessToken } = loginRes.body.data as { accessToken: string };

      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(validUser.email);
    });
  });
});
