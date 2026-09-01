import { Router } from 'express';
import healthRouter from './health.routes';
import authRoutes from '../modules/auth/auth.routes';
import userRoutes from '../modules/user/user.routes';

const router = Router();

router.use(healthRouter);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;
