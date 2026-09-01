import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { authenticate } from '../../middlewares/authenticate.middleware';
import { authRateLimiter } from '../../middlewares/rateLimiter.middleware';
import { RegisterSchema, LoginSchema, RefreshTokenSchema } from './auth.schema';

const router = Router();

router.post('/register', authRateLimiter, validate(RegisterSchema), authController.register);
router.post('/login', authRateLimiter, validate(LoginSchema), authController.login);
router.post('/refresh', validate(RefreshTokenSchema), authController.refreshTokens);
router.post('/logout', validate(RefreshTokenSchema), authController.logout);
router.post('/logout-all', authenticate, authController.logoutAll);

export default router;
