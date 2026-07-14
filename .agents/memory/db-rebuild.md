---
name: DB lib rebuild rule
description: Must run typecheck:libs after schema changes or api-server sees stale exports
---

After adding or modifying files in `lib/db/src/schema/`, the compiled declarations in `lib/db/dist/` become stale. The api-server imports from `@workspace/db` which resolves to those declarations.

**Rule:** Always run `pnpm run typecheck:libs` (or equivalently `tsc --build` at root) before running `pnpm --filter @workspace/api-server run typecheck`. Skipping this causes `Module '@workspace/db' has no exported member 'xyzTable'` errors even though the source file is correct.

**Why:** The root `tsconfig.json` is a solution file for composite libs only. `typecheck:libs` rebuilds declarations; leaf artifact checks (`typecheck`) use those declarations, not the source.

**How to apply:** Any time a new table is added to `lib/db/src/schema/index.ts`, run `pnpm run typecheck:libs` first.
