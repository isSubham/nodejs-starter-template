# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build
RUN npm run db:generate

# ---- Production Stage ----
FROM node:20-alpine AS production

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev && npm run db:generate

COPY --from=builder /app/dist ./dist

USER nodejs

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8000/api/v1/health || exit 1

CMD ["node", "dist/server.js"]
