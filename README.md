# IMUZAKI DONATION HUB

> A production-ready personal stream donation platform built for a single streamer. Fans send donations with live messages, payments process through ABA PayWay, the admin manages everything from a real-time dashboard, and OBS overlays show animated alerts via Socket.IO.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Development](#development)
- [Production Build](#production-build)
- [OBS Overlay Setup](#obs-overlay-setup)
- [ABA PayWay Setup](#aba-payway-setup)
- [Admin Credentials](#admin-credentials)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

---

## Features

### Public
- 🎮 Gaming/esports landing page with live goal progress and recent donations ticker
- 💸 Donation form with preset amounts, custom amounts, anonymous toggle, and 200-char messages
- ✅ Payment result pages (success with confetti, failed, pending)
- 📄 About, Terms, Privacy static pages

### Admin Dashboard
- 📊 Real-time stats: today/week/month/total revenue, donation counts, averages
- 💰 Donations table with search, status filter, and pagination
- 💳 Payments transaction log with ABA PayWay status tracking
- 📈 Revenue analytics charts (daily/weekly/monthly/yearly) via Recharts
- 🎯 Goal management — create, edit, delete, set active goal
- 🎨 Theme selector — switch between 4 built-in gaming themes
- 🔔 Notification center with unread count badge
- 📋 Activity audit log with IP addresses
- 🔊 Alert sound management
- ⚙️ Platform settings (currency, min amount, alert duration)
- 👤 Profile page with password change

### Technical
- ⚡ Real-time donation alerts via Socket.IO (OBS overlay)
- 🔒 JWT authentication with 7-day tokens
- 🛡️ Helmet security headers + rate limiting
- 🗄️ PostgreSQL with Drizzle ORM
- 📝 Full TypeScript throughout
- 🎨 Glassmorphism UI with Framer Motion animations

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Reverse Proxy                  │
│     /          → donation-hub (React + Vite)     │
│     /api       → api-server (Express 5)          │
│     /socket.io → api-server (Socket.IO)          │
└─────────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
  React + Vite          Express 5 API
  Tailwind CSS          Drizzle ORM
  shadcn/ui             PostgreSQL
  Framer Motion         Socket.IO
  TanStack Query        JWT + bcryptjs
  Recharts              Pino logging
```

---

## Folder Structure

```
workspace/
├── artifacts/
│   ├── donation-hub/          # Frontend (React + Vite)
│   │   └── src/
│   │       ├── components/    # Reusable UI components
│   │       ├── pages/
│   │       │   ├── public/    # Landing, Donate, Success, About, …
│   │       │   ├── admin/     # Dashboard, Donations, Analytics, …
│   │       │   └── overlay.tsx
│   │       ├── hooks/
│   │       └── lib/
│   └── api-server/            # Backend (Express 5)
│       └── src/
│           ├── routes/        # auth, donations, goals, payments, …
│           └── lib/           # auth.ts, socket.ts, payway.ts
├── lib/
│   ├── db/src/schema/         # Drizzle table definitions
│   ├── api-spec/              # OpenAPI 3 specification
│   ├── api-client-react/      # Generated TanStack Query hooks
│   └── api-zod/               # Generated Zod validation schemas
└── pnpm-workspace.yaml
```

---

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd workspace
pnpm install

# 2. Set environment variables (see below)
cp .env.example .env
# Edit .env with your database URL and secrets

# 3. Push database schema
pnpm --filter @workspace/db run push

# 4. Seed initial data
pnpm --filter @workspace/db run seed   # if a seed script exists
# Or use the built-in seed that runs on first startup

# 5. Start development servers
pnpm --filter @workspace/api-server run dev   # API on :8080
pnpm --filter @workspace/donation-hub run dev # Frontend on :5173
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SESSION_SECRET` | ✅ | JWT signing secret (32+ random chars) |
| `PORT` | ✅ | API server port (default: 8080) |
| `ABA_MERCHANT_ID` | ⚠️ | ABA PayWay merchant ID (production) |
| `ABA_API_KEY` | ⚠️ | ABA PayWay API key |
| `ABA_HASH_KEY` | ⚠️ | ABA PayWay HMAC-SHA512 hash key |
| `ABA_WEBHOOK_SECRET` | ⚠️ | ABA PayWay webhook verification secret |
| `NODE_ENV` | — | `development` or `production` |

> ⚠️ Without ABA_ variables the system runs in **sandbox mode** — payments immediately redirect to the success page without hitting PayWay. Safe for testing.

---

## Database Setup

The project uses **Drizzle ORM** with PostgreSQL.

```bash
# Push schema to database (dev / staging)
pnpm --filter @workspace/db run push

# Regenerate API hooks and Zod schemas from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen
```

### Tables

| Table | Description |
|-------|-------------|
| `users` | Admin accounts (username, email, bcrypt hash) |
| `donations` | All donation records with status tracking |
| `goals` | Fundraising goals with progress amounts |
| `notifications` | In-app notifications for the admin |
| `activity_logs` | Audit log of all admin actions |
| `settings` | Single-row platform configuration |
| `sounds` | Alert sound files for donation alerts |
| `themes` | Visual theme presets |
| `payment_methods` | Configured payment gateways |
| `sessions` | (Reserved) Admin session tracking |

---

## Development

```bash
# Start API server (port 8080)
pnpm --filter @workspace/api-server run dev

# Start frontend (dynamic port)
pnpm --filter @workspace/donation-hub run dev

# Run all typechecks
pnpm run typecheck

# Rebuild lib declarations (required after schema changes)
pnpm run typecheck:libs
```

---

## Production Build

```bash
# Build everything
pnpm run build

# Start API server
node --enable-source-maps artifacts/api-server/dist/index.mjs

# Frontend is served as static files — deploy dist/ to CDN or serve via Nginx
```

---

## OBS Overlay Setup

1. Open OBS Studio
2. Add a **Browser Source**
3. Set URL to: `https://your-domain/overlay`
4. Set Width: `1920`, Height: `1080`
5. Check **"Shutdown source when not visible"**
6. Check **"Refresh browser when scene becomes active"**
7. Uncheck **"Use custom frame rate"**

The overlay connects via Socket.IO and shows animated donation alerts automatically. Use the **Test Alert** button in Admin → Overlay to preview without a real donation.

---

## ABA PayWay Setup

1. Register at [ABA PayWay](https://www.payway.com.kh/)
2. Complete merchant onboarding
3. Set your **Webhook / Return URL** to: `https://your-domain/api/payments/callback`
4. Configure environment secrets:
   ```
   ABA_MERCHANT_ID=your_merchant_id
   ABA_API_KEY=your_api_key
   ABA_HASH_KEY=your_hash_key
   ABA_WEBHOOK_SECRET=your_webhook_secret
   ```
5. Payment flow:
   - Fan submits donation form → POST `/api/payments/create` → redirected to ABA PayWay
   - ABA posts callback to `/api/payments/callback` → donation marked paid → Socket.IO fires alert

---

## Admin Credentials

> **Default credentials (change immediately after first login):**
> - Username: `imuzaki`
> - Password: `password`

Change password at Admin → Profile → Change Password.

---

## API Reference

All endpoints are prefixed with `/api`.

### Authentication
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | — | Login, returns JWT |
| POST | `/auth/logout` | — | Logout (client-side token removal) |
| GET | `/auth/me` | ✅ | Get current admin user |
| POST | `/auth/change-password` | ✅ | Change admin password |

### Donations
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/donations` | ✅ | List donations (paginated, filterable) |
| POST | `/donations` | — | Create donation (public) |
| GET | `/donations/recent` | — | Recent paid donations |
| GET | `/donations/top` | — | Top donors leaderboard |
| GET | `/donations/:id` | ✅ | Get single donation |
| PATCH | `/donations/:id` | ✅ | Update donation |
| DELETE | `/donations/:id` | ✅ | Delete donation |

### Payments
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/payments/create` | — | Generate PayWay payment URL |
| POST | `/payments/callback` | — | ABA PayWay webhook receiver |
| GET | `/payments/:donationId/status` | — | Check payment status |

### Goals, Analytics, Settings, Notifications, Overlay, Sounds
See `lib/api-spec/openapi.yaml` for the full specification.

### Rate Limits
- Global: 200 requests/minute per IP
- Auth endpoints: 10 requests/minute per IP
- Donation creation: 30 requests/minute per IP

---

## Deployment

### On Replit (current)
Both services are managed by Replit workflows. Click **Publish** in the Replit UI to deploy to production. Set environment secrets via the Replit Secrets panel.

### Manual / VPS
1. Build the project: `pnpm run build`
2. Serve the API with PM2 or systemd:
   ```bash
   node --enable-source-maps artifacts/api-server/dist/index.mjs
   ```
3. Serve the frontend's `artifacts/donation-hub/dist/` via Nginx as static files
4. Configure Nginx to proxy `/api` and `/socket.io` to the API server port

---

## Troubleshooting

**Overlay not showing donation alerts**
- Check that `/socket.io` is listed in the API server's proxy paths
- Verify Socket.IO is initializing (check API server logs for "Server listening")
- Use Admin → Overlay → Test Alert to verify the connection

**Payments not processing**
- Without ABA PayWay credentials the system runs in sandbox mode (auto-success)
- For production: verify `ABA_MERCHANT_ID`, `ABA_API_KEY`, `ABA_HASH_KEY` are set
- Check that the callback URL is reachable from the internet

**DB schema errors after adding new tables**
- Run `pnpm run typecheck:libs` before `pnpm --filter @workspace/api-server run typecheck`
- The lib build must run first to regenerate type declarations

**"Too many requests" errors**
- The global rate limit is 200 req/min per IP
- Auth attempts are limited to 10/min per IP
- These are intentional security controls

**White screen / 404 on frontend**
- Ensure the Vite dev server uses `BASE_URL` for all API calls
- Check that the Vite config has `server.allowedHosts: true` for Replit proxy

---

## FAQ

**Can multiple admins use the platform?**
Currently the platform is designed for a single streamer with one admin account. Multi-user support can be added by extending the `users` table with roles.

**How do I add a new payment gateway?**
1. Add a row to the `payment_methods` table
2. Implement the gateway logic in `artifacts/api-server/src/lib/`
3. Update the `/payments/create` route to branch on the selected method

**Can I use a currency other than USD?**
Yes — change the currency in Admin → Settings. ABA PayWay also supports KHR (Cambodian Riel).

**How do I reset the database?**
Run `pnpm --filter @workspace/db run push` to sync schema changes. To wipe all data, truncate the tables manually via psql or a DB client.

**How do I customize the overlay appearance?**
The overlay at `/overlay` is a React page — edit `artifacts/donation-hub/src/pages/overlay.tsx` directly to change fonts, colors, animations, and layout.
