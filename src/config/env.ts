import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8000),
  API_PREFIX: z.string().default('/api/v1'),

  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),
  TEST_DATABASE_URL: z.string().url().optional(),

  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  CORS_ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900_000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),

  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('debug'),
  LOG_DIR: z.string().default('logs'),
});

// Validate on startup — will throw a descriptive error if anything is missing
const _parsed = envSchema.safeParse(process.env);

if (!_parsed.success) {
  process.stderr.write('❌ Invalid environment variables:\n');
  _parsed.error.issues.forEach((issue) => {
    process.stderr.write(`  ${issue.path.join('.')}: ${issue.message}\n`);
  });
  process.exit(1);
}

export const env = _parsed.data;

export const isDev = env.NODE_ENV === 'development';
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
