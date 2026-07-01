import { Router } from "express";
import { db } from "@workspace/db";
import { chatMessagesTable, taxCalculationsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth.js";
import { SendChatMessageBody } from "@workspace/api-zod";
import { randomBytes } from "crypto";

const router = Router();
router.use(requireAuth);

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

async function callGroq(messages: Array<{ role: string; content: string }>, systemPrompt: string): Promise<string> {
  if (!GROQ_API_KEY) {
    return "I'm your TaxPay assistant. To enable AI responses, please add a GROQ_API_KEY environment variable. In the meantime, I can tell you that your tax has been calculated using Nigeria's 2025 Personal Income Tax Act.";
  }

  const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: 512,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json() as { choices: Array<{ message: { content: string } }> };
  return data.choices[0]?.message?.content ?? "I couldn't generate a response. Please try again.";
}

function buildSystemPrompt(language: string, calcContext: string): string {
  const langInstructions: Record<string, string> = {
    en: "Respond in clear, simple English. Be warm and encouraging.",
    pidgin: "Respond in Nigerian Pidgin English. Be warm, friendly, and conversational. Use phrases like 'e easy', 'no wahala', 'na so e be'.",
    ha: "Respond in simple English but acknowledge the user's Hausa background. Be respectful and clear.",
    ig: "Respond in simple English but acknowledge the user's Igbo background. Be warm and encouraging.",
  };

  return `You are TaxPay Assistant — a helpful, warm AI assistant for Nigerian tax filers. ${langInstructions[language] || langInstructions.en}

IMPORTANT RULES:
- NEVER calculate tax yourself. All tax numbers come from our deterministic engine (Nigeria Tax Act 2025). Only EXPLAIN the numbers.
- You help users understand their tax breakdown, guide them through filing, and answer questions about Nigerian personal income tax.
- Be empathetic — tax can be stressful. Celebrate small wins ("You've already done the hard part!").
- Keep responses concise (2-4 sentences max per reply).
- If asked to calculate tax, say the engine has already done it and explain the result.

${calcContext}`;
}

router.get("/messages", async (req, res) => {
  const user = (req as unknown as { user: typeof usersTable.$inferSelect }).user;
  const { sessionId } = req.query;

  let msgs;
  if (sessionId) {
    msgs = await db.select().from(chatMessagesTable)
      .where(and(eq(chatMessagesTable.userId, user.id), eq(chatMessagesTable.sessionId, sessionId as string)));
  } else {
    msgs = await db.select().from(chatMessagesTable).where(eq(chatMessagesTable.userId, user.id));
  }
  res.json(msgs);
});

router.post("/messages", async (req, res) => {
  const user = (req as unknown as { user: typeof usersTable.$inferSelect }).user;
  const parsed = SendChatMessageBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request" }); return; }

  const { content, language, taxCalculationId } = parsed.data;
  const sessionId = parsed.data.sessionId || randomBytes(8).toString("hex");

  // Save user message
  await db.insert(chatMessagesTable).values({
    userId: user.id,
    sessionId,
    role: "user",
    content,
    language: language ?? "en",
  });

  // Build context from tax calculation if provided
  let calcContext = "";
  if (taxCalculationId) {
    const [calc] = await db.select().from(taxCalculationsTable).where(eq(taxCalculationsTable.id, taxCalculationId)).limit(1);
    if (calc) {
      calcContext = `Tax context: Gross income ₦${Number(calc.grossIncome).toLocaleString()}, Taxable income ₦${Number(calc.taxableIncome).toLocaleString()}, Tax liability ₦${Number(calc.taxLiability).toLocaleString()}, Effective rate ${(calc.effectiveRate * 100).toFixed(2)}%, Tax year ${calc.taxYear}.`;
    }
  }

  // Get recent conversation history
  const history = await db.select().from(chatMessagesTable)
    .where(and(eq(chatMessagesTable.userId, user.id), eq(chatMessagesTable.sessionId, sessionId)));

  const messages = history.slice(-10).map(m => ({ role: m.role, content: m.content }));

  // Call Groq
  const systemPrompt = buildSystemPrompt(language ?? "en", calcContext);
  const aiResponse = await callGroq(messages, systemPrompt);

  const [assistantMsg] = await db.insert(chatMessagesTable).values({
    userId: user.id,
    sessionId,
    role: "assistant",
    content: aiResponse,
    language: language ?? "en",
    contextType: taxCalculationId ? "tax_explanation" : "general",
  }).returning();

  res.json(assistantMsg);
});

export default router;
