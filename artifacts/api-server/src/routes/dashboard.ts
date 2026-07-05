import { Router } from "express";
import { db } from "@workspace/db";
import { taxCalculationsTable, paymentsTable, filingSessionsTable, transactionsTable, chatMessagesTable, statementsTable, usersTable } from "@workspace/db";
import { eq, desc, sum } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();
router.use(requireAuth);

router.get("/summary", async (req, res) => {
  const user = (req as unknown as { user: typeof usersTable.$inferSelect }).user;

  const [calcs, payments, sessions, msgs, stmts] = await Promise.all([
    db.select().from(taxCalculationsTable).where(eq(taxCalculationsTable.userId, user.id)).orderBy(desc(taxCalculationsTable.createdAt)),
    db.select().from(paymentsTable).where(eq(paymentsTable.userId, user.id)),
    db.select().from(filingSessionsTable).where(eq(filingSessionsTable.userId, user.id)),
    db.select().from(chatMessagesTable).where(eq(chatMessagesTable.userId, user.id)),
    db.select().from(statementsTable).where(eq(statementsTable.userId, user.id)),
  ]);

  const latestCalc = calcs[0];
  const totalTaxLiability = calcs.reduce((s, c) => s + Number(c.taxLiability), 0);
  const totalPaid = payments.filter(p => p.status === "confirmed").reduce((s, p) => s + Number(p.amount), 0);
  const pendingPayments = payments.filter(p => p.status === "pending").reduce((s, p) => s + Number(p.amount), 0);

  const completedFiling = sessions.find(s => s.status === "completed");
  const inProgressFiling = sessions.find(s => s.status === "in_progress");
  const filingStatus = completedFiling ? "completed" : inProgressFiling ? "in_progress" : "not_started";

  // Recent transactions (last 5)
  const recentTxns = latestCalc
    ? await db.select().from(transactionsTable)
        .where(eq(transactionsTable.statementId, latestCalc.statementId))
        .orderBy(desc(transactionsTable.date))
        .limit(5)
    : [];

  res.json({
    totalTaxLiability,
    totalPaid,
    pendingPayments,
    filingStatus,
    latestCalculation: latestCalc ? {
      ...latestCalc,
      grossIncome: Number(latestCalc.grossIncome),
      taxableIncome: Number(latestCalc.taxableIncome),
      personalRelief: Number(latestCalc.personalRelief),
      taxLiability: Number(latestCalc.taxLiability),
    } : null,
    statementsCount: stmts.length,
    messagesCount: msgs.length,
    recentTransactions: recentTxns.map(t => ({ ...t, amount: Number(t.amount) })),
  });
});

export default router;
