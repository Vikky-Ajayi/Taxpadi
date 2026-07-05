import { Router } from "express";
import { db } from "@workspace/db";
import { filingSessionsTable, taxCalculationsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth.js";
import { CreateFilingSessionBody, UpdateFilingSessionBody } from "@workspace/api-zod";

const router = Router();
router.use(requireAuth);

router.get("/sessions", async (req, res) => {
  const user = (req as unknown as { user: typeof usersTable.$inferSelect }).user;
  const sessions = await db.select().from(filingSessionsTable).where(eq(filingSessionsTable.userId, user.id));
  res.json(sessions);
});

router.post("/sessions", async (req, res) => {
  const user = (req as unknown as { user: typeof usersTable.$inferSelect }).user;
  const parsed = CreateFilingSessionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request" }); return; }

  const [calc] = await db.select().from(taxCalculationsTable)
    .where(and(eq(taxCalculationsTable.id, parsed.data.taxCalculationId), eq(taxCalculationsTable.userId, user.id)))
    .limit(1);
  if (!calc) { res.status(404).json({ error: "Calculation not found" }); return; }

  // Build auto-fill data for TaxPro Max
  const autoFillData = {
    fullName: user.fullName,
    tin: user.tin || "TIN-PENDING",
    taxYear: calc.taxYear,
    grossIncome: Number(calc.grossIncome),
    taxableIncome: Number(calc.taxableIncome),
    personalRelief: Number(calc.personalRelief),
    taxLiability: Number(calc.taxLiability),
    employmentType: user.employmentType,
    bankName: "Access Bank",
    accountNumber: "XXXX-XXXX-" + Math.floor(1000 + Math.random() * 9000),
  };

  const [session] = await db.insert(filingSessionsTable).values({
    userId: user.id,
    taxCalculationId: calc.id,
    currentStep: 1,
    totalSteps: 6,
    status: "in_progress",
    autoFillData,
  }).returning();

  res.status(201).json(session);
});

router.get("/sessions/:id", async (req, res) => {
  const user = (req as unknown as { user: typeof usersTable.$inferSelect }).user;
  const id = parseInt(req.params.id);
  const [session] = await db
    .select()
    .from(filingSessionsTable)
    .where(and(eq(filingSessionsTable.id, id), eq(filingSessionsTable.userId, user.id)))
    .limit(1);
  if (!session) { res.status(404).json({ error: "Not found" }); return; }
  res.json(session);
});

router.patch("/sessions/:id", async (req, res) => {
  const user = (req as unknown as { user: typeof usersTable.$inferSelect }).user;
  const id = parseInt(req.params.id);
  const parsed = UpdateFilingSessionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid data" }); return; }

  // Verify ownership FIRST — then update
  const [existing] = await db
    .select()
    .from(filingSessionsTable)
    .where(and(eq(filingSessionsTable.id, id), eq(filingSessionsTable.userId, user.id)))
    .limit(1);
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }

  const updates: Partial<typeof filingSessionsTable.$inferInsert> = {};
  if (parsed.data.currentStep !== undefined) updates.currentStep = parsed.data.currentStep;
  if (parsed.data.status !== undefined) {
    updates.status = parsed.data.status;
    if (parsed.data.status === "completed") updates.completedAt = new Date();
  }

  const [updated] = await db
    .update(filingSessionsTable)
    .set(updates)
    .where(and(eq(filingSessionsTable.id, id), eq(filingSessionsTable.userId, user.id)))
    .returning();

  // Update tax calculation status to "filed" when completed
  if (parsed.data.status === "completed" && updated) {
    await db
      .update(taxCalculationsTable)
      .set({ status: "filed" })
      .where(and(eq(taxCalculationsTable.id, updated.taxCalculationId), eq(taxCalculationsTable.userId, user.id)));
  }

  res.json(updated);
});

export default router;
