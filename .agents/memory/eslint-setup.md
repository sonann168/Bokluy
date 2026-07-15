---
name: ESLint flat config
description: ESLint v10 setup and plugin compatibility
---

ESLint v10 is installed at root with flat config (`eslint.config.js`). Root package.json has `"type": "module"` so the config file is treated as ESM.

**Incompatibility:** `eslint-plugin-react` v7.x uses the legacy `contextOrFilename.getFilename()` API removed in ESLint v10 flat config. Do NOT add `eslint-plugin-react` to the config — it crashes at lint time.

**Working plugins:** `@typescript-eslint/eslint-plugin`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`, `@eslint/js`.

**Run lint:** `node_modules/.bin/eslint .` from the workspace root.

**How to apply:** If react-specific lint rules are needed beyond hooks, wait for eslint-plugin-react v8 (flat config native) or pin to a compatible minor.
