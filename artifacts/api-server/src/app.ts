import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

const allowedOrigins = process.env.NODE_ENV === "production"
  ? ["https://taxmata.vercel.app"]
  : true; // allow all in development

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Global error handler — returns JSON so the frontend gets a readable message
// instead of the default Express HTML "Internal Server Error" page.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  const status = (err as Error & { status?: number; statusCode?: number }).status
    ?? (err as Error & { status?: number; statusCode?: number }).statusCode
    ?? 500;

  // Log the full error server-side
  logger.error({ err, method: req.method, url: req.url }, "unhandled error");

  // Expose a safe message to the client
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message ?? "Internal server error";

  res.status(status).json({ error: message });
});

export default app;
