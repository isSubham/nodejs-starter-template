# Contributing

## Setup

```sh
npm install
cp .env.example .env      # fill in DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
npm run db:migrate
npm run db:seed
npm run dev
```

You'll need a local Postgres instance (or `docker-compose up -d postgres`).

## Before opening a PR

```sh
npm run typecheck
npm run lint
npm run format:check
npm test
```

All four run in CI; the pre-push hook already runs `tsc --noEmit` for you.

## Workflow

- Branch names must match `feat/<name>`, `fix/<name>`, `hotfix/<name>`, `chore/<name>`, or `refactor/<name>` (enforced by `validate-branch-name`).
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) and are linted by commitlint on commit. Use `npm run commit` for an interactive prompt if you'd rather not write one by hand.
- Keep changes scoped to one feature module (`src/modules/<name>/`) where possible — see [AGENTS.md](AGENTS.md) for the module pattern and conventions the codebase follows.
- New env vars need to land in three places: `src/config/env.ts`, `.env.example`, and the README's Environment Variables table.

## Adding a module

See "Adding a New Module" in [README.md](README.md#adding-a-new-module).
