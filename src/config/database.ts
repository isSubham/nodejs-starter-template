import { PrismaClient } from '@prisma/client';
import { env, isDev, isProd } from './env';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isDev ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url:
          env.NODE_ENV === 'test' ? (env.TEST_DATABASE_URL ?? env.DATABASE_URL) : env.DATABASE_URL,
      },
    },
  });

if (!isProd) globalForPrisma.prisma = prisma;

export async function connectDB(): Promise<void> {
  await prisma.$connect();
}

export async function disconnectDB(): Promise<void> {
  await prisma.$disconnect();
}

/**
 * Checks database connectivity by running a lightweight query.
 */
export async function checkDBHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
