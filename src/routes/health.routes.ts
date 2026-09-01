import { Router, Request, Response } from 'express';
import { checkDBHealth } from '../config/database';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Check server and database health
 *     security: []
 *     responses:
 *       200:
 *         description: Server is healthy
 *       503:
 *         description: Service unavailable
 */
const healthHandler = (_req: Request, res: Response): void => {
  void checkDBHealth().then((dbHealthy) => {
    const status = {
      status: dbHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      services: {
        database: dbHealthy ? 'up' : 'down',
      },
    };

    res.status(dbHealthy ? 200 : 503).json({ success: dbHealthy, data: status });
  });
};

router.get('/health', healthHandler);

export default router;
