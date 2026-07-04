/**
 * Builds just src/app.ts (no listen() call) for the Vercel serverless function.
 * Output: dist/app.mjs
 *
 * We skip esbuild-plugin-pino here because Vercel captures stdout directly —
 * pino-pretty worker threads aren't needed in a serverless environment.
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
  format: "esm",
  outfile: path.resolve(distDir, "app.mjs"),
  logLevel: "info",
  external: [
    "*.node",
    "pg-native",
    // pino transports run as workers — not needed in Vercel serverless
    "pino-pretty",
    "thread-stream",
  ],
  sourcemap: "linked",
  // CJS interop shim — required for express, cors, pino-http, etc.
  banner: {
    js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';
globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
`,
  },
});
