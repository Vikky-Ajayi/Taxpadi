/**
 * Builds src/app.ts (no listen() call) for the Vercel serverless function.
 * Output: dist/app.cjs  (CommonJS)
 *
 * CJS format keeps pg's `try { require('pg-native') } catch {}` pattern intact
 * as a lazy synchronous require — safe to omit pg-native at runtime.
 * ESM format would hoist it to an unconditional top-level import and crash.
 *
 * pino-pretty workers are skipped — Vercel captures stdout directly.
 */
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";

globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(artifactDir, "dist");

await esbuild({
  entryPoints: [path.resolve(artifactDir, "src/app.ts")],
  platform: "node",
  bundle: true,
  format: "cjs",
  outfile: path.resolve(distDir, "app.cjs"),
  logLevel: "info",
  external: [
    "*.node",
    // pino transports run as worker threads — not available in serverless
    "pino-pretty",
    "thread-stream",
  ],
  sourcemap: "linked",
});
