import { Role } from '@prisma/client';

// ─── Express Augmentation ─────────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      requestId?: string;
    }
  }
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  name: string;
}
