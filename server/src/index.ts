import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import { config, assertConfig } from "./config.js";
import authRoutes from "./routes/auth.js";
import incidentRoutes from "./routes/incidents.js";
import userRoutes from "./routes/users.js";
import logRoutes from "./routes/logs.js";
import mediaRoutes from "./routes/media.js";
import aiRoutes from "./routes/ai.js";
import newsRoutes from "./routes/news.js";

assertConfig();

export const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin:
      config.corsOrigin === "*" ? true : config.corsOrigin.split(","),
  })
);
app.use(express.json({ limit: "1mb" }));

// Brute-force / cost protection on the sensitive surfaces
app.use(
  "/api/auth",
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true })
);
app.use(
  "/api/ai",
  rateLimit({ windowMs: 5 * 60 * 1000, limit: 30, standardHeaders: true })
);

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/news", newsRoutes);

app.use((_req, res) => res.status(404).json({ error: "Not found" }));

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err); // no PII in thrown messages by convention
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
);

async function main() {
  await mongoose.connect(config.mongoUri);
  console.log("✓ MongoDB connected");
  app.listen(config.port, () => {
    console.log(`✓ GuardNG API listening on :${config.port}`);
  });
}

// Allow importing `app` for tests without booting the server
if (process.env.NODE_ENV !== "test") {
  main().catch((err) => {
    console.error("Fatal startup error:", err);
    process.exit(1);
  });
}
