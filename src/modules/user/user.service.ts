import { userRepository, SafeUser } from './user.repository';
import { NotFoundError, ForbiddenError } from '../../lib/errors/errors';
import { UpdateProfileInput, UserListQuery } from './user.schema';
import { parsePagination, buildPaginationMeta, PaginationMeta } from '../../utils/pagination';
import { Role } from '@prisma/client';

export class UserService {
  /**
   * Get a single user by ID. Throws if not found.
   */
  async getUserById(id: string): Promise<SafeUser> {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError('User');
    return user;
  }

  /**
   * Get paginated list of users. Restricted to ADMIN role (enforced at route level).
   */
  async listUsers(query: UserListQuery): Promise<{ users: SafeUser[]; meta: PaginationMeta }> {
    const { skip, take, page, limit } = parsePagination(query);
    const { users, total } = await userRepository.findAll({ skip, take, search: query.search });
    return { users, meta: buildPaginationMeta(total, page, limit) };
  }

  /**
   * Update a user's own profile.
   * Admins can update any user.
   */
  async updateProfile(
    targetUserId: string,
    input: UpdateProfileInput,
    requestingUser: { id: string; role: Role },
  ): Promise<SafeUser> {
    // Users can only update their own profile
    if (requestingUser.role !== Role.ADMIN && requestingUser.id !== targetUserId) {
      throw new ForbiddenError('You can only update your own profile');
    }

    const existing = await userRepository.findById(targetUserId);
    if (!existing) throw new NotFoundError('User');

    return userRepository.update(targetUserId, input);
  }

  /**
   * Get the authenticated user's own profile.
   */
  async getMe(userId: string): Promise<SafeUser> {
    return this.getUserById(userId);
  }
}

export const userService = new UserService();
