import { Router } from "express";

const router = Router();

/**
 * GET /api/whatsapp/webhook
 * Meta sends this to verify the callback URL. We must respond with
 * hub.challenge if hub.verify_token matches our secret.
 */
router.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (
    mode === "subscribe" &&
    token === process.env.WHATSAPP_VERIFY_TOKEN &&
    typeof challenge === "string"
  ) {
    console.log("WhatsApp webhook verified ✓");
    res.status(200).send(challenge);
  } else {
    console.warn("WhatsApp webhook verification failed", { mode, token });
    res.status(403).send("Forbidden");
  }
});

/**
 * POST /api/whatsapp/webhook
 * Meta delivers incoming messages here. We respond 200 immediately
 * (Meta requires a response within 20 s) then process asynchronously.
 */
router.post("/webhook", (req, res) => {
  // Acknowledge immediately so Meta doesn't retry
  res.status(200).send("OK");

  const body = req.body as Record<string, unknown>;
  if (body?.object !== "whatsapp_business_account") return;

  const entries = (body.entry as Array<Record<string, unknown>>) ?? [];
  for (const entry of entries) {
    const changes = (entry.changes as Array<Record<string, unknown>>) ?? [];
    for (const change of changes) {
      const value = change.value as Record<string, unknown> | undefined;
      const messages =
        (value?.messages as Array<Record<string, unknown>>) ?? [];
      for (const message of messages) {
        // TODO: pass to Groq + reply via WhatsApp Cloud API
        console.log("Incoming WhatsApp message:", JSON.stringify(message));
      }
    }
  }
});

export default router;
