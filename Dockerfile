# ──────────────────────────────────────────────────────────────────
# Stage 1: Builder
# ──────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy manifests for dependency caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY lib/db/package.json                         ./lib/db/
COPY lib/api-spec/package.json                   ./lib/api-spec/
COPY lib/api-client-react/package.json           ./lib/api-client-react/
COPY lib/api-zod/package.json                    ./lib/api-zod/
COPY artifacts/api-server/package.json           ./artifacts/api-server/
COPY artifacts/donation-hub/package.json         ./artifacts/donation-hub/

RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build everything
RUN pnpm run typecheck && pnpm run build

# ──────────────────────────────────────────────────────────────────
# Stage 2: API Server (production)
# ──────────────────────────────────────────────────────────────────
FROM node:22-alpine AS api

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY lib/db/package.json                 ./lib/db/
COPY lib/api-zod/package.json            ./lib/api-zod/
COPY artifacts/api-server/package.json   ./artifacts/api-server/

RUN pnpm install --frozen-lockfile --prod

# Copy built artefacts from builder
COPY --from=builder /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=builder /app/lib/db/dist               ./lib/db/dist
COPY --from=builder /app/lib/api-zod/dist          ./lib/api-zod/dist

ENV NODE_ENV=production
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/health || exit 1

CMD ["node", "--enable-source-maps", "/app/artifacts/api-server/dist/index.mjs"]

# ──────────────────────────────────────────────────────────────────
# Stage 3: Frontend (static files via nginx)
# ──────────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS frontend

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/artifacts/donation-hub/dist/public /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/api/health || exit 1
