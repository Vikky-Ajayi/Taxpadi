import { Router } from "express";
import { db } from "@workspace/db";
import { chatMessagesTable, taxCalculationsTable, usersTable } from "@workspace/db";
import { eq, and, asc } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth.js";
import { SendChatMessageBody } from "@workspace/api-zod";
import { randomBytes } from "crypto";

const router = Router();
router.use(requireAuth);

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

// ─── Groq LLM call ──────────────────────────────────────────────────────────

async function callGroq(
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string,
  maxTokens = 600
): Promise<string> {
  if (!GROQ_API_KEY) {
    return "I'm your TaxPay guide! To enable full AI responses, add a GROQ_API_KEY environment variable. Your tax calculation is ready — check the Tax tab to see your breakdown under the Nigeria Tax Act 2025.";
  }

  const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama3-70b-8192",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      max_tokens: maxTokens,
      temperature: 0.75,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return (
    data.choices[0]?.message?.content ??
    "I couldn't generate a response. Please try again."
  );
}

// ─── System prompt ───────────────────────────────────────────────────────────

function buildSystemPrompt(
  language: string,
  calcContext: string,
  isProactive = false
): string {
  const langInstructions: Record<string, string> = {
    en: `Respond in warm, clear English with Nigerian idioms and references where natural. 
         Use phrases like "no stress", "you've got this", "let's sort this out together".`,
    pidgin: `Respond FULLY in Nigerian Pidgin English — this is critical. 
         Use: "e easy", "no wahala", "na so e be", "abeg", "oga", "wetin", "how e dey go", 
         "e don do", "na im be that", "make we", "I go explain am". 
         Do NOT switch to English. Be warm, funny, and real.`,
    ha: `Respond in actual Hausa language. Be respectful (use "kai/ke" appropriately), 
         warm and encouraging. Use phrases like "babu matsala" (no problem), 
         "yana da sauki" (it is easy), "tare muna yi" (we'll do it together).`,
    ig: `Respond in actual Igbo language. Be warm and encouraging. 
         Use phrases like "ọ dị mma" (it's okay), "anyị ga-eme ya ọnụ" (we'll do it together), 
         "enweghị nsogbu" (no problem). Mix with some English where Igbo terms are unclear for tax topics.`,
  };

  const proactiveInstruction = isProactive
    ? `PROACTIVE MODE: The user hasn't responded in a while. Send a warm, brief check-in message.
       Keep it light — ask if they have any questions, share a quick Nigerian tax tip, 
       or remind them of something helpful. Do NOT repeat what was already discussed. Be concise (2-3 sentences).`
    : "";

  return `You are TaxPay — a warm, witty Nigerian tax companion, not just a chatbot. Think of yourself as that brilliant, trusted friend who genuinely understands Nigerian taxes and wants to make this easy for Nigerians.

PERSONALITY:
- Warm, encouraging, and conversational — like a brilliant older sibling who happens to know taxes
- You educate, not lecture. You meet people where they are
- You use real Nigerian cultural references naturally
- You celebrate small wins enthusiastically ("Yes! You're already ahead of 80% of Nigerians!")
- You NEVER make anyone feel stupid for not knowing tax stuff
- You're funny — light humour is welcome

LANGUAGE INSTRUCTION:
${langInstructions[language] || langInstructions.en}

CONVERSATION STAGES — guide the conversation through these naturally:
1. WELCOME & LANGUAGE: For brand-new conversations, greet warmly and confirm their preferred language
2. PROFILE BUILDING: Learn their work situation organically — "What kind of work do you do?" then follow-up. 
   Explore: employment type (salaried/freelance/business), income streams, investments, rental income, family situation (CRA relief). 
   Do NOT fire all questions at once — ONE question per message, weave them into conversation.
3. TAX EDUCATION: Ease them into their tax picture. Start with good news (reliefs, exemptions). 
   Normalize taxes — frame them as a national contribution, not a punishment.
4. ENGAGED: Answer specific questions, guide filing, explain their calculation.

FEAR DISPELLING — address these naturally when relevant:
- "FIRS will audit me" → Most individual filers are never audited. Filing actually PROTECTS you legally.
- "I don't earn enough" → The ₦800,000 personal relief means many Nigerians owe little or nothing.
- "Tax is too complicated" → That's literally what I'm here for. Step by step, together.
- "I'm a freelancer, tax doesn't apply" → Gently correct: self-employed income is taxable, but reliefs help reduce it.
- "The government doesn't use the money well" → Empathize, acknowledge frustration, then refocus on their personal legal protection.

MONO BANK CONNECT — when user wants to link their bank account or is asking about uploading statements via bank link:
- Explain that Mono lets them securely connect their Nigerian bank account directly
- Include the exact text [MONO_CONNECT] on its own line when you want to show the bank connect button
- Walk them through: what data is accessed (read-only transaction history), how it's secured, that it takes 2 minutes.
- Reassure: "It's like giving me read-only access — I can't move money."

IMPORTANT RULES:
- NEVER calculate tax yourself. All tax numbers come from TaxPay's deterministic engine (Nigeria Tax Act 2025). Only EXPLAIN the numbers.
- Keep replies conversational — 2–5 sentences max per reply, unless explaining something complex that requires more.
- ONE question per message maximum. Don't overwhelm.
- If they share personal details (job, income stream), ACKNOWLEDGE warmly before asking the next question.
- Never sound corporate, stiff, or like a FAQ page.

${calcContext ? `TAX CONTEXT FOR THIS USER:\n${calcContext}` : ""}
${proactiveInstruction}`;
}

// ─── Static greeting (no LLM needed — fired once on new session) ─────────────

function buildInitialGreeting(firstName: string, language: string): string {
  const name = firstName.split(" ")[0]; // first name only

  const greetings: Record<string, string> = {
    en: `Hey ${name}! 👋 I'm TaxPay — your personal Nigerian tax guide.

I'm here to make taxes feel less scary and way more manageable. We'll go through everything together, at your pace. No judgement, no jargon.

First things first — what language are you most comfortable chatting in?

🇬🇧 Type *English* or 1
🗣️ Type *Pidgin* or 2
🏛️ Type *Hausa* or 3
📿 Type *Igbo* or 4

P.S. You can also send 🎙️ voice notes in your language — just tap the mic button and speak!`,

    pidgin: `Heyy ${name}! 👋 Na me be TaxPay — your personal tax guy wey go help you sort everything out.

Tax no suppose dey stress anybody. We go do am together, step by step, no wahala.

First first — which language you wan use? Make I know how to yarn with you:

🇬🇧 Type *English* or 1
🗣️ Type *Pidgin* or 2
🏛️ Type *Hausa* or 3
📿 Type *Igbo* or 4

P.S. You fit send 🎙️ voice note sef — just press the mic button, yarn your language, I go understand!`,

    ha: `Sannu ${name}! 👋 Ni ne TaxPay — jagoran haraji naka na Najeriya.

Ba sai haraji ya zama mai wahala ba. Tare za mu yi shi, mataki-da-mataki, babu matsala.

Da farko — wane harshe kake son mu yi magana da shi?

🇬🇧 Type *English* ko 1
🗣️ Type *Pidgin* ko 2
🏛️ Type *Hausa* ko 3
📿 Type *Igbo* ko 4

P.S. Kuna iya aiko da 🎙️ sakon murya — danna maɓallin makirufo ka yi magana da harshinka!`,

    ig: `Nne/Nna ${name}! 👋 Abụ m TaxPay — onye nduzi ụtụ isi gị nke Nigeria.

Ụtụ isi ekwesịghị ịbụ ihe ịkpọ ọnụ. Anyị ga-eme ya ọnụ, nzọụkwụ site n'nzọụkwụ, enweghị nsogbu.

Nke mbụ — asụsụ ole ka ị chọrọ anyị si na ya ekwu okwu?

🇬🇧 Dee *English* ma ọ bụ 1
🗣️ Dee *Pidgin* ma ọ bụ 2
🏛️ Dee *Hausa* ma ọ bụ 3
📿 Dee *Igbo* ma ọ bụ 4

P.S. Ị nwekwara ike iziga 🎙️ ozi olu — pịa bọtịnụ maịkrofọnụ wee kwuo asụsụ gị!`,
  };

  return greetings[language] || greetings.en;
}

// ─── Detect language selection from user message ─────────────────────────────
// Uses strict matching only — no broad substring checks to avoid misclassification

function detectLanguageSelection(
  content: string
): "en" | "pidgin" | "ha" | "ig" | null {
  const trimmed = content.trim();
  const lower = trimmed.toLowerCase();

  // Exact number tokens
  if (trimmed === "1") return "en";
  if (trimmed === "2") return "pidgin";
  if (trimmed === "3") return "ha";
  if (trimmed === "4") return "ig";

  // Whole-word keyword matching (not substring)
  if (/^english$/i.test(lower)) return "en";
  if (/^pidgin$/i.test(lower)) return "pidgin";
  if (/^hausa$/i.test(lower)) return "ha";
  if (/^igbo$/i.test(lower)) return "ig";

  return null;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

router.get("/messages", async (req, res) => {
  const user = (req as unknown as { user: typeof usersTable.$inferSelect }).user;
  const { sessionId } = req.query;

  let msgs;
  if (sessionId) {
    msgs = await db
      .select()
      .from(chatMessagesTable)
      .where(
        and(
          eq(chatMessagesTable.userId, user.id),
          eq(chatMessagesTable.sessionId, sessionId as string)
        )
      )
      .orderBy(asc(chatMessagesTable.createdAt));
  } else {
    msgs = await db
      .select()
      .from(chatMessagesTable)
      .where(eq(chatMessagesTable.userId, user.id))
      .orderBy(asc(chatMessagesTable.createdAt));
  }

  // Auto-greet on brand-new session
  // Safe under concurrent requests: re-check after insert so duplicates from a race
  // just become a no-op — the first successful insert wins; subsequent GETs return it.
  if (sessionId && msgs.length === 0) {
    const greetingContent = buildInitialGreeting(user.fullName, user.language);
    try {
      await db.insert(chatMessagesTable).values({
        userId: user.id,
        sessionId: sessionId as string,
        role: "assistant",
        content: greetingContent,
        language: (user.language as "en" | "pidgin" | "ha" | "ig") ?? "en",
        contextType: "general",
      });
    } catch {
      // A concurrent request may have already inserted — re-fetch below handles it
    }
    // Always re-fetch so the response is consistent regardless of who inserted
    const fresh = await db
      .select()
      .from(chatMessagesTable)
      .where(
        and(
          eq(chatMessagesTable.userId, user.id),
          eq(chatMessagesTable.sessionId, sessionId as string)
        )
      )
      .orderBy(asc(chatMessagesTable.createdAt));
    res.json(fresh);
    return;
  }

  // Proactive message: if the last message was from the user and sent >4h ago,
  // generate a warm check-in. Guard: only trigger once per stale period by checking
  // that no assistant message was inserted in the last 4 hours.
  if (sessionId && msgs.length > 0) {
    const lastMsg = msgs[msgs.length - 1];
    const hoursSinceLast =
      (Date.now() - new Date(lastMsg.createdAt).getTime()) / (1000 * 60 * 60);
    const lastAssistantMsg = [...msgs].reverse().find((m) => m.role === "assistant");
    const hoursSinceAssistant = lastAssistantMsg
      ? (Date.now() - new Date(lastAssistantMsg.createdAt).getTime()) / (1000 * 60 * 60)
      : Infinity;

    // Only fire if: last msg is from user, >4h stale, and assistant hasn't spoken in >4h
    if (lastMsg.role === "user" && hoursSinceLast > 4 && hoursSinceAssistant > 4) {
      try {
        const recentHistory = msgs.slice(-6).map((m) => ({
          role: m.role,
          content: m.content,
        }));
        const proactiveContent = await callGroq(
          recentHistory,
          buildSystemPrompt(lastMsg.language || "en", "", true),
          200
        );
        const [inserted] = await db
          .insert(chatMessagesTable)
          .values({
            userId: user.id,
            sessionId: sessionId as string,
            role: "assistant",
            content: proactiveContent,
            language:
              (lastMsg.language as "en" | "pidgin" | "ha" | "ig") ?? "en",
            contextType: "general",
          })
          .returning();
        msgs = [...msgs, inserted];
      } catch {
        // Don't fail the GET request if proactive generation errors
      }
    }
  }

  res.json(msgs);
});

router.post("/messages", async (req, res) => {
  const user = (req as unknown as { user: typeof usersTable.$inferSelect }).user;
  const parsed = SendChatMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const { content, taxCalculationId } = parsed.data;
  const sessionId =
    parsed.data.sessionId || randomBytes(8).toString("hex");

  // Detect language selection from first user messages (e.g. "1", "English", "Pidgin")
  const detectedLang = detectLanguageSelection(content);

  // Use detected language if user just selected it, otherwise use provided or default
  const effectiveLanguage: "en" | "pidgin" | "ha" | "ig" =
    detectedLang ?? parsed.data.language ?? "en";

  // Save user message
  await db.insert(chatMessagesTable).values({
    userId: user.id,
    sessionId,
    role: "user",
    content,
    language: effectiveLanguage,
  });

  // Build tax context if provided — always scope by userId to prevent IDOR
  let calcContext = "";
  if (taxCalculationId) {
    const [calc] = await db
      .select()
      .from(taxCalculationsTable)
      .where(
        and(
          eq(taxCalculationsTable.id, taxCalculationId),
          eq(taxCalculationsTable.userId, user.id)
        )
      )
      .limit(1);
    if (calc) {
      calcContext = `This user's tax data: Gross income ₦${Number(calc.grossIncome).toLocaleString()}, Taxable income ₦${Number(calc.taxableIncome).toLocaleString()}, Tax liability ₦${Number(calc.taxLiability).toLocaleString()}, Effective rate ${(calc.effectiveRate * 100).toFixed(2)}%, Personal relief ₦${Number(calc.personalRelief).toLocaleString()}, Tax year ${calc.taxYear}. Reference these numbers when discussing their tax.`;
    }
  }

  // Fetch conversation history for this session
  const history = await db
    .select()
    .from(chatMessagesTable)
    .where(
      and(
        eq(chatMessagesTable.userId, user.id),
        eq(chatMessagesTable.sessionId, sessionId)
      )
    )
    .orderBy(asc(chatMessagesTable.createdAt));

  // Build message list for Groq (last 15 messages for context)
  const messages = history
    .slice(-15)
    .map((m) => ({ role: m.role, content: m.content }));

  // If user just selected a language, acknowledge warmly and continue
  let augmentedSystemPrompt = buildSystemPrompt(effectiveLanguage, calcContext);
  if (detectedLang) {
    augmentedSystemPrompt += `\n\nNOTE: The user just selected their preferred language (${detectedLang}). Acknowledge this warmly in that language, then ask a natural first question to get to know them (what kind of work they do).`;
  }

  // Call Groq
  const aiResponse = await callGroq(messages, augmentedSystemPrompt);

  const [assistantMsg] = await db
    .insert(chatMessagesTable)
    .values({
      userId: user.id,
      sessionId,
      role: "assistant",
      content: aiResponse,
      language: effectiveLanguage,
      contextType: taxCalculationId ? "tax_explanation" : "general",
    })
    .returning();

  res.json(assistantMsg);
});

export default router;
