import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
});

export const UserIdParamSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
});

export const UserListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type UserListQuery = z.infer<typeof UserListQuerySchema>;
