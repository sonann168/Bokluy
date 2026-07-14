---
name: IMUZAKI Donation Hub stack quirks
description: Key decisions and gotchas for the donation hub build
---

- Use `bcryptjs` (pure JS) instead of `bcrypt` — Replit blocks native build scripts for `bcrypt@6`
- JWT signing uses `SESSION_SECRET` env var as the key (already provisioned by Replit)
- Socket.IO is attached to the same `createServer(app)` instance; path `/socket.io` must be listed in `artifacts/api-server/.replit-artifact/artifact.toml` paths array for the proxy to forward WebSocket upgrades
- ABA PayWay: reads `ABA_MERCHANT_ID`, `ABA_API_KEY`, `ABA_HASH_KEY` from env; falls back to sandbox mode (returns a direct success URL) if any are missing
- Default admin: username=`imuzaki`, password=`password` (bcrypt hash seeded directly into DB)
- Settings table always has exactly one row — `ensureSettings()` helper inserts defaults on first read

**Why:** bcrypt native build blocked by pnpm approve-builds prompt in non-interactive CI. Socket.IO WebSocket path must be explicitly listed or the proxy silently drops upgrade requests.
