import { Router } from "express";
import { db } from "@workspace/db";
import { statementsTable, transactionsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth.js";
import { parseStatementCSV, classifyTransaction } from "../lib/classifier.js";
import { CreateStatementBody } from "@workspace/api-zod";

const router = Router();

router.use(requireAuth);

type AuthReq = typeof import("express").Router & { user: typeof usersTable.$inferSelect };

router.get("/", async (req, res) => {
  const user = (req as unknown as { user: typeof usersTable.$inferSelect }).user;
  const statements = await db.select().from(statementsTable).where(eq(statementsTable.userId, user.id));
  res.json(statements.map(s => ({
    ...s,
    totalCredits: Number(s.totalCredits),
    totalDebits: Number(s.totalDebits),
  })));
});

router.post("/", async (req, res) => {
  const user = (req as unknown as { user: typeof usersTable.$inferSelect }).user;
  const parsed = CreateStatementBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid statement data" });
    return;
  }

  const { bankName, accountName, accountNumber, periodFrom, periodTo, rawData } = parsed.data;

  // Parse transactions from raw CSV data
  const parsedTxns = parseStatementCSV(rawData);
  const totalCredits = parsedTxns.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const totalDebits = parsedTxns.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stmtInsert: any = {
    userId: user.id,
    bankName,
    accountName,
    accountNumber,
    periodFrom,
    periodTo,
    status: "ready",
    transactionCount: parsedTxns.length,
    totalCredits: totalCredits.toFixed(2),
    totalDebits: totalDebits.toFixed(2),
    rawData: rawData ?? null,
  };
  const [stmt] = await db.insert(statementsTable).values(stmtInsert).returning();

  // Insert transactions
  if (parsedTxns.length > 0) {
    await db.insert(transactionsTable).values(
      parsedTxns.map(t => ({
        statementId: stmt.id,
        date: t.date,
        description: t.description,
        amount: t.amount.toFixed(2),
        type: t.type,
        category: t.category,
        taxable: t.taxable,
        confidence: t.confidence,
      }))
    );
  }

  res.status(201).json({ ...stmt, totalCredits: Number(stmt.totalCredits), totalDebits: Number(stmt.totalDebits) });
});

router.get("/:id", async (req, res) => {
  const user = (req as unknown as { user: typeof usersTable.$inferSelect }).user;
  const id = parseInt(req.params.id);
  const [stmt] = await db.select().from(statementsTable)
    .where(and(eq(statementsTable.id, id), eq(statementsTable.userId, user.id)));
  if (!stmt) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...stmt, totalCredits: Number(stmt.totalCredits), totalDebits: Number(stmt.totalDebits) });
});

router.delete("/:id", async (req, res) => {
  const user = (req as unknown as { user: typeof usersTable.$inferSelect }).user;
  const id = parseInt(req.params.id);
  // Verify ownership before deleting any data
  const [stmt] = await db.select().from(statementsTable)
    .where(and(eq(statementsTable.id, id), eq(statementsTable.userId, user.id))).limit(1);
  if (!stmt) { res.status(404).json({ error: "Not found" }); return; }
  await db.delete(transactionsTable).where(eq(transactionsTable.statementId, id));
  await db.delete(statementsTable).where(and(eq(statementsTable.id, id), eq(statementsTable.userId, user.id)));
  res.json({ message: "Deleted" });
});

export default router;
