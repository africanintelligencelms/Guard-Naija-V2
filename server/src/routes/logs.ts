import { Router } from "express";
import { Log } from "../models/Log.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.post("/", async (req, res, next) => {
  try {
    const { action, details, role, type } = req.body || {};
    if (!action) return res.status(400).json({ error: "action is required" });
    await Log.create({ action, details, role, type });
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get("/", requireRole("admin"), async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 500);
    const logs = await Log.find().sort({ timestamp: -1 }).limit(limit);
    res.json(
      logs.map((l) => ({
        id: l._id.toString(),
        action: l.action,
        details: l.details,
        role: l.role,
        type: l.type,
        timestamp: l.timestamp,
      }))
    );
  } catch (err) {
    next(err);
  }
});

export default router;
