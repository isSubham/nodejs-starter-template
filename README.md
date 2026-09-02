<div align="center">

# Node.js Starter Template

**A production-grade REST API boilerplate built the way senior engineers actually build things.**

TypeScript · Express · PostgreSQL · Prisma · JWT · Zod · Vitest · Docker

[![CI](https://github.com/isSubham/nodejs-starter-template/actions/workflows/ci.yml/badge.svg)](https://github.com/isSubham/nodejs-starter-template/actions/workflows/ci.yml)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-339933?logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

</div>

---

## Why this template?

Most Node.js starters are either too minimal (a bare Express setup) or too opinionated (a full framework). This one sits in the sweet spot — it's what you'd build on day one at a serious company.

Every decision here has a reason:

- **TypeScript strict mode** — catch bugs at compile time, not in production
- **Zod for everything** — env validation, request validation, same tool, same mental model
- **Feature-module architecture** — files live next to what they belong to, scales without restructuring
- **Repository pattern** — DB queries are isolated, controllers never touch Prisma directly
- **JWT rotation** — refresh tokens are stored, rotated on use, and revocable
- **Zero-debt error handling** — one error class, one error catalog, one handler
- **Agent-ready** — [`AGENTS.md`](./AGENTS.md) documents the module pattern and conventions so Claude Code, Cursor, Copilot, etc. generate code that fits the codebase instead of fighting it

---

## Stack

| Concern | Choice | Why |
|---|---|---|
| Language | TypeScript 5 (strict) | Type safety end-to-end |
| Framework | Express 4 | Stable, well-understood, minimal magic |
| Database | PostgreSQL + **Prisma** | Type-safe queries, great migration story |
| Auth | JWT (access + refresh) | Stateless + revocable, industry standard |
| Validation | **Zod** | Runtime + compile-time types from one schema |
| Security | Helmet + CORS + rate limiting | Non-negotiable defaults |
| Logging | **Winston** + Morgan | Structured JSON in prod, colorized in dev |
| Testing | **Vitest** + Supertest | Fast, ESM-native, real DB integration tests |
| API Docs | **Swagger / OpenAPI** | Auto-generated from JSDoc annotations |
| Container | Docker (multi-stage) | Prod-ready image, separate dev compose |
| CI | **GitHub Actions** | Lint → typecheck → test on every push |

---

## Project Structure

```
nodejs-starter-template/
│
├── .github/
│   ├── ISSUE_TEMPLATE/               # Bug report + feature request forms
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│       └── ci.yml                   # CI: lint → typecheck → test
│
├── scripts/
│   └── setup.mjs                    # `npm run setup` — one-time template rename, self-deletes
│
├── prisma/
│   ├── schema.prisma                # User + RefreshToken models
│   └── seed.ts                      # Seed admin + test users
│
├── src/
│   ├── app.ts                       # Express app factory (side-effect-free, testable)
│   ├── server.ts                    # Entry point: start + graceful shutdown
│   │
│   ├── config/
│   │   ├── env.ts                   # Zod-validated env — fails at boot if invalid
│   │   ├── database.ts              # Prisma client singleton (test/dev/prod aware)
│   │   └── swagger.ts               # Swagger UI + OpenAPI JSON endpoint
│   │
│   ├── modules/                     # Feature-first: each module owns its full slice
│   │   ├── auth/
│   │   │   ├── auth.schema.ts       # Zod: RegisterSchema, LoginSchema, RefreshSchema
│   │   │   ├── auth.service.ts      # register / login / refreshTokens / logout / logoutAll
│   │   │   ├── auth.controller.ts   # Thin HTTP handlers + Swagger JSDoc
│   │   │   └── auth.routes.ts       # Routes with rate limiting + validation middleware
│   │   │
│   │   └── user/
│   │       ├── user.schema.ts       # Zod: UpdateProfile, UserListQuery, UserIdParam
│   │       ├── user.repository.ts   # All Prisma queries — controllers never touch DB
│   │       ├── user.service.ts      # getMe / listUsers / updateProfile
│   │       ├── user.controller.ts   # Thin HTTP handlers + Swagger JSDoc
│   │       └── user.routes.ts       # Routes with auth + RBAC guards
│   │
│   ├── middlewares/
│   │   ├── authenticate.middleware.ts  # JWT guard → populates req.user
│   │   ├── validate.middleware.ts      # Zod middleware factory (body/query/params)
│   │   ├── error.middleware.ts         # Global error handler + 404 handler
│   │   ├── cors.middleware.ts          # Origin whitelist from env
│   │   ├── rateLimiter.middleware.ts   # Global limiter + strict auth limiter
│   │   └── requestId.middleware.ts     # X-Request-ID correlation ID
│   │
│   ├── lib/
│   │   ├── errors/
│   │   │   ├── AppError.ts          # Base error: code, statusCode, isOperational
│   │   │   └── errors.ts            # BadRequest, Unauthorized, NotFound, Conflict …
│   │   ├── response/
│   │   │   ├── httpStatus.ts        # HttpStatusCode enum
│   │   │   └── response.ts          # sendSuccess / sendCreated / sendError + types
│   │   └── logger/
│   │       ├── logger.ts            # Winston: JSON prod / colorized dev / silent test
│   │       └── requestLogger.ts     # Morgan → Winston pipe (skip health polls)
│   │
│   ├── routes/
│   │   ├── index.ts                 # Root API router
│   │   └── health.routes.ts         # GET /health → uptime + DB ping
│   │
│   ├── types/
│   │   └── express.d.ts             # Augments req.user + req.requestId
│   │
│   └── utils/
│       ├── asyncHandler.ts          # Wraps async route handlers, auto-forwards errors
│       ├── pagination.ts            # parsePagination + buildPaginationMeta
│       └── token.util.ts            # signAccessToken / verifyAccessToken / extractBearer
│
├── tests/
│   ├── setup.ts                     # Migrate + clean DB before/after each test
│   ├── integration/
│   │   ├── auth.test.ts             # register / login / refresh / protected routes
│   │   └── health.test.ts           # Health endpoint + request ID propagation
│   └── unit/
│       └── token.util.test.ts       # JWT sign/verify/tamper + Bearer extraction
│
├── .env.example                     # All env vars documented with comments
├── .editorconfig                    # Consistent indentation/line endings across editors
├── .eslintrc.json                   # TypeScript-aware ESLint (type-checked rules)
├── .prettierrc                      # Formatting config
├── AGENTS.md                        # Instructions for AI coding agents (architecture, conventions, commands)
├── CLAUDE.md                        # Points Claude Code at AGENTS.md
├── CONTRIBUTING.md                  # Setup + workflow for contributors
├── commitlint.config.js             # Conventional commits enforcement
├── docker-compose.yml               # App + Postgres with health checks
├── Dockerfile                       # Multi-stage build (builder → production)
├── nodemon.json                     # Dev: tsx watch on .ts files
├── tsconfig.json                    # Strict TS (ES2022, CommonJS output)
├── tsconfig.eslint.json             # Extended tsconfig for lint coverage of tests/
└── vitest.config.mts                # Vitest: globals, coverage, path aliases
```

---

## Using This Template

Click **Use this template** on GitHub (or `gh repo create my-api --template isSubham/nodejs-starter-template`), then:

```sh
npm install
npm run setup   # interactive: renames package.json, README, LICENSE to your project — then deletes itself
```

Skip `npm run setup` if you'd rather rename things by hand.

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **PostgreSQL** 14+ (or use Docker Compose)
- **npm**

### 1. Clone & Install

```sh
git clone https://github.com/isSubham/nodejs-starter-template.git
cd nodejs-starter-template
npm install
```

### 2. Configure Environment

```sh
cp .env.example .env
```

Open `.env` and fill in the required values. The server **will not start** if any required variable is missing — this is intentional (fail-fast).

```env
# Minimum required to run locally
DATABASE_URL=postgresql://postgres:password@localhost:5432/starter_db
JWT_ACCESS_SECRET=your-access-secret-min-16-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-16-chars
PORT=8000
```

### 3. Set Up the Database

```sh
npm run db:migrate   # Create tables via Prisma migrations
npm run db:seed      # Insert seed users (admin + regular)
```

### 4. Start the Dev Server

```sh
npm run dev
```

| URL | What |
|---|---|
| `http://localhost:8000/api/v1/health` | Health check |
| `http://localhost:8000/docs` | Swagger UI |
| `http://localhost:8000/docs.json` | Raw OpenAPI spec |

---

## Docker

The fastest way to get everything running with no local Postgres setup:

```sh
# Start both the API and Postgres
docker-compose up

# First time only — run migrations and seed
docker-compose exec app npm run db:migrate
docker-compose exec app npm run db:seed
```

The [`Dockerfile`](./Dockerfile) uses a **multi-stage build**:
- `builder` stage: compiles TypeScript, generates Prisma client
- `production` stage: copies only the compiled output + prod deps, runs as a non-root user

---

## Authentication Flow

This template implements the **dual-token JWT pattern** used in production applications:

```
POST /api/v1/auth/register   → 201 { user }
POST /api/v1/auth/login      → 200 { accessToken, refreshToken, user }

  accessToken  expires in 15 minutes
  refreshToken expires in 7 days, stored in DB

POST /api/v1/auth/refresh    → 200 { accessToken, refreshToken }
  Old refresh token is deleted (rotation), new pair is issued.
  Stolen refresh tokens cannot be reused.

POST /api/v1/auth/logout     → 200  (invalidates one refresh token)
POST /api/v1/auth/logout-all → 200  (revokes all sessions for the user)
```

**Using the access token:**
```sh
curl -H "Authorization: Bearer <accessToken>" http://localhost:8000/api/v1/users/me
```

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | Create account |
| `POST` | `/api/v1/auth/login` | Public | Login, get token pair |
| `POST` | `/api/v1/auth/refresh` | Public | Rotate refresh token |
| `POST` | `/api/v1/auth/logout` | Public | Invalidate a refresh token |
| `POST` | `/api/v1/auth/logout-all` | 🔒 User | Revoke all sessions |

### Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/users/me` | 🔒 User | Get own profile |
| `PATCH` | `/api/v1/users/:id` | 🔒 Owner / Admin | Update profile |
| `GET` | `/api/v1/users` | 🔒 Admin | Paginated user list |
| `GET` | `/api/v1/users/:id` | 🔒 Admin | Get any user by ID |

### System

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/health` | Public | Uptime + DB connectivity |
| `GET` | `/docs` | Public | Swagger UI (dev only) |

---

## Testing

```sh
npm test                # Run all tests once
npm run test:watch      # Watch mode (re-runs on file change)
npm run test:coverage   # Generate HTML coverage report
```

**What's tested:**

- `tests/integration/auth.test.ts` — Full auth lifecycle: register → login → refresh → protected route → logout
- `tests/integration/health.test.ts` — Health endpoint, 404s, request ID propagation
- `tests/unit/token.util.test.ts` — JWT sign/verify, tamper detection, Bearer extraction edge cases

Integration tests run against a **real test database** (`TEST_DATABASE_URL`). The setup file runs migrations and cleans all tables between tests for full isolation.

---

## Scripts

```sh
npm run dev              # Start dev server with hot reload (nodemon + tsx)
npm run build            # Compile TypeScript to dist/
npm start                # Run compiled build (production)
npm run typecheck        # Type-check without emitting files
npm run lint             # ESLint on all .ts files
npm run lint:fix         # ESLint + auto-fix
npm run format           # Prettier write
npm run format:check     # Prettier check (used in CI)

npm test                 # Vitest run
npm run test:watch       # Vitest watch
npm run test:coverage    # Vitest with coverage (v8)

npm run db:generate      # Re-generate Prisma client after schema changes
npm run db:migrate       # Create and apply a new migration (dev)
npm run db:migrate:prod  # Apply existing migrations (production/CI)
npm run db:seed          # Run prisma/seed.ts
npm run db:studio        # Open Prisma Studio in browser
npm run db:reset         # Drop + recreate DB and re-migrate (dev only)

npm run commit           # Interactive conventional commit via Commitizen
```

---

## Adding a New Module

The pattern is consistent across every module. To add a `post` feature:

**1. Create the module directory:**
```
src/modules/post/
├── post.schema.ts      ← Zod input schemas + inferred types
├── post.repository.ts  ← All Prisma queries (no DB calls outside this file)
├── post.service.ts     ← Business logic (calls repository, throws AppErrors)
├── post.controller.ts  ← HTTP layer (parse req → call service → send response)
└── post.routes.ts      ← Route defs with middleware (validate, authenticate, authorize)
```

**2. Register in `src/routes/index.ts`:**
```ts
import postRoutes from '../modules/post/post.routes';
router.use('/posts', postRoutes);
```

That's it. No global registries, no decorators, no magic.

---

## Environment Variables

All variables are documented in [`.env.example`](./.env.example). The server parses them with Zod on startup and exits with a clear error message if anything is missing or invalid.

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | No | `development` | `development` / `production` / `test` |
| `PORT` | No | `8000` | Server port |
| `API_PREFIX` | No | `/api/v1` | Mount path for all API routes |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string |
| `TEST_DATABASE_URL` | No | — | Separate DB for integration tests |
| `JWT_ACCESS_SECRET` | **Yes** | — | Min 16 chars |
| `JWT_ACCESS_EXPIRES_IN` | No | `15m` | Access token TTL |
| `JWT_REFRESH_SECRET` | **Yes** | — | Min 16 chars |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token TTL |
| `CORS_ALLOWED_ORIGINS` | No | `http://localhost:3000` | Comma-separated origins |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX` | No | `100` | Max requests per window |
| `LOG_LEVEL` | No | `debug` | `error` / `warn` / `info` / `debug` |
| `LOG_DIR` | No | `logs` | Directory for log files |

---

## Seed Accounts

After running `npm run db:seed`:

| Email | Password | Role |
|---|---|---|
| `admin@example.com` | `Admin@123` | `ADMIN` |
| `user@example.com` | `User@1234` | `USER` |

---

## Git Workflow

This template enforces a clean, consistent Git workflow out of the box:

- **Commitizen** (`npm run commit`) — interactive prompt for conventional commits
- **commitlint** — validates commit messages on `commit-msg` hook
- **lint-staged** — runs ESLint + Prettier only on staged files (fast)
- **Husky pre-push** — runs `tsc --noEmit` before every push
- **Branch naming** — enforced via `validate-branch-name`:
  ```
  feat/<name>    fix/<name>    hotfix/<name>    chore/<name>    refactor/<name>
  ```

---

## CI / CD

GitHub Actions runs on every push to `main`/`develop` and on every pull request:

```
1. Lint & Type Check
   ├── npm ci
   ├── prisma generate
   ├── tsc --noEmit
   ├── eslint
   └── prettier --check

2. Tests (with real Postgres service)
   ├── prisma migrate deploy
   └── vitest run --coverage
       └── uploads coverage artifact
```

See [`.github/workflows/ci.yml`](./.github/workflows/ci.yml).

---

## Logging

Logs are written to `logs/` with daily rotation (20MB max, 14-day retention, gzipped archives).

```
logs/
├── error/      # error level only
├── combined/   # info and above
└── http/       # HTTP request logs (Morgan)
```

In **development**: colorized, human-readable output in the terminal.  
In **production**: structured JSON, no console transport.  
In **test**: logging is silenced entirely.

Every request gets a **correlation ID** (`X-Request-ID`) that flows through the logger, making it easy to trace a single request across all log lines.

---

## Error Handling

All errors extend `AppError`:

```ts
throw new NotFoundError('User');           // 404 RESOURCE_NOT_FOUND
throw new ConflictError('Email taken');    // 409 CONFLICT
throw new UnauthorizedError();             // 401 UNAUTHORIZED
throw new ValidationError('Bad input', details); // 422 VALIDATION_ERROR
```

The global error handler (`src/middlewares/error.middleware.ts`) catches everything, logs operational errors at `warn` and programming errors at `error`, and returns a consistent JSON shape:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found",
    "details": { ... },
    "stack": "..."   ← development only
  }
}
```

---

## Author

**Subham Haldar**

[![Portfolio](https://img.shields.io/badge/Portfolio-000000?style=flat&logo=vercel&logoColor=white)](https://subhamh-portfolio.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-isSubham-181717?style=flat&logo=github)](https://github.com/isSubham)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-isSubham-0A66C2?style=flat&logo=linkedin)](https://www.linkedin.com/in/issubham/)
[![X](https://img.shields.io/badge/X-_isSubham-000000?style=flat&logo=x&logoColor=white)](https://x.com/_isSubham)

---

## License

[MIT](./LICENSE)
