import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// Lazy initialisation — the DB connection is only created on first use.
// This prevents the serverless function from crashing at cold-start when
// DATABASE_URL is absent (e.g. the WhatsApp webhook verification endpoint
// doesn't touch the DB at all).
let _pool: InstanceType<typeof Pool> | null = null;
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getPool(): InstanceType<typeof Pool> {
  if (!_pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?",
      );
    }
    _pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return _pool;
}

function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (!_db) {
    _db = drizzle(getPool(), { schema });
  }
  return _db;
}

export const pool: InstanceType<typeof Pool> = new Proxy(
  {} as InstanceType<typeof Pool>,
  {
    get(_t, prop) {
      return Reflect.get(getPool(), prop);
    },
  },
);

export const db: ReturnType<typeof drizzle<typeof schema>> = new Proxy(
  {} as ReturnType<typeof drizzle<typeof schema>>,
  {
    get(_t, prop) {
      return Reflect.get(getDb(), prop);
    },
  },
);

export * from "./schema";
