import { Router } from "express";
import { db } from "@workspace/db";
import { paymentsTable, taxCalculationsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth.js";
import { CreatePaymentBody } from "@workspace/api-zod";
import { randomBytes } from "crypto";

const router = Router();
router.use(requireAuth);

// Nomba sandbox — generate a virtual account number
function generateVirtualAccount(): { accountNumber: string; bankName: string; accountName: string } {
  const accountNumber = "000" + Math.floor(1000000000 + Math.random() * 9000000000).toString().slice(0, 7);
  return {
    accountNumber,
    bankName: "Nomba MFB (Sandbox)",
    accountName: "TaxPay - FIRS Remittance",
  };
}

function serializePayment(p: typeof paymentsTable.$inferSelect) {
  return { ...p, amount: Number(p.amount) };
}

router.get("/", async (req, res) => {
  const user = (req as unknown as { user: typeof usersTable.$inferSelect }).user;
  const payments = await db.select().from(paymentsTable).where(eq(paymentsTable.userId, user.id));
  res.json(payments.map(serializePayment));
});

router.post("/", async (req, res) => {
  const user = (req as unknown as { user: typeof usersTable.$inferSelect }).user;
  const parsed = CreatePaymentBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request" }); return; }

  const [calc] = await db.select().from(taxCalculationsTable)
    .where(eq(taxCalculationsTable.id, parsed.data.taxCalculationId)).limit(1);
  if (!calc || calc.userId !== user.id) { res.status(404).json({ error: "Calculation not found" }); return; }

  const va = generateVirtualAccount();
  const reference = "TXPAY" + randomBytes(6).toString("hex").toUpperCase();

  const [payment] = await db.insert(paymentsTable).values({
    userId: user.id,
    taxCalculationId: calc.id,
    amount: calc.taxLiability,
    status: "pending",
    virtualAccountNumber: va.accountNumber,
    bankName: va.bankName,
    accountName: va.accountName,
    reference,
  }).returning();

  res.status(201).json(serializePayment(payment));
});

router.get("/:id", async (req, res) => {
  const user = (req as unknown as { user: typeof usersTable.$inferSelect }).user;
  const id = parseInt(req.params.id);
  const [payment] = await db.select().from(paymentsTable)
    .where(eq(paymentsTable.id, id)).limit(1);
  if (!payment || payment.userId !== user.id) { res.status(404).json({ error: "Not found" }); return; }
  res.json(serializePayment(payment));
});

router.post("/:id/confirm", async (req, res) => {
  const user = (req as unknown as { user: typeof usersTable.$inferSelect }).user;
  const id = parseInt(req.params.id);

  // Verify ownership before mutating
  const [existing] = await db.select().from(paymentsTable)
    .where(eq(paymentsTable.id, id)).limit(1);
  if (!existing || existing.userId !== user.id) { res.status(404).json({ error: "Not found" }); return; }

  const [payment] = await db.update(paymentsTable)
    .set({ status: "confirmed", paidAt: new Date() })
    .where(eq(paymentsTable.id, id))
    .returning();

  // Update tax calculation status to "paid"
  await db.update(taxCalculationsTable)
    .set({ status: "paid" })
    .where(eq(taxCalculationsTable.id, payment.taxCalculationId));

  res.json(serializePayment(payment));
});

export default router;
