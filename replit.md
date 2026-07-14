# IMUZAKI DONATION HUB

A personal stream donation platform for a single streamer. Fans donate with messages, payments go through ABA PayWay, the admin manages everything from a dashboard, and OBS overlays show real-time alerts via Socket.IO.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/donation-hub run dev` — run the frontend (port assigned dynamically)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Required env: `SESSION_SECRET` — used as JWT signing secret
- Optional env: `ABA_MERCHANT_ID`, `ABA_API_KEY`, `ABA_HASH_KEY`, `ABA_WEBHOOK_SECRET` — ABA PayWay production credentials

## Default Admin Credentials

- Username: `imuzaki`
- Password: `password`
- **Change these in production!**

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, Framer Motion, Recharts
- API: Express 5 + Socket.IO (real-time donation alerts)
- DB: PostgreSQL + Drizzle ORM
- Auth: JWT (via `jsonwebtoken` + `bcryptjs`)
- Payments: ABA PayWay Auto Pay
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle table definitions (users, donations, goals, notifications, activity_logs, settings, sounds)
- `artifacts/api-server/src/routes/` — Express route handlers (auth, donations, goals, analytics, payments, overlay, sounds, notifications, activityLogs, settings)
- `artifacts/api-server/src/lib/` — auth.ts (JWT), socket.ts (Socket.IO), payway.ts (ABA PayWay), logger.ts
- `artifacts/donation-hub/src/pages/` — all frontend pages (public + admin)

## Pages

### Public
- `/` — Landing page with goal progress, recent donations ticker
- `/donate` — Donation form with ABA PayWay payment
- `/donate/success`, `/donate/failed`, `/donate/pending` — Payment result pages
- `/about`, `/terms`, `/privacy` — Static pages
- `/overlay` — OBS browser source (transparent, Socket.IO real-time alerts)

### Admin (JWT-protected)
- `/admin/login` — Login page
- `/admin` — Dashboard with stats, charts, recent donations
- `/admin/donations` — Donations table with search/filter/pagination
- `/admin/analytics` — Revenue charts (daily/weekly/monthly/yearly)
- `/admin/goals` — Goal management
- `/admin/overlay` — OBS overlay settings + test alert button
- `/admin/settings` — Platform settings
- `/admin/sounds` — Alert sound management
- `/admin/notifications` — Notification center
- `/admin/activity-logs` — Audit log

## Architecture decisions

- JWT stored in `localStorage` as `admin_token`; injected via `custom-fetch.ts`'s `setAuthTokenGetter`
- Socket.IO attached to the same HTTP server as Express; path `/socket.io` is listed in artifact.toml for proxy routing
- ABA PayWay runs in sandbox mode (returns direct success URL) when env vars are not set
- `bcryptjs` used instead of `bcrypt` to avoid native build script issues in Replit
- Settings table always has exactly one row (ensured on every read)

## Gotchas

- After changing `lib/db/src/schema/`, run `pnpm run typecheck:libs` before `pnpm --filter @workspace/api-server run typecheck` — stale lib declarations cause false type errors
- ABA PayWay payment flow: create donation → call `/api/payments/create` to get the payment URL → redirect user → `/api/payments/callback` (webhook) fires on payment completion
- OBS overlay lives at `/overlay` with a transparent background — add it as a browser source at `https://<your-domain>/overlay`

## User preferences

- Color palette: Primary #7B2EFF, Secondary #FFB100, Accent #FF5A36, Highlight #45B7FF
- Font: Rajdhani (headings) + Inter (body)
- Gaming/esports aesthetic with glassmorphism, glow effects, dark purple background
