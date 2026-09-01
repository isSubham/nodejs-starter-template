import { Router } from 'express';
import * as userController from './user.controller';
import { authenticate, authorize } from '../../middlewares/authenticate.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { UpdateProfileSchema, UserListQuerySchema, UserIdParamSchema } from './user.schema';
import { Role } from '@prisma/client';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get('/me', userController.getMe);

router.get(
  '/',
  authorize(Role.ADMIN),
  validate(UserListQuerySchema, 'query'),
  userController.listUsers,
);

router.get(
  '/:id',
  authorize(Role.ADMIN),
  validate(UserIdParamSchema, 'params'),
  userController.getUserById,
);

router.patch(
  '/:id',
  validate(UserIdParamSchema, 'params'),
  validate(UpdateProfileSchema),
  userController.updateUser,
);

export default router;
