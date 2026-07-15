---
name: Testing setup
description: Vitest configuration and known peer dependency quirk
---

Both packages have Vitest configured:
- `artifacts/api-server`: node environment, `src/**/*.test.ts`, uses supertest for HTTP smoke tests
- `artifacts/donation-hub`: jsdom environment, `@testing-library/react`, setup file at `src/test/setup.ts`

**Quirk:** `@testing-library/react` v16 requires `@testing-library/dom` as an explicit peer dependency — pnpm does not auto-install it. Must be installed separately: `pnpm add -D --filter @workspace/donation-hub @testing-library/dom`.

**How to apply:** After adding any new @testing-library/* packages, check if @testing-library/dom is in devDeps.
