import { Request, Response } from 'express';
import { userService } from './user.service';
import { sendSuccess } from '../../lib/response/response';
import { asyncHandler } from '../../utils/asyncHandler';
import { UpdateProfileInput, UserListQuery } from './user.schema';

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current authenticated user's profile
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getMe(req.user!.id);
  sendSuccess(res, { user });
});

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: List all users (Admin only)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated list of users
 *       403:
 *         description: Admin access required
 */
export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as UserListQuery;
  const { users, meta } = await userService.listUsers(query);
  sendSuccess(res, users, 200, meta);
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID (Admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);
  sendSuccess(res, { user });
});

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     tags: [Users]
 *     summary: Update user profile
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *       403:
 *         description: Insufficient permissions
 */
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const input = req.body as UpdateProfileInput;
  const user = await userService.updateProfile(id, input, req.user!);
  sendSuccess(res, { user });
});
