import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

describe('GET /api/v1/health', () => {
  it('should return 200 with health status', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      status: expect.any(String),
      timestamp: expect.any(String),
      uptime: expect.any(Number),
      services: { database: expect.any(String) },
    });
  });

  it('should include X-Request-ID header', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.headers['x-request-id']).toBeDefined();
  });

  it('should respect incoming X-Request-ID', async () => {
    const customId = 'test-correlation-id-123';
    const res = await request(app)
      .get('/api/v1/health')
      .set('X-Request-ID', customId);

    expect(res.headers['x-request-id']).toBe(customId);
  });

  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
