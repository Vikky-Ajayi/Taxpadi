import { Router } from "express";
import { db } from "@workspace/db";
import { taxCalculationsTable, transactionsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth.js";
import { calculateNigerianTax, generatePlainEnglishSummary, generatePidginSummary } from "../lib/tax-engine.js";
import { CalculateTaxBody } from "@workspace/api-zod";

const router = Router();
router.use(requireAuth);

function serializeCalc(c: typeof taxCalculationsTable.$inferSelect) {
  return {
    ...c,
    grossIncome: Number(c.grossIncome),
    taxableIncome: Number(c.taxableIncome),
    personalRelief: Number(c.personalRelief),
    taxLiability: Number(c.taxLiability),
    bands: c.bands,
  };
}

router.post("/calculate", async (req, res) => {
  const user = (req as unknown as { user: typeof usersTable.$inferSelect }).user;
  const parsed = CalculateTaxBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request" }); return; }

  const { statementId, taxYear, includeReliefs } = parsed.data;

  // Sum taxable income from classified transactions
  const txns = await db.select().from(transactionsTable)
    .where(eq(transactionsTable.statementId, statementId));

  const grossIncome = txns
    .filter(t => t.type === "credit" && t.taxable)
    .reduce((s, t) => s + Number(t.amount), 0);

  const result = calculateNigerianTax(grossIncome, includeReliefs ?? true);
  const plainEnglishSummary = generatePlainEnglishSummary(result);
  const pidginSummary = generatePidginSummary(result);

  const [calc] = await db.insert(taxCalculationsTable).values({
    userId: user.id,
    statementId,
    taxYear: taxYear ?? new Date().getFullYear(),
    grossIncome: result.grossIncome.toFixed(2),
    taxableIncome: result.taxableIncome.toFixed(2),
    personalRelief: result.personalRelief.toFixed(2),
    taxLiability: result.taxLiability.toFixed(2),
    effectiveRate: result.effectiveRate,
    bands: result.bands,
    status: "calculated",
    plainEnglishSummary,
    pidginSummary,
  }).returning();

  res.status(201).json(serializeCalc(calc));
});

router.get("/calculations", async (req, res) => {
  const user = (req as unknown as { user: typeof usersTable.$inferSelect }).user;
  const calcs = await db.select().from(taxCalculationsTable).where(eq(taxCalculationsTable.userId, user.id));
  res.json(calcs.map(serializeCalc));
});

router.get("/calculations/:id", async (req, res) => {
  const user = (req as unknown as { user: typeof usersTable.$inferSelect }).user;
  const id = parseInt(req.params.id);
  const [calc] = await db.select().from(taxCalculationsTable)
    .where(eq(taxCalculationsTable.id, id)).limit(1);
  if (!calc || calc.userId !== user.id) { res.status(404).json({ error: "Not found" }); return; }
  res.json(serializeCalc(calc));
});

export default router;
