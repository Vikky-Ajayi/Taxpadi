/**
 * Vercel serverless entry point.
 * Imports the pre-compiled Express app (no listen() call).
 * Built by `pnpm -w run build:vercel` → artifacts/api-server/build-app.mjs
 */
import app from "../artifacts/api-server/dist/app.mjs";

export default app;
