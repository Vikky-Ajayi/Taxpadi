import { Router } from "express";
import { db } from "@workspace/db";
import { transactionsTable, statementsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth.js";
import { UpdateTransactionBody } from "@workspace/api-zod";

const router = Router();
router.use(requireAuth);

// Helper: verify a statementId belongs to the authenticated user.
// Returns the statement or null.
async function getOwnedStatement(statementId: number, userId: number) {
  const [stmt] = await db
    .select()
    .from(statementsTable)
    .where(and(eq(statementsTable.id, statementId), eq(statementsTable.userId, userId)))
    .limit(1);
  return stmt ?? null;
}

router.get("/summary", async (req, res) => {
  const user = (req as unknown as { user: typeof usersTable.$inferSelect }).user;
  const statementId = parseInt(req.query.statementId as string);
  if (!statementId) { res.status(400).json({ error: "statementId required" }); return; }

  // Enforce ownership before reading transactions
  const stmt = await getOwnedStatement(statementId, user.id);
  if (!stmt) { res.status(404).json({ error: "Statement not found" }); return; }

  const txns = await db
    .select()
    .from(transactionsTable)
    .where(eq(transactionsTable.statementId, statementId));

  const totalIncome = txns.filter(t => t.type === "credit").reduce((s, t) => s + Number(t.amount), 0);
  const taxableIncome = txns.filter(t => t.type === "credit" && t.taxable).reduce((s, t) => s + Number(t.amount), 0);
  const nonTaxableIncome = totalIncome - taxableIncome;

  const categoryMap = new Map<string, { amount: number; taxable: boolean; count: number }>();
  for (const t of txns) {
    if (t.type !== "credit") continue;
    const existing = categoryMap.get(t.category) || { amount: 0, taxable: t.taxable, count: 0 };
    existing.amount += Number(t.amount);
    existing.count += 1;
    categoryMap.set(t.category, existing);
  }

  res.json({
    statementId,
    totalIncome,
    taxableIncome,
    nonTaxableIncome,
    byCategory: Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      amount: data.amount,
      taxable: data.taxable,
      count: data.count,
    })),
  });
});

router.get("/", async (req, res) => {
  const user = (req as unknown as { user: typeof usersTable.$inferSelect }).user;
  const { statementId, category, taxable } = req.query;

  if (statementId) {
    // Verify the requested statement belongs to this user before returning its transactions
    const sid = parseInt(statementId as string);
    const stmt = await getOwnedStatement(sid, user.id);
    if (!stmt) { res.status(404).json({ error: "Statement not found" }); return; }

    const conditions = [eq(transactionsTable.statementId, sid)];
    if (category) conditions.push(eq(transactionsTable.category, category as string));
    if (taxable !== undefined) conditions.push(eq(transactionsTable.taxable, taxable === "true"));

    const txns = await db.select().from(transactionsTable).where(and(...conditions));
    res.json(txns.map(t => ({ ...t, amount: Number(t.amount) })));
    return;
  }

  // No statementId filter: scope to the user's own statements via a join
  const rows = await db
    .select({ txn: transactionsTable })
    .from(transactionsTable)
    .innerJoin(statementsTable, eq(transactionsTable.statementId, statementsTable.id))
    .where(eq(statementsTable.userId, user.id));

  res.json(rows.map(r => ({ ...r.txn, amount: Number(r.txn.amount) })));
});

router.patch("/:id", async (req, res) => {
  const user = (req as unknown as { user: typeof usersTable.$inferSelect }).user;
  const id = parseInt(req.params.id);
  const parsed = UpdateTransactionBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid data" }); return; }

  // Verify the transaction belongs to the user (via its parent statement)
  const [existing] = await db
    .select({ txn: transactionsTable })
    .from(transactionsTable)
    .innerJoin(statementsTable, eq(transactionsTable.statementId, statementsTable.id))
    .where(and(eq(transactionsTable.id, id), eq(statementsTable.userId, user.id)))
    .limit(1);

  if (!existing) { res.status(404).json({ error: "Transaction not found" }); return; }

  const updates: Partial<typeof transactionsTable.$inferInsert> = {};
  if (parsed.data.category !== undefined) updates.category = parsed.data.category;
  if (parsed.data.taxable !== undefined) updates.taxable = parsed.data.taxable;
  if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes;

  const [updated] = await db
    .update(transactionsTable)
    .set(updates)
    .where(eq(transactionsTable.id, id))
    .returning();

  res.json({ ...updated, amount: Number(updated.amount) });
});

export default router;
