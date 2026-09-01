import { PrismaClient } from '@prisma/client';

// Use a separate test database
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;

const prisma = new PrismaClient();

// Run migrations before all tests
beforeAll(async () => {
  await prisma.$connect();
});

// Clean up all tables after each test to ensure isolation
afterEach(async () => {
  // Delete in dependency order (FK constraints)
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
