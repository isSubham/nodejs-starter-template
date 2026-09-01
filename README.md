# Node.js Starter Template

A production-grade REST API starter built with **TypeScript**, **Express**, **Prisma** (PostgreSQL), and **JWT authentication**. Designed with the patterns and discipline you see in real-world 4+ YOE engineering work.

[![CI](https://github.com/Subham07-t/nodejs-starter-template/actions/workflows/ci.yml/badge.svg)](https://github.com/Subham07-t/nodejs-starter-template/actions)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Features

| Category | What's included |
|---|---|
| **Language** | TypeScript (strict mode) |
| **Framework** | Express 4 |
| **Database** | PostgreSQL via **Prisma ORM** |
| **Authentication** | JWT — access token (15m) + refresh token (7d) with rotation |
| **Validation** | **Zod** — schemas colocated with modules, env validated on boot |
| **Security** | Helmet, CORS (configured), rate limiting (global + auth-specific) |
| **Logging** | Winston — structured JSON in prod, colorized in dev, daily file rotation |
| **API Docs** | Swagger UI at `/docs` with JSDoc annotations |
| **Testing** | Vitest + Supertest — unit + integration tests with real test DB |
| **Code Quality** | ESLint (TypeScript rules), Prettier, lint-staged |
| **Git Workflow** | Husky, Commitizen, commitlint (conventional commits), branch naming |
| **Docker** | Multi-stage `Dockerfile` + `docker-compose` (app + postgres) |
| **CI** | GitHub Actions — lint → typecheck → test on every push/PR |

---

## 📁 Project Structure

```
src/
├── app.ts                   # Express app factory (testable, no side effects)
├── server.ts                # Entry point — server start + graceful shutdown
│
├── config/
│   ├── env.ts               # Zod-validated environment config (fail-fast)
│   ├── database.ts          # Prisma client singleton
│   └── swagger.ts           # Swagger/OpenAPI setup
│
├── modules/                 # Feature-first architecture
│   ├── auth/
│   │   ├── auth.schema.ts   # Zod input schemas
│   │   ├── auth.service.ts  # Business logic
│   │   ├── auth.controller.ts
│   │   └── auth.routes.ts
│   └── user/
│       ├── user.repository.ts  # All DB queries (Prisma) isolated here
│       ├── user.service.ts
│       ├── user.controller.ts
│       ├── user.schema.ts
│       └── user.routes.ts
│
├── middlewares/
│   ├── authenticate.middleware.ts  # JWT guard + role-based authorize()
│   ├── validate.middleware.ts      # Zod validation factory
│   ├── error.middleware.ts         # Global error handler + 404
│   ├── cors.middleware.ts          # Configured CORS
│   ├── rateLimiter.middleware.ts   # Global + auth-specific limiters
│   └── requestId.middleware.ts     # Correlation ID (X-Request-ID)
│
├── lib/
│   ├── errors/
│   │   ├── AppError.ts      # Base error class
│   │   └── errors.ts        # Error catalog (BadRequest, NotFound, etc.)
│   ├── response/
│   │   ├── httpStatus.ts    # HTTP status enum
│   │   └── response.ts      # sendSuccess / sendError / sendCreated
│   └── logger/
│       ├── logger.ts        # Winston logger
│       └── requestLogger.ts # Morgan → Winston HTTP log pipe
│
├── routes/
│   ├── index.ts             # Root router
│   └── health.routes.ts     # GET /health (uptime + DB ping)
│
├── types/
│   └── express.d.ts         # req.user, req.requestId augmentation
│
└── utils/
    ├── asyncHandler.ts      # Async route error wrapper
    ├── pagination.ts        # parsePagination + buildPaginationMeta
    └── token.util.ts        # JWT sign/verify helpers
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 20
- PostgreSQL 14+
- npm

### 1. Clone & Install

```sh
git clone https://github.com/Subham07-t/nodejs-starter-template.git
cd nodejs-starter-template
npm install
```

### 2. Environment Setup

```sh
cp .env.example .env
# Fill in DATABASE_URL, JWT secrets, etc.
```

### 3. Database Setup

```sh
npm run db:migrate    # Run migrations
npm run db:seed       # Seed default users
```

### 4. Start Development Server

```sh
npm run dev
```

Server starts at `http://localhost:8000`  
API docs at `http://localhost:8000/docs`  
Health check at `http://localhost:8000/api/v1/health`

---

## 🐳 Docker

```sh
# Start app + postgres
docker-compose up

# First time: run migrations
docker-compose exec app npm run db:migrate
docker-compose exec app npm run db:seed
```

---

## 🧪 Testing

```sh
npm test               # Run all tests once
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage report
```

Integration tests use a separate test database (`TEST_DATABASE_URL`).

---

## 📋 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with hot-reload (nodemon + tsx) |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled production build |
| `npm run typecheck` | Type-check without emitting |
| `npm run lint` | Lint all TypeScript files |
| `npm run lint:fix` | Lint + auto-fix |
| `npm run format` | Format with Prettier |
| `npm test` | Run test suite |
| `npm run db:migrate` | Run Prisma migrations (dev) |
| `npm run db:migrate:prod` | Deploy migrations (production) |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run commit` | Interactive conventional commit |

---

## 🔐 API Endpoints

### Auth (Public)
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new user |
| `POST` | `/api/v1/auth/login` | Login (returns access + refresh tokens) |
| `POST` | `/api/v1/auth/refresh` | Rotate refresh token |
| `POST` | `/api/v1/auth/logout` | Invalidate refresh token |

### Auth (Protected)
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/auth/logout-all` | Revoke all sessions |

### Users (Protected)
| Method | Path | Role | Description |
|---|---|---|---|
| `GET` | `/api/v1/users/me` | Any | Get own profile |
| `GET` | `/api/v1/users` | Admin | List all users (paginated) |
| `GET` | `/api/v1/users/:id` | Admin | Get user by ID |
| `PATCH` | `/api/v1/users/:id` | Owner or Admin | Update profile |

### System
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Health check (uptime + DB status) |
| `GET` | `/docs` | Swagger UI |

---

## 🧩 Adding a New Module

1. Create `src/modules/<feature>/` with:
   - `<feature>.schema.ts` — Zod schemas
   - `<feature>.repository.ts` — Prisma queries
   - `<feature>.service.ts` — Business logic
   - `<feature>.controller.ts` — HTTP handlers (thin)
   - `<feature>.routes.ts` — Route definitions

2. Register routes in `src/routes/index.ts`

---

## 🌱 Seed Users

| Email | Password | Role |
|---|---|---|
| admin@example.com | Admin@123 | ADMIN |
| user@example.com | User@1234 | USER |

---

## Author

**Subham Haldar**  
- GitHub: [@Subham07-t](https://github.com/Subham07-t)
- LinkedIn: [linkedin.com/in/subham-haldar](https://linkedin.com/in/subham-haldar)
