---
name: Rate limiter placement
description: Why rate limiters must not be defined in app.ts
---

Rate limiters (authLimiter, donationLimiter) were initially defined in `app.ts` and imported by route files. This creates a circular dependency: `app.ts` → `routes/index.ts` → `routes/auth.ts` → `app.ts`. The route handler arrives as `undefined` at runtime, crashing the server with "argument handler must be a function".

**Fix:** Move all rate limiters to `artifacts/api-server/src/lib/limiters.ts` and import from there in both `app.ts` (global limiter) and individual route files.

**Why:** ESM circular imports are partially resolved — the importing module gets `undefined` for values not yet initialised at the time of the circular reference.

**How to apply:** Any new rate limiters go in `lib/limiters.ts`, never in `app.ts`.
