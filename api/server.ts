/**
 * Vercel serverless entry point.
 * Exports the Express app directly — Vercel's Node.js runtime wraps it as a
 * serverless function. All /api/* requests are rewritten here by vercel.json.
 */
import app from "../artifacts/api-server/src/app.js";

export default app;
