# Skills Demonstrated

A map from the skills listed on the LinkedIn project entry to where they actually show up in this codebase — so a claim is one click from proof.

## TypeScript (strict mode)

`tsconfig.json` runs `strict`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, and `noFallthroughCasesInSwitch` together — not just `strict: true` and calling it done. Types flow end-to-end: Zod schemas infer their TS types (`src/modules/*/​*.schema.ts`), and Prisma generates the rest.

## Node.js / Express architecture

`src/app.ts` exports a side-effect-free `createApp()` factory instead of starting a server at import time — the same app instance is used by tests (`tests/integration/*.test.ts`) and `src/server.ts`, so integration tests exercise the real middleware stack, not a stub.

## PostgreSQL + Prisma

Schema in `prisma/schema.prisma`; every query lives behind a repository (`src/modules/user/user.repository.ts`) — controllers and services never import `@prisma/client` directly. `src/config/database.ts` switches the connection between `DATABASE_URL` and `TEST_DATABASE_URL` based on `NODE_ENV` at the client level, not the schema.

## JWT authentication

Access tokens (15m) and refresh tokens (7d) issued as a pair; refresh tokens are persisted (`RefreshToken` model) and **rotated on every use** — `auth.service.ts#refreshTokens` deletes the old token before issuing a new pair, so a stolen refresh token can't be replayed after the legitimate user refreshes once. Ownership vs. role checks are deliberately split: `authorize(Role.ADMIN)` at the route layer, "can only edit your own profile" at the service layer (`user.service.ts#updateProfile`).

## Zod validation

One pattern for every input surface: `validate.middleware.ts` is a factory that runs any Zod schema against `body`/`query`/`params` and converts failures into a structured `ValidationError` — no hand-rolled `if (!req.body.x)` checks anywhere in the codebase.

## REST API design

Resource-oriented routes under a configurable `API_PREFIX`, a consistent response envelope (`{ success, data, meta? }` / `{ success: false, error }` — `src/lib/response/response.ts`), cursor-free offset pagination (`src/utils/pagination.ts`), and a single `AppError` hierarchy (`src/lib/errors/errors.ts`) so every error response has the same shape regardless of where it was thrown.

## Testing (Vitest + Supertest)

Integration tests hit a **real** Postgres instance — `tests/setup.ts` connects and truncates tables between tests — deliberately not mocking Prisma, because mock/prod divergence is exactly the kind of bug that DB-level tests exist to catch. 21 tests covering the full auth lifecycle, protected routes, and health checks.

## Docker

Multi-stage `Dockerfile`: a `builder` stage compiles TypeScript and generates the Prisma client, a `production` stage copies only `dist/` + prod dependencies and runs as a non-root user (`addgroup`/`adduser` before `USER nodejs`).

## CI/CD (GitHub Actions)

`.github/workflows/ci.yml` runs lint → typecheck → format:check → test (against a live Postgres service container) on every push — the same four commands a contributor runs locally, so CI never surprises anyone.

## Security practices

`helmet()` for headers, an explicit CORS allowlist (`cors.middleware.ts`), a stricter rate limiter specifically on `/auth/*` (10 req/15min vs. the general limit — `rateLimiter.middleware.ts`) for brute-force protection, bcrypt at 12 salt rounds, and `crypto.randomUUID()` instead of an npm dependency for ID generation (removed `uuid` entirely after auditing which CVE it actually applied to).

## System design / architecture

One structural rule, applied consistently: every feature is `schema → repository → service → controller → routes`, documented in [AGENTS.md](AGENTS.md) so it's not just a convention someone has to notice — it's written down.

## AI-native development practices

[AGENTS.md](AGENTS.md) and [CLAUDE.md](CLAUDE.md) document the module pattern, conventions, and commands for AI coding agents (Claude Code, Cursor, Copilot) — so agents extend the codebase along its existing lines instead of introducing a second pattern next to the first one.
