import { createHash, randomBytes, timingSafeEqual } from "crypto";

// In production, SESSION_SECRET must be explicitly set — no hardcoded fallback.
// In development/test, a default is allowed so the dev server starts without config.
const SESSION_SECRET = (() => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "SESSION_SECRET must be set in production. Set it as an environment variable."
      );
    }
    return "taxpay-dev-secret-key-2025"; // dev-only fallback
  }
  return secret;
})();

// Simple HMAC-based token (no external deps needed)
function base64url(buf: Buffer | string): string {
  const b = typeof buf === "string" ? Buffer.from(buf) : buf;
  return b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function fromBase64url(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256").update(salt + password + SESSION_SECRET).digest("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const computed = createHash("sha256").update(salt + password + SESSION_SECRET).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(computed, "hex"));
  } catch {
    return false;
  }
}

export function signToken(payload: Record<string, unknown>): string {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64url(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) }));
  const sig = base64url(
    createHash("sha256").update(`${header}.${body}.${SESSION_SECRET}`).digest()
  );
  return `${header}.${body}.${sig}`;
}

export function verifyToken(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const expectedSig = base64url(
    createHash("sha256").update(`${header}.${body}.${SESSION_SECRET}`).digest()
  );
  if (sig !== expectedSig) return null;
  try {
    return JSON.parse(fromBase64url(body).toString());
  } catch {
    return null;
  }
}
