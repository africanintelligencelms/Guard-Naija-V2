import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { chatCompletion, AIUnavailableError, ChatMessage } from "../lib/openrouter.js";
import { INCIDENT_TYPES } from "../models/Incident.js";

const router = Router();
router.use(requireAuth);

const SAFETY_SYSTEM_PROMPT = `You are a calm, helpful safety advisor for Nigerian citizens using the GuardNG app.
Provide short, practical safety advice for the user's situation. Use plain language — many users have basic English literacy.
Never encourage taking the law into their own hands. If it sounds like an active emergency, tell them to use the app's SOS button or call 112 immediately.
Relevant hotlines: Police/Ambulance 112, Fire 199.
Be empathetic and culturally aware of the Nigerian context. Keep responses under 120 words.`;

router.post("/analyze", async (req, res, next) => {
  try {
    const description = String(req.body?.description || "").slice(0, 5000);
    if (!description.trim()) {
      return res.status(400).json({ error: "description is required" });
    }

    const raw = await chatCompletion(
      [
        {
          role: "system",
          content: `You categorize citizen security incident reports in Nigeria. Respond ONLY with JSON:
{"suggestedType": one of ${JSON.stringify(INCIDENT_TYPES)}, "severityScore": number 1-10, "summary": "concise 10-word summary", "keywords": ["key entities or threats"]}`,
        },
        { role: "user", content: description },
      ],
      { json: true, maxTokens: 300, temperature: 0.2 }
    );

    const data = JSON.parse(raw);
    const score = Math.max(1, Math.min(10, Number(data.severityScore) || 5));
    const severityLevel =
      score >= 8 ? "Critical" : score >= 6 ? "High" : score >= 4 ? "Medium" : "Low";

    res.json({
      suggestedType: INCIDENT_TYPES.includes(data.suggestedType)
        ? data.suggestedType
        : "Other",
      severityScore: score,
      severityLevel,
      summary: String(data.summary || "").slice(0, 300),
      keywords: Array.isArray(data.keywords) ? data.keywords.slice(0, 10) : [],
    });
  } catch (err) {
    if (err instanceof AIUnavailableError || err instanceof SyntaxError) {
      // AI is an enhancement, never a blocker — client falls back to manual entry
      return res.status(503).json({ error: "AI analysis unavailable" });
    }
    next(err);
  }
});

router.post("/chat", async (req, res, next) => {
  try {
    const history = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const messages: ChatMessage[] = [
      { role: "system", content: SAFETY_SYSTEM_PROMPT },
      ...history
        .slice(-10)
        .filter(
          (m: any) =>
            (m?.role === "user" || m?.role === "assistant") &&
            typeof m?.content === "string"
        )
        .map((m: any) => ({
          role: m.role,
          content: String(m.content).slice(0, 2000),
        })),
    ];
    if (messages.length < 2) {
      return res.status(400).json({ error: "messages required" });
    }
    const reply = await chatCompletion(messages, { maxTokens: 400 });
    res.json({ reply });
  } catch (err) {
    if (err instanceof AIUnavailableError) {
      return res.status(503).json({ error: "AI chat unavailable" });
    }
    next(err);
  }
});

export default router;
