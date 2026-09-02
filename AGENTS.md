# AGENTS.md

Instructions for AI coding agents (Claude Code, Cursor, Copilot, Codex, etc.) working in this repository.

## What this is

A production-grade REST API starter: TypeScript (strict) + Express 4 + PostgreSQL via Prisma + JWT auth (access/refresh rotation) + Zod validation + Vitest/Supertest tests. Full architecture rationale lives in [README.md](README.md) — read it before making structural changes.

## Commands

| Task | Command |
|---|---|
| Install | `npm install` |
| Dev server | `npm run dev` |
| Type check | `npm run typecheck` |
| Lint | `npm run lint` (`npm run lint:fix` to autofix) |
| Format | `npm run format` / `npm run format:check` |
| Test | `npm test` (needs a real Postgres reachable at `TEST_DATABASE_URL`) |
| DB migrate | `npm run db:migrate` |
| Regen Prisma client | `npm run db:generate` (run after any `prisma/schema.prisma` change) |
| Build | `npm run build` |

Run `npm run typecheck && npm run lint && npm test` before considering a change done — the pre-push hook enforces `tsc --noEmit`, and CI enforces all three plus `format:check`.

## Architecture: feature modules

Each feature lives in `src/modules/<name>/` as five files, and nothing is split any other way:

- `<name>.schema.ts` — Zod input schemas + inferred types
- `<name>.repository.ts` — the *only* place that calls Prisma for this feature
- `<name>.service.ts` — business logic; throws `AppError` subclasses, calls the repository, never touches `req`/`res`
- `<name>.controller.ts` — thin HTTP layer: parse `req`, call the service, respond via `sendSuccess`/`sendCreated`; carries the `@swagger` JSDoc block
- `<name>.routes.ts` — wires `validate()`, `authenticate`, `authorize()` middleware to controller methods

Register new modules in `src/routes/index.ts`. See "Adding a New Module" in [README.md](README.md) for the full walkthrough.

## Conventions that must hold

- Controllers never import `@prisma/client` or call Prisma directly — always go through a repository.
- Every thrown error extends `AppError` (`src/lib/errors/errors.ts`). Never `throw new Error(...)`.
- Every request body/query/params gets a Zod schema run through `validate()` (`src/middlewares/validate.middleware.ts`) — no manual `if (!req.body.x)` checks.
- Every success response goes through `sendSuccess`/`sendCreated` (`src/lib/response/response.ts`) so the JSON envelope stays consistent (`{ success, data, meta? }` / `{ success: false, error }`).
- Role checks (e.g. `authorize(Role.ADMIN)`) belong in route middleware; ownership checks (e.g. "can only edit your own profile") belong in the service layer — see `user.service.ts#updateProfile` for the pattern.
- New env vars are added in three places together: the Zod schema in `src/config/env.ts`, `.env.example`, and the Environment Variables table in `README.md`.

## Testing

Integration tests hit a real Postgres database (`tests/setup.ts` migrates and truncates between tests) — do not mock Prisma or the DB. Set `TEST_DATABASE_URL` before running `npm test`; `docker-compose up -d postgres` provisions one locally.

## Don't

- Don't add a new top-level folder under `src/` for a feature — it belongs under `src/modules/`.
- Don't reach for a new dependency for something `zod`, `winston`, or the existing `src/lib/` helpers already cover.
- Don't commit `.env`, generated `dist/`, or Prisma migration state outside `prisma/migrations/`.
