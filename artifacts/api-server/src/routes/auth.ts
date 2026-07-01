import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, signToken } from "../lib/auth.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { RegisterBody, LoginBody, UpdateMeBody } from "@workspace/api-zod";

const router = Router();

router.post("/register", async (req, res) => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password, fullName, phone, tin, language, employmentType } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = hashPassword(password);
  const [user] = await db.insert(usersTable).values({
    email,
    passwordHash,
    fullName,
    phone,
    tin: tin ?? null,
    hasTin: !!tin,
    language: language ?? "en",
    employmentType: employmentType ?? "salaried",
  }).returning();

  const token = signToken({ userId: user.id, email: user.email });
  const { passwordHash: _, ...safeUser } = user;
  res.status(201).json({ user: safeUser, token });
});

router.post("/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email });
  const { passwordHash: _, ...safeUser } = user;
  res.status(200).json({ user: safeUser, token });
});

router.post("/logout", (req, res) => {
  res.json({ message: "Logged out" });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = (req as typeof req & { user: typeof usersTable.$inferSelect }).user;
  const { passwordHash: _, ...safeUser } = user;
  res.json(safeUser);
});

router.patch("/me", requireAuth, async (req, res) => {
  const user = (req as typeof req & { user: typeof usersTable.$inferSelect }).user;
  const parsed = UpdateMeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid data" });
    return;
  }

  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (parsed.data.fullName !== undefined) updates.fullName = parsed.data.fullName;
  if (parsed.data.phone !== undefined) updates.phone = parsed.data.phone;
  if (parsed.data.tin !== undefined) { updates.tin = parsed.data.tin; updates.hasTin = true; }
  if (parsed.data.language !== undefined) updates.language = parsed.data.language;
  if (parsed.data.employmentType !== undefined) updates.employmentType = parsed.data.employmentType;

  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, user.id)).returning();
  const { passwordHash: _, ...safeUser } = updated;
  res.json(safeUser);
});

export default router;
