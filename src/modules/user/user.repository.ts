import { Prisma, User } from '@prisma/client';
import { prisma } from '../../config/database';

// Fields safe to return to the client (no password)
export const safeUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type SafeUser = Prisma.UserGetPayload<{ select: typeof safeUserSelect }>;

/**
 * UserRepository — all Prisma queries for the users table live here.
 * Controllers and services never touch prisma.user directly.
 */
export class UserRepository {
  async findById(id: string): Promise<SafeUser | null> {
    return prisma.user.findUnique({ where: { id }, select: safeUserSelect });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findAll(params: {
    skip: number;
    take: number;
    search?: string;
  }): Promise<{ users: SafeUser[]; total: number }> {
    const where: Prisma.UserWhereInput = params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: 'insensitive' } },
            { email: { contains: params.search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip: params.skip,
        take: params.take,
        select: safeUserSelect,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<SafeUser> {
    return prisma.user.update({ where: { id }, data, select: safeUserSelect });
  }

  async softDelete(id: string): Promise<SafeUser> {
    return prisma.user.update({ where: { id }, data: { isActive: false }, select: safeUserSelect });
  }
}

export const userRepository = new UserRepository();
