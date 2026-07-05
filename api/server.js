/**
 * Vercel serverless entry point — CommonJS.
 *
 * Imports the pre-compiled Express app (no listen() call).
 * Built by `pnpm -w run build:vercel` → artifacts/api-server/build-app.mjs
 *
 * Using CJS keeps pg's optional pg-native require() inside its try/catch
 * (lazy), so the function doesn't crash when pg-native isn't installed.
 */
"use strict";

const appModule = require("../artifacts/api-server/dist/app.cjs");

// esbuild CJS interop wraps the default export — unwrap it
module.exports = appModule.default ?? appModule;
