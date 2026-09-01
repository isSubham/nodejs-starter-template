import { Request, Response } from 'express';
import { authService } from './auth.service';
import { sendSuccess, sendCreated } from '../../lib/response/response';
import { asyncHandler } from '../../utils/asyncHandler';
import { RegisterInput, LoginInput, RefreshTokenInput } from './auth.schema';

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Secret@123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: Email already in use
 *       422:
 *         description: Validation error
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as RegisterInput;
  const user = await authService.register(input);
  sendCreated(res, { user });
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and receive JWT tokens
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as LoginInput;
  const result = await authService.login(input);
  sendSuccess(res, result);
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Rotate refresh token and get new token pair
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New token pair issued
 *       401:
 *         description: Invalid or expired refresh token
 */
export const refreshTokens = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as RefreshTokenInput;
  const tokens = await authService.refreshTokens(refreshToken);
  sendSuccess(res, tokens);
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout (invalidate current refresh token)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as RefreshTokenInput;
  await authService.logout(refreshToken);
  sendSuccess(res, { message: 'Logged out successfully' });
});

/**
 * @swagger
 * /auth/logout-all:
 *   post:
 *     tags: [Auth]
 *     summary: Logout from all devices
 *     responses:
 *       200:
 *         description: All sessions terminated
 */
export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  await authService.logoutAll(req.user!.id);
  sendSuccess(res, { message: 'All sessions terminated' });
});
