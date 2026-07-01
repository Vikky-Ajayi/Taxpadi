import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import statementsRouter from "./statements.js";
import transactionsRouter from "./transactions.js";
import taxRouter from "./tax.js";
import chatRouter from "./chat.js";
import paymentsRouter from "./payments.js";
import filingRouter from "./filing.js";
import dashboardRouter from "./dashboard.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/statements", statementsRouter);
router.use("/transactions", transactionsRouter);
router.use("/tax", taxRouter);
router.use("/chat", chatRouter);
router.use("/payments", paymentsRouter);
router.use("/filing", filingRouter);
router.use("/dashboard", dashboardRouter);

export default router;
