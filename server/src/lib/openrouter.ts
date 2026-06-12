import { config } from "../config.js";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class AIUnavailableError extends Error {
  constructor(message = "AI service unavailable") {
    super(message);
  }
}

/**
 * Minimal OpenRouter client over the OpenAI-compatible chat completions API.
 * No SDK: one fetch, model fallback handled by OpenRouter's `models` routing.
 */
export async function chatCompletion(
  messages: ChatMessage[],
  opts: { json?: boolean; maxTokens?: number; temperature?: number } = {}
): Promise<string> {
  if (!config.openRouterKey) throw new AIUnavailableError("No API key configured");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${config.openRouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://guardng.app",
        "X-Title": "GuardNG",
      },
      body: JSON.stringify({
        model: config.models[0],
        models: config.models,
        messages,
        max_tokens: opts.maxTokens ?? 1024,
        temperature: opts.temperature ?? 0.4,
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new AIUnavailableError(`OpenRouter ${res.status}: ${body.slice(0, 200)}`);
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new AIUnavailableError("Empty completion");
    return content;
  } finally {
    clearTimeout(timer);
  }
}
