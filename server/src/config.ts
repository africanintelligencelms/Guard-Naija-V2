export const config = {
  port: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/guardng",
  jwtSecret: process.env.JWT_SECRET || "",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  openRouterKey: process.env.OPENROUTER_API_KEY || "",
  // Primary model first; the rest are automatic fallbacks via OpenRouter's
  // `models` routing if a provider is down or deprecates a model.
  models: [
    process.env.OPENROUTER_MODEL || "anthropic/claude-haiku-4.5",
    "openai/gpt-4o-mini",
    "meta-llama/llama-3.3-70b-instruct",
  ],
  isProd: process.env.NODE_ENV === "production",
};

export function assertConfig() {
  if (!config.jwtSecret) {
    if (config.isProd) {
      throw new Error("JWT_SECRET must be set in production");
    }
    console.warn("⚠ JWT_SECRET not set — using insecure dev secret");
    config.jwtSecret = "dev-only-insecure-secret";
  }
  if (!config.openRouterKey) {
    console.warn("⚠ OPENROUTER_API_KEY not set — AI endpoints run in mock mode");
  }
}
